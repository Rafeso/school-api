import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import {
	ParentCreationSchema,
	ParentUpdateSchema,
} from "../../domain/parent/types.js"
import type { ParentService } from "../../service/ParentService.js"
import type { StudentService } from "../../service/StudentService.js"
import { onlyIdParam, queryPage } from "./index.js"

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
			"/",
			{ schema: { body: ParentCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const { address, document, emails, firstName, phones, surname } =
					req.body
				const parent = await parentService.create({
					address: address,
					document: document,
					emails: emails,
					firstName: firstName,
					phones: phones,
					surname: surname,
				})
				return res.status(201).send(parent.toObject())
			},
		)

		router.get(
			"/",
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const { page, per_page } = req.query
				const parents = await parentService.list({
					page: page ?? 1,
					per_page: per_page ?? 20,
				})

				return res.send(parents.map((p) => p.toObject()))
			},
		)

		router.get("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params

			const parentEntity = await parentService.findById(id)

			return res.send(parentEntity.toObject())
		})

		router.put(
			"/:id",
			{
				schema: {
					body: ParentUpdateSchema.omit({ document: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { address, emails, firstName, phones, surname } = req.body

				// Os campos devem ser passados explicitamente para evitar mass assignment.
				const updated = await parentService.update(id, {
					address: address,
					emails: emails,
					firstName: firstName,
					phones: phones,
					surname: surname,
				})
				return res.send(updated.toObject())
			},
		)

		router.delete("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const students = await studentService.listBy("parents", [id])
			if (students.length > 0) {
				return res.code(409).send({
					code: "CONFLICT",
					name: "ParentError",
					message: "Cannot delete parent because it has students assigned.",
				})
			}

			parentService.remove(id)
			return res.status(204).send()
		})

		router.get("/:id/students", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const students = await studentService.listBy("parents", [id])
			return res.send(students.map((s) => s.toObject()))
		})

		done()
	}
}
