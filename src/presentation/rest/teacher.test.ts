import assert from "node:assert"
import { type TestContext, describe, it } from "node:test"
import fastify from "fastify"
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { date } from "zod"
import { ConflictError } from "../../domain/@errors/Conflict.js"
import { NotFoundError } from "../../domain/@errors/NotFound.js"
import type { Class } from "../../domain/class/Class.js"
import type { ClassUpdateType } from "../../domain/class/types.js"
import type { Student } from "../../domain/student/Student.js"
import { Teacher } from "../../domain/teacher/Teacher.js"
import type {
	TeacherCreationType,
	TeacherUpdateType,
} from "../../domain/teacher/types.js"
import type { ClassService } from "../../service/ClassService.js"
import type { StudentService } from "../../service/StudentService.js"
import type { TeacherService } from "../../service/TeacherService.js"
import {
	dummyClass,
	dummyStudent,
	dummyTeacher,
	teacherId,
} from "../../utils/fixtures/mocks.js"
import { errorHandler } from "./handlers/error-handler.js"
import { teacherRouterFactory } from "./teacher.js"

const teacherServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof TeacherService]?: ReturnType<TeacherService[T]>
	} = {},
) => ({
	create: t.mock.fn(
		(_teacher: TeacherCreationType) =>
			methodReturns.create ?? dummyTeacher(_teacher),
	),
	update: t.mock.fn(
		(id: string, values: TeacherUpdateType) =>
			methodReturns.update ?? dummyTeacher({ ...values, id: id }),
	),
	findById: t.mock.fn(
		(id: string) => methodReturns.findById ?? dummyTeacher({ id: id }),
	),
	remove: t.mock.fn((_id: string) => methodReturns.remove ?? t.mock.fn()),
	list: t.mock.fn(() => methodReturns.list ?? [dummyTeacher()]),
})

const studentServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof StudentService]?: ReturnType<StudentService[T]>
	} = {},
) => ({
	listBy: t.mock.fn(
		(_prop: string, _value: string) => methodReturns.listBy ?? [dummyStudent()],
	),
})

const classServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof ClassService]?: ReturnType<ClassService[T]>
	} = {},
) => ({
	listBy: t.mock.fn(
		(_prop: string, _value: string) => methodReturns.listBy ?? [dummyClass()],
	),
	update: t.mock.fn(
		(_id: string, _values: ClassUpdateType) =>
			methodReturns.update ?? dummyClass({ ..._values, id: _id }),
	),
})

function getApp(
	teacherService: TeacherService,
	classService: ClassService,
	studentService: StudentService,
) {
	const app = fastify()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler(errorHandler)
	app.register(
		teacherRouterFactory(teacherService, classService, studentService),
		{
			prefix: "/v1/teachers",
		},
	)

	return app
}

const TEACHERS_ENDPOINT = "/v1/teachers"

describe("teacherRouterFactory", () => {
	describe("POST /", () => {
		it("should create a teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)
			const newTeacher = dummyTeacher({ id: teacherId }).toObject()

			const response = await app.inject({
				method: "POST",
				url: `${TEACHERS_ENDPOINT}`,
				body: newTeacher,
			})

			const data = response.json() as Teacher

			assert.strictEqual(response.statusCode, 201)
			assert.deepStrictEqual(data, newTeacher)
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)
			const newTeacher = dummyTeacher({ id: teacherId }).toObject()
			teacherService.create.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "POST",
				url: `${TEACHERS_ENDPOINT}`,
				body: newTeacher,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 409 on teacher already exists", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)
			const newTeacher = dummyTeacher().toObject()

			teacherService.create.mock.mockImplementationOnce(() => {
				throw new ConflictError(Teacher, newTeacher.document)
			})

			const response = await app.inject({
				method: "POST",
				url: `${TEACHERS_ENDPOINT}`,
				body: newTeacher,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "TeacherError",
				message: `Teacher with locator "${newTeacher.document}" already exists.`,
			})
		})
	})

	describe("GET /", () => {
		it("should return a teacher list", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}`,
			})

			const data = response.json() as Teacher[]
			assert.strictEqual(response.statusCode, 200)
			assert.ok(data.every((teacher) => teacher.document))
		})

		it("should return a empty list", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.list.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}`,
			})

			const data = response.json() as Teacher[]

			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, [])
		})
	})

	describe("GET /:id", () => {
		it("should return a teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			const data = response.json() as Teacher
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, dummyTeacher({ id: teacherId }).toObject())
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "TeacherError",
				message: `Teacher with locator "${teacherId}" could not be found.`,
			})
		})
	})

	describe("GET /:id/students", () => {
		it("should return a list of students", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/students`,
			})

			const data = response.json() as Student[]
			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(data.every((student) => student.class))
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/students`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/students`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "TeacherError",
				message: `Teacher with locator "${teacherId}" could not be found.`,
			})
		})

		it("should return a empty list if teacher has no classes", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			classService.listBy.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/students`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.deepStrictEqual(data, [])
		})

		it("should return a empty list if class has no students", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			studentService.listBy.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/students`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.deepStrictEqual(data, [])
		})
	})

	describe("GET /:id/classes", () => {
		it("should return a list of classes", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/classes`,
			})

			const data = response.json() as Class[]
			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(data.every((Class) => Class.teacher))
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/classes`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/classes`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "TeacherError",
				message: `Teacher with locator "${teacherId}" could not be found.`,
			})
		})

		it("should return a empty list if teacher has no classes", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			classService.listBy.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${TEACHERS_ENDPOINT}/${teacherId}/classes`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.deepStrictEqual(data, [])
		})
	})

	describe("PUT /:id", () => {
		it("should update a teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "PUT",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
				body: {
					salary: 5000,
				},
			})

			const data = response.json() as Teacher
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(
				data,
				dummyTeacher({ id: teacherId, salary: 5000 }).toObject(),
			)
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.update.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "PUT",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
				body: {
					salary: 5000,
				},
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.update.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const response = await app.inject({
				method: "PUT",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
				body: {
					salary: 5000,
				},
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "TeacherError",
				message: `Teacher with locator "${teacherId}" could not be found.`,
			})
		})
	})

	describe("DELETE /:id", () => {
		it("should delete a teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "DELETE",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			assert.strictEqual(response.statusCode, 204)
			assert.ok(!response.body.length)
		})

		it("should 500 if any other error", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.remove.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no teacher", async (t) => {
			const teacherService = teacherServiceMock(t)
			const classService = classServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				teacherService as unknown as TeacherService,
				classService as unknown as ClassService,
				studentService as unknown as StudentService,
			)

			teacherService.remove.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${TEACHERS_ENDPOINT}/${teacherId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "TeacherError",
				message: `Teacher with locator "${teacherId}" could not be found.`,
			})
		})
	})
})
