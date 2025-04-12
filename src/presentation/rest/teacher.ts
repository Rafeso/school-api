import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import type { Student } from "../../domain/student/Student.js"
import {
	TeacherCreationSchema,
	TeacherUpdateSchema,
} from "../../domain/teacher/types.js"
import type { ClassService } from "../../service/ClassService.js"
import type { StudentService } from "../../service/StudentService.js"
import type { TeacherService } from "../../service/TeacherService.js"
import { onlyIdParam, queryPage } from "./index.js"

export function teacherRouterFactory(
	teacherService: TeacherService,
	classService: ClassService,
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
			{ schema: { body: TeacherCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const teacher = await teacherService.create(req.body)

				return res.status(201).send(teacher.toObject())
			},
		)

		router.get(
			"/",
			{ schema: { querystring: queryPage.schema.querystring } },
			async (req, res) => {
				const { page, per_page } = req.query
				const teachers = await teacherService.list({
					page: page ?? 1,
					per_page: per_page ?? 20,
				})

				return res.send(teachers.map((t) => t.toObject()))
			},
		)

		router.get("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params

			const teacher = await teacherService.findById(id)

			return res.send({ ...teacher.toObject() })
		})

		router.get("/:id/students", onlyIdParam, async (req, res) => {
			const { id } = req.params
			teacherService.findById(id)

			const classes = await classService.listBy("teacher", id)
			if (classes.length === 0) {
				return res.send([])
			}

			let totalStudents: Student[] = []
			for (const Class of classes) {
				const students = await studentService.listBy("class", Class.id)
				totalStudents = [...totalStudents, ...students]
			}

			return res.send(totalStudents.map((s) => s.toObject()))
		})

		router.get("/:id/classes", onlyIdParam, async (req, res) => {
			const { id } = req.params
			teacherService.findById(id)

			const classes = await classService.listBy("teacher", id)

			res.send(classes.map((c) => c.toObject()))
		})

		router.put(
			"/:id",
			{
				schema: {
					body: TeacherUpdateSchema.omit({ document: true, hiringDate: true }),
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params
				const { firstName, surname, email, phone, salary, major } = req.body
				// Os campos devem ser passados explicitamente para evitar mass assignment.
				const updated = await teacherService.update(id, {
					firstName: firstName,
					surname: surname,
					email: email,
					phone: phone,
					salary: salary,
					major: major,
				})
				res.send(updated.toObject())
			},
		)

		router.delete("/:id", onlyIdParam, async (req, res) => {
			const { id } = req.params
			const classes = await classService.listBy("teacher", id)

			for (const classEntity of classes) {
				classService.update(classEntity.id, { teacher: null })
			}

			return res.status(204).send(teacherService.remove(id))
		})

		done()
	}
}
