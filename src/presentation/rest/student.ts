import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
	StudentCreationSchema,
	StudentUpdateSchema,
} from '../../domain/student/types.js'
import { ClassService } from '../../service/ClassService.js'
import { StudentService } from '../../service/StudentService.js'
import { StudentAndParentId, onlyIdParam, queryPage } from './index.js'

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
				const student = await studentService.create(req.body)
				const Class = await classService.findById(req.body.class)

				return res
					.status(201)
					.send({ ...student.toObject(), class: Class.toObject() })
			},
		)

		router.get(
			'/',
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const students = await studentService.list({
					page: Number(req.query.page),
				})

				return res.send(students.map((s) => s.toObject()))
			},
		)

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const student = await studentService.findById(id)
			const Class = (await classService.listBy('id', student.class)).map((c) =>
				c.toObject(),
			)

			return res.send({ ...student.toObject(), class: Class })
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
				const updated = await studentService.update(id, req.body)

				return res.send({
					...updated.toObject(),
				})
			},
		)

		router.delete('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			studentService.remove(id)

			return res.status(204).send()
		})

		router.get('/:id/parents', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const parents = (await studentService.getParents(id)).map((p) =>
				p.toObject(),
			)

			return res.send(parents)
		})

		router.delete(
			'/:id/parents/:parentId',
			StudentAndParentId,
			async (req, res) => {
				const { id, parentId } = req.params
				studentService.unlinkParent(id, [parentId])
				return res.status(204).send()
			},
		)

		router.patch(
			'/:id/parents',
			{
				schema: {
					body: StudentUpdateSchema.pick({ parents: true }).required(),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { parents } = req.body

				const updated = await studentService.linkParents(id, parents)
				return res.send(updated.toObject())
			},
		)

		router.patch(
			'/:id/medications',
			{
				schema: {
					body: StudentUpdateSchema.pick({ medications: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { medications } = req.body

				const updated = await studentService.updateMedications(id, medications)
				return res.send(updated.toObject())
			},
		)

		router.delete(
			'/:id/medications',
			{
				schema: {
					body: StudentUpdateSchema.pick({ medications: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { medications } = req.body

				if (!medications) {
					return res.code(400).send({
						message: 'medications is required',
					})
				}

				await studentService.removeMedications(id, medications)
				return res.status(204).send()
			},
		)

		done()
	}
}
