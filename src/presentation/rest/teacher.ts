import { Student } from '@domain/student/Student.js'
import { TeacherUpdateSchema } from '@domain/teacher/types.js'
import { TeacherCreationSchema } from '@domain/teacher/types.js'
import { ClassService } from '@service/ClassService.js'
import { StudentService } from '@service/StudentService.js'
import { TeacherService } from '@service/TeacherService.js'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { onlyIdParam } from './index.js'

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
			'/',
			{ schema: { body: TeacherCreationSchema.omit({ id: true }) } },
			async (req, res) => {
				const teacherEntity = teacherService.create(req.body)

				return res.status(201).send(teacherEntity.toObject())
			},
		)

		router.get('/', async (_, res) => {
			return res.send(
				teacherService
					.listAll()
					.map((teacherEntity) => teacherEntity.toObject()),
			)
		})

		router.get('/:id', onlyIdParam, async (req, res) => {
			const { id } = req.params

			const teacherEntity = teacherService.findById(id)
			return res.send(teacherEntity.toObject())
		})

		router.put(
			'/:id',
			{
				schema: {
					body: TeacherUpdateSchema,
					params: onlyIdParam.schema.params,
				},
			},
			async (req, res) => {
				const { id } = req.params

				const updated = teacherService.update(id, req.body)
				res.send(updated.toObject())
			},
		)

		router.get('/:id/studens', onlyIdParam, async (req, res) => {
			const { id } = req.params
			teacherService.findById(id)

			const classes = classService.listBy('teacher', id)
			if (classes.length === 0) {
				return res.send([])
			}

			let totalStudents: Student[] = []
			for (const classEntity of classes) {
				const students = studentService.listBy('class', classEntity.id)
				totalStudents = [...totalStudents, ...students]
			}

			return res.send(
				totalStudents.map((studentEntity) => studentEntity.toObject()),
			)
		})

		router.get('/:id/classes', onlyIdParam, async (req, res) => {
			const { id } = req.params
			teacherService.findById(id)

			const classes = classService.listBy('teacher', id)

			res.send(classes.map((classEntity) => classEntity.toObject()))
		})

		done()
	}
}
