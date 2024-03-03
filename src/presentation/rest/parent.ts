import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	ParentCreationSchema,
	ParentUpdateSchema,
} from '../../domain/parent/types.js'
import { ParentService } from '../../service/ParentService.js'
import { StudentService } from '../../service/StudentService.js'
import { onlyIdParam, queryPage } from './index.js'

export function parentRouterFactory(
	parentService: ParentService,
	studentService: StudentService,
) {
	return (
		app: FastifyInstance,
		_: FastifyPluginOptions,
		done: (err?: Error) => void,
	) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			'/',
			{ schema: { body: ParentCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const parent = await parentService.create(req.body)
				return res.status(201).send(parent.toObject())
			},
		)

		router.get(
			'/',
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const parents = await parentService.list({
					page: Number(req.query.page),
				})
				return res.send(parents.map((p) => p.toObject()))
			},
		)

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const parentEntity = await parentService.findById(id)
			const students = (await studentService.listBy('parents', [id])).map((s) =>
				s.toObject(),
			)
			return res.send({ ...parentEntity.toObject(), students: students })
		})

		router.put(
			'/:id',
			{
				schema: { body: ParentUpdateSchema, params: onlyIdParam.schema.params },
			},
			async (req, res) => {
				const { id } = req.params

				const updated = await parentService.update(id, req.body)
				return res.send(updated.toObject())
			},
		)

		router.delete('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const students = await studentService.listBy('parents', [id])
			if (students.length > 0) {
				return res.code(403).send({
					status: 403,
					code: 'PARENT_HAS_STUDENTS',
					error: 'Forbidden',
					message: 'Cannot delete parent because it has students assigned',
				})
			}

			parentService.remove(id)
			return res.status(204).send()
		})

		router.get('/:id/students', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const students = await studentService.listBy('parents', [id])
			return res.send(students.map((s) => s.toObject()))
		})

		router.patch(
			'/:id/phones',
			{
				schema: {
					params: onlyIdParam.schema.params,
					body: ParentUpdateSchema.pick({ phones: true }),
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { phones } = req.body

				const updated = await parentService.updatePhone(id, phones)
				return res.send(updated.toObject())
			},
		)

		done()
	}
}
