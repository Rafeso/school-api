import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	StudentCreationSchema,
	StudentUpdateSchema,
} from '../../domain/student/types.js'
import { ClassService } from '../../service/ClassService.js'
import { StudentService } from '../../service/StudentService.js'
import { onlyIdParam } from './index.js'

export function studentRouterFactory(
	studentService: StudentService,
	classService: ClassService,
) {
	return (
		app: FastifyInstance,
		_: FastifyPluginOptions,
		done: (err?: Error) => void,
	) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			'/',
			{ schema: { body: StudentCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const studentEntity = studentService.create(req.body).toObject()
				const classEntity = classService.findById(req.body.class).toObject()

				return res.status(201).send({ studentEntity, classEntity })
			},
		)

		router.get('/', async (_, res) => {
			const students = studentService.listAll()
			return res.send(
				students.map((studentEntity) => {
					const classEntity = classService
						.findById(studentEntity.class)
						.toObject()

					return {
						...studentEntity.toObject(),
						classEntity,
					}
				}),
			)
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const student = studentService.findById(id).toObject()
			const classEntity = classService.findById(student.class).toObject()

			return res.send({ student, classEntity })
		})

		router.put(
			'/:id',
			{
				schema: {
					body: StudentUpdateSchema,
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const updated = studentService.update(id, req.body).toObject()
				const classEntity = classService.findById(updated.class).toObject()

				return res.send({ updated, classEntity })
			},
		)

		router.delete('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			studentService.remove(id)

			return res.status(204).send()
		})

		router.get('/:id/parents', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const parents = studentService.getParents(id)

			return res.send(parents.map((parentEntity) => parentEntity.toObject()))
		})

		router.patch(
			'/:id/parents',
			{
				schema: {
					body: StudentCreationSchema.pick({ parents: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { parents } = req.body
				const updated = studentService.linkParents(id, parents).toObject()
				const classEntity = classService.findById(updated.class).toObject()

				return res.send({ updated, classEntity })
			},
		)

		done()
	}
}
