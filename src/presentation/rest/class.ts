import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import {
	ClassCreationSchema,
	ClassUpdateSchema,
} from "../../domain/class/types.js"
import type { ClassService } from "../../service/ClassService.js"
import type { TeacherService } from "../../service/TeacherService.js"
import { onlyIdParam, queryPage } from "./index.js"

export function classRouterFactory(classService: ClassService) {
	return (
		app: FastifyInstance,
		_: FastifyPluginOptions,
		done: (err?: Error) => void,
	) => {
		const router = app.withTypeProvider<ZodTypeProvider>()

		router.post(
			"/",
			{ schema: { body: ClassCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const { code, teacher } = req.body
				const classEntity = await classService.create({
					code: code,
					teacher: teacher,
				})

				return res.status(201).send(classEntity.toObject())
			},
		)

		router.get(
			"/",
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const { page, per_page } = req.query
				const classEntities = await classService.list({
					page: page ?? 1,
					per_page: per_page ?? 20,
				})

				return res.send(classEntities.map((c) => c.toObject()))
			},
		)

		router.get("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const Class = await classService.findById(id)

			return res.send({
				...Class.toObject(),
			})
		})

		router.put(
			"/:id",
			{
				schema: {
					body: ClassUpdateSchema,
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { teacher, code } = req.body

				// Os campos devem ser passados explicitamente para evitar mass assignment.
				const updated = await classService.update(id, {
					code: code,
					teacher: teacher,
				})

				return res.send(updated.toObject())
			},
		)

		router.delete("/:id", onlyIdParam, async (req, res) => {
			classService.remove(req.params.id)
			return res.status(204).send()
		})

		router.get("/:id/teacher", onlyIdParam, async (req, res) => {
			const { id } = req.params

			const teacher = await classService.getTeacher(id)
			return res.send(teacher.toObject())
		})

		router.get("/:id/students", onlyIdParam, async (req, res) => {
			const { id } = req.params

			const students = await classService.getStudent(id)

			return res.send(students.map((student) => student.toObject()))
		})

		done()
	}
}
