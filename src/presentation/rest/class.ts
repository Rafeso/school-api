import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClassCreationSchema, ClassUpdateSchema } from '../../domain/class/types.js'
import { ClassService } from '../../service/ClassService.js'
import { TeacherService } from '../../service/TeacherService.js'
import { onlyIdParam } from './index.js'

export function classRouterFactory(classService: ClassService, teacherService: TeacherService) {
	return (app: FastifyInstance, _: FastifyPluginOptions, done: (err?: Error) => void) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post('/', { schema: { body: ClassCreationSchema.omit({ id: true }) } }, async (req, res) => {
			const classEntity = (await classService.create(req.body)).toObject()
			const teacherEntity = (await teacherService.findById(classEntity.teacher)).toObject()

			return res.status(201).send({ classEntity, teacherEntity })
		})

		router.get('/', async (_, res) => {
			const classEntities = await classService.listAll()

			return res.send(classEntities.map(async (Class) => Class.toObject()))
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const classEntity = (await classService.findById(id)).toObject()
			const teacher = (await teacherService.findById(classEntity.teacher)).toObject()

			return res.send({
				classEntity,
				teacher: teacher,
			})
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
				const updated = await classService.update(id, req.body)
				const teacher = await teacherService.findById(updated.teacher)

				return res.send({
					...updated.toObject(),
					teacher: teacher,
				})
			},
		)

		router.delete('/:id', onlyIdParam, async (req, res) => {
			classService.remove(req.params.id)
			return res.status(204).send()
		})

		router.get('/:id/teacher', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const teacher = await classService.getTeacher(id)
			return res.send(teacher.toObject())
		})

		done()
	}
}
