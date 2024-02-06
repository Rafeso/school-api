import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ParentCreationSchema, ParentUpdateSchema } from '../../domain/parent/types.js'
import { ParentService } from '../../service/ParentService.js'
import { StudentService } from '../../service/StudentService.js'
import { onlyIdParam } from './index.js'

export function parentRouterFactory(parentService: ParentService, studentService: StudentService) {
	return (app: FastifyInstance, _: FastifyPluginOptions, done: (err?: Error) => void) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			'/',
			{ schema: { body: ParentCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const parent = await parentService.create(req.body)
				return res.status(201).send(parent.toObject())
			},
		)

		router.get('/', async (_, res) => {
			const parents = await parentService.list()
			return res.send(parents.map((p) => p.toObject()))
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const parentEntity = await parentService.findById(id)
			return res.send(parentEntity.toObject())
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
					message: `Cannot delete parent with id ${id} because it has students assigned`,
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
			'/:id/emails',
			{
				schema: {
					params: onlyIdParam.schema.params,
					body: ParentUpdateSchema.pick({ emails: true }),
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { emails } = req.body

				if (!emails) {
					return res.code(400).send({
						message: 'Emails is required',
					})
				}

				const updated = await parentService.updateEmail(id, [...emails])
				return res.send(updated.toObject())
			},
		)

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

				if (!phones) {
					return res.code(400).send({
						message: 'Phones is required',
					})
				}

				const updated = await parentService.updatePhone(id, [...phones])
				return res.send(updated.toObject())
			},
		)

		router.patch(
			'/:id/address',
			{
				schema: {
					params: onlyIdParam.schema.params,
					body: ParentUpdateSchema.pick({ address: true }),
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { address } = req.body

				if (!address) {
					return res.code(400).send({
						message: 'Address is required',
					})
				}

				const updated = await parentService.updateAddress(id, [...address])
				return res.send(updated.toObject())
			},
		)

		done()
	}
}
