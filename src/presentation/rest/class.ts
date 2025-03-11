import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	ClassCreationSchema,
	ClassUpdateSchema,
} from '../../domain/class/types.js'
import { ClassService } from '../../service/ClassService.js'
import { TeacherService } from '../../service/TeacherService.js'
import { onlyIdParam, queryPage } from './index.js'

export function classRouterFactory(
	classService: ClassService,
	teacherService: TeacherService,
) {
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
				const Class = await classService.create(req.body)

				return res.status(201).send(Class.toObject())
			},
		)

		router.get(
			'/',
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const classEntities = await classService.list({
					page: Number(req.query.page),
				})
				return res.send(classEntities.map((c) => c.toObject()))
			},
		)

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const Class = await classService.findById(id)

			return res.send({
				...Class.toObject(),
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

				return res.send(updated.toObject())
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
