import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	ClassCreationSchema,
	ClassUpdateSchema,
} from '../../domain/class/types.js'
import { ClassService } from '../../service/ClassService.js'
import { onlyIdParam } from './index.js'

export function classRouterFactory(classService: ClassService) {
	return (
		app: FastifyInstance,
		_: FastifyPluginOptions,
		done: (err?: Error) => void,
	) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			'/',
			{ schema: { body: ClassCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const classEntity = classService.create(req.body)
				return res.status(201).send(classEntity.toObject())
			},
		)

		router.get('/', async (_, res) => {
			return res.send(
				classService.listAll().map((classEntity) => classEntity.toObject()),
			)
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const classEntity = classService.findById(id)
			return res.send(classEntity.toObject())
		})

		router.put(
			'/:id',
			{
				schema: {
					body: ClassUpdateSchema,
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params

				const updated = classService.update(id, req.body)
				return res.send(updated.toObject())
			},
		)

		router.delete('/:id', onlyIdParam, async (req, res) => {
			classService.remove(req.params.id)
			return res.status(204).send()
		})

		router.get('/:id/teacher', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const teacher = classService.getTeacher(id)
			return res.send(teacher.toObject())
		})

		done()
	}
}
