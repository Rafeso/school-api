import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StudentCreationSchema, StudentUpdateSchema } from '../../domain/student/types.js'
import { ClassService } from '../../service/ClassService.js'
import { StudentService } from '../../service/StudentService.js'
import { StudentAndParentId, onlyIdParam } from './index.js'

export function studentRouterFactory(studentService: StudentService, classService: ClassService) {
	return (app: FastifyInstance, _: FastifyPluginOptions, done: (err?: Error) => void) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post('/', { schema: { body: StudentCreationSchema.omit({ id: true }) } }, async (req, res) => {
			const studentEntity = await studentService.create(req.body)
			const classEntity = await classService.findById(req.body.class)

			return res.status(201).send({ ...studentEntity.toObject(), Class: classEntity.toObject() })
		})

		router.get('/', async (_, res) => {
			const students = await studentService.listAll()
			return res.send(students.map((studentEntity) => studentEntity.toObject()))
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params
			const student = await studentService.findById(id)

			return res.send(student.toObject())
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
				const classEntity = await classService.findById(updated.class)

				return res.send({
					...updated.toObject(),
					Class: classEntity.toObject(),
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
			const parents = await studentService.getParents(id)

			return res.send(parents.map((parentEntity) => parentEntity.toObject()))
		})

		router.delete('/:id/parents/:parentId', StudentAndParentId, async (req, res) => {
			const { id, parentId } = req.params
			studentService.unlinkParent(id, [parentId])

			const checkIfisTheOnlyParent = await studentService.getParents(id)
			if (checkIfisTheOnlyParent.length === 1) {
				return res.code(409).send({
					message: `Cannot delete parent with id ${parentId} because studends must have at least one parent`,
				})
			}
			return res.status(204).send()
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

				if (!parents) {
					return res.code(400).send({ message: 'Parents is required' })
				}

				const updated = await studentService.linkParents(id, parents)

				return res.send(updated.toObject())
			},
		)

		router.patch(
			'/:id/allergies',
			{
				schema: {
					body: StudentCreationSchema.pick({ allergies: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { allergies } = req.body

				if (!allergies) {
					return res.code(400).send({ message: 'Allergies is required' })
				}

				const updated = await studentService.updateAllergies(id, allergies)
				return res.send(updated.toObject())
			},
		)

		router.patch(
			'/:id/medications',
			{
				schema: {
					body: StudentCreationSchema.pick({ medications: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { medications } = req.body

				if (!medications) {
					return res.code(400).send({ message: 'Medications is required' })
				}

				const updated = await studentService.updateMedications(id, medications)
				return res.send(updated.toObject())
			},
		)

		done()
	}
}
