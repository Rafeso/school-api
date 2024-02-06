import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClassCreationSchema, ClassUpdateSchema } from '../../domain/class/types.js'
import { ClassService } from '../../service/ClassService.js'
import { TeacherService } from '../../service/TeacherService.js'
import { onlyIdParam } from './index.js'

export function classRouterFactory(classService: ClassService, teacherService: TeacherService) {
	return (app: FastifyInstance, _: FastifyPluginOptions, done: (err?: Error) => void) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			'/',
			{ schema: { body: ClassCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const Class = await classService.create(req.body)

				return res.status(201).send(Class.toObject())
			},
		)

		router.get('/', async (_, res) => {
			const classEntities = await classService.list()
			return res.send(classEntities.map((c) => c.toObject()))
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const Class = await classService.findById(id)
			const teacher = await teacherService.findById(Class.teacher)

			return res.send({
				...Class.toObject(),
				teacher: teacher.toObject(),
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
