import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import {
	StudentCreationSchema,
	type StudentCreationType,
	StudentUpdateSchema,
} from "../../domain/student/types.js"
import type { StudentService } from "../../service/StudentService.js"
import { StudentAndParentId, onlyIdParam, queryPage } from "./index.js"

export function studentRouterFactory(studentService: StudentService) {
	return (
		app: FastifyInstance,
		_: FastifyPluginOptions,
		done: (err?: Error) => void,
	) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			"/",
			{ schema: { body: StudentCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const {
					parents,
					allergies,
					bloodType,
					medications,
					startDate,
					class: classId,
					birthDate,
					document,
					firstName,
					surname,
				} = req.body
				const student = await studentService.create({
					firstName: firstName,
					allergies: allergies,
					surname: surname,
					bloodType: bloodType,
					medications: medications,
					startDate: startDate,
					class: classId,
					birthDate: birthDate,
					document: document,
					// Criamos um Set para cerificar que nao ha repeticao no array de parents.
					parents: [...new Set(parents)] as StudentCreationType["parents"],
				})

				return res.status(201).send(student.toObject())
			},
		)

		router.get(
			"/",
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const { page, per_page } = req.query
				const students = await studentService.list({
					page: page ?? 1,
					per_page: per_page ?? 20,
				})

				return res.send(students.map((s) => s.toObject()))
			},
		)

		router.get("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const student = await studentService.findById(id)

			return res.send(student.toObject())
		})

		router.get("/:id/parents", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const parents = await studentService.getParents(id)

			return res.send(parents.map((p) => p.toObject()))
		})

		router.patch(
			"/:id/parents",
			{
				schema: {
					body: StudentCreationSchema.pick({ parents: true }),
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

		router.put(
			"/:id",
			{
				schema: {
					body: StudentUpdateSchema.omit({ parents: true, document: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const {
					allergies,
					bloodType,
					medications,
					startDate,
					class: classId,
					birthDate,
					firstName,
					surname,
				} = req.body
				// Os campos devem ser passados explicitamente para evitar mass assignment.
				const updated = await studentService.update(id, {
					firstName: firstName,
					surname: surname,
					allergies: allergies,
					bloodType: bloodType,
					medications: medications,
					startDate: startDate,
					class: classId,
					birthDate: birthDate,
				})

				return res.send(updated.toObject())
			},
		)

		router.delete("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params
			await studentService.remove(id)

			return res.status(204).send()
		})

		router.delete(
			"/:id/parents/:parentId",
			StudentAndParentId,
			async (req, res) => {
				const { id, parentId } = req.params
				await studentService.unlinkParent(id, [parentId])
				return res.status(204).send()
			},
		)

		done()
	}
}
