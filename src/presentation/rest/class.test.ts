import assert from "node:assert"
import { type TestContext, describe, it } from "node:test"
import fastify from "fastify"
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { ConflictError } from "../../domain/@errors/Conflict.js"
import { DependencyConflictError } from "../../domain/@errors/DependencyConflict.js"
import { MissingDependecyError } from "../../domain/@errors/MissingDependecy.js"
import { NotFoundError } from "../../domain/@errors/NotFound.js"
import { Class } from "../../domain/class/Class.js"
import type {
	ClassCreationType,
	ClassUpdateType,
} from "../../domain/class/types.js"
import { Student } from "../../domain/student/Student.js"
import { Teacher } from "../../domain/teacher/Teacher.js"
import type { ClassService } from "../../service/ClassService.js"
import {
	classId,
	dummyClass,
	dummyStudent,
	dummyTeacher,
	studentId,
	teacherId,
} from "../../utils/fixtures/mocks.js"
import { classRouterFactory } from "./class.js"
import { errorHandler } from "./handlers/error-handler.js"

const classServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof ClassService]?: ReturnType<ClassService[T]>
	} = {},
) => ({
	findById: t.mock.fn(
		(id: string) => methodReturns.findById ?? dummyClass({ id }),
	),
	list: t.mock.fn(
		(_page: number, _per_page: number) =>
			methodReturns.list ?? [dummyClass({ id: classId })],
	),
	getStudent: t.mock.fn(
		(_id: string) =>
			methodReturns.getStudent ?? [dummyStudent({ id: studentId })],
	),
	getTeacher: t.mock.fn(
		(_id: string) =>
			methodReturns.getTeacher ?? dummyTeacher({ id: teacherId }),
	),
	remove: t.mock.fn((_id: string) => methodReturns.remove ?? t.mock.fn()),
	create: t.mock.fn(
		(_class: ClassCreationType) => methodReturns.create ?? dummyClass(_class),
	),
	update: t.mock.fn(
		(_id: string, _values: ClassUpdateType) =>
			methodReturns.update ?? dummyClass({ ..._values, id: _id }),
	),
})

function getApp(classService: ClassService) {
	const app = fastify()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler(errorHandler)
	app.register(classRouterFactory(classService), {
		prefix: "/v1/classes",
	})

	return app
}

const CLASSES_ENDPOINT = "/v1/classes"

describe("classRouterFactory", () => {
	describe("GET /:id", () => {
		it("should return a class", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(
				response.json(),
				dummyClass({ id: classId }).toObject(),
			)
		})

		it("should 404 on not found class", async (t) => {
			const classService = classServiceMock(t)
			classService.findById.mock.mockImplementationOnce((_id: string) => {
				throw new NotFoundError(classId, Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				message: `Class with locator "${classId}" could not be found.`,
				name: "ClassError",
			})
		})

		it("should 500 if any other error", async (t) => {
			const classService = classServiceMock(t)
			classService.findById.mock.mockImplementationOnce((_id: string) => {
				throw new Error("foo")
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(response.json(), {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})
	})
	describe("GET /", () => {
		it("should list classes", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}`,
			})
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(response.json(), [
				dummyClass({ id: classId }).toObject(),
			])
		})
		it("should return empty on no classes", async (t) => {
			const classService = classServiceMock(t)
			classService.list.mock.mockImplementationOnce(() => [])
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}`,
			})
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(response.json(), [])
		})
	})
	describe("POST /", () => {
		it("should post a new class", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)
			const newClass = dummyClass().toObject()

			const response = await app.inject({
				method: "POST",
				url: `${CLASSES_ENDPOINT}`,
				body: newClass,
			})

			assert.strictEqual(response.statusCode, 201)
			assert.deepStrictEqual(response.json(), newClass)
		})

		it("should 409 on class already exists", async (t) => {
			const classService = classServiceMock(t)
			const newClass = dummyClass().toObject()
			classService.create.mock.mockImplementationOnce(
				(_class: ClassCreationType) => {
					throw new ConflictError(Class, newClass.code)
				},
			)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "POST",
				url: `${CLASSES_ENDPOINT}`,
				body: newClass,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "ClassError",
				message: `Class with locator "${newClass.code}" already exists.`,
			})
		})

		it("should 404 on not found teacher", async (t) => {
			const classService = classServiceMock(t)
			const newClass = dummyClass().toObject()
			classService.create.mock.mockImplementationOnce(
				(_class: ClassCreationType) => {
					throw new NotFoundError(newClass.teacher, Teacher)
				},
			)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "POST",
				url: `${CLASSES_ENDPOINT}`,
				body: newClass,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				name: "TeacherError",
				code: "NOT_FOUND",
				message: `Teacher with locator "${newClass.teacher}" could not be found.`,
			})
		})
	})

	describe("PUT /:id", () => {
		it("should return a class", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "PUT",
				url: `${CLASSES_ENDPOINT}/${classId}`,
				body: {
					code: "1C-M",
				},
			})
			const data = response.json() as Required<ClassCreationType>
			assert.strictEqual(response.statusCode, 200)
			assert.ok(Object.keys(response.json()).length === 3)
			assert.strictEqual(data.code, "1C-M")
			assert.strictEqual(data.teacher, teacherId)
			assert.match(data.id, /^[0-9a-f-]{36}$/)
		})

		it("should 500 if any other error", async (t) => {
			const classService = classServiceMock(t)
			classService.update.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "PUT",
				url: `${CLASSES_ENDPOINT}/${classId}`,
				body: {
					code: "1C-M",
				},
			})

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(response.json(), {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on class not found", async (t) => {
			const classService = classServiceMock(t)
			classService.update.mock.mockImplementationOnce(() => {
				throw new NotFoundError("b9e29cbc-0508-4286-a5e1-3f0b896407ed", Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "PUT",
				url: `${CLASSES_ENDPOINT}/b9e29cbc-0508-4286-a5e1-3f0b896407ed`,
				body: {
					code: "1C-M",
				},
			})
			assert.deepStrictEqual(response.json(), {
				name: "ClassError",
				code: "NOT_FOUND",
				message: `Class with locator "b9e29cbc-0508-4286-a5e1-3f0b896407ed" could not be found.`,
			})
			assert.strictEqual(response.statusCode, 404)
		})
	})

	describe("DELETE /:id", () => {
		it("should delete a class", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "DELETE",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 204)
		})

		it("should 500 if any other error", async (t) => {
			const classService = classServiceMock(t)
			classService.remove.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "DELETE",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(response.json(), {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 409 if class has students", async (t) => {
			const classService = classServiceMock(t)
			classService.remove.mock.mockImplementationOnce(() => {
				throw new DependencyConflictError(Student, "someuuid", Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "DELETE",
				url: `${CLASSES_ENDPOINT}/${classId}`,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				name: "StudentError",
				code: "DEPENDENCY_LOCK",
				message: `Student with locator "someuuid" cannot be removed because it depends on Class.`,
			})
		})
	})

	describe("GET /:id/teacher", () => {
		it("should return the teacher", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/teacher`,
			})

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Object.keys(response.json()).includes("major"))
		})

		it("should 500 if any other error", async (t) => {
			const classService = classServiceMock(t)
			classService.getTeacher.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/teacher`,
			})

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(response.json(), {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on teacher not found", async (t) => {
			const classService = classServiceMock(t)
			classService.getTeacher.mock.mockImplementationOnce(() => {
				throw new MissingDependecyError(Teacher, "someuuid", Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/teacher`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "MISSING_DEPENDENCY",
				name: "TeacherError",
				message: `Teacher could not be found in Class with locator "someuuid".`,
			})
		})

		it("should 404 on class not found", async (t) => {
			const classService = classServiceMock(t)
			classService.getTeacher.mock.mockImplementationOnce(() => {
				throw new NotFoundError(classId, Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/teacher`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				name: "ClassError",
				message: `Class with locator "${classId}" could not be found.`,
			})
		})
	})

	describe("GET /:id/students", () => {
		it("should return the students list", async (t) => {
			const classService = classServiceMock(t)
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/students`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(data.every((student: Student) => !!student.bloodType))
		})

		it("should return an empty list", async (t) => {
			const classService = classServiceMock(t)
			classService.getStudent.mock.mockImplementationOnce(() => [])
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/students`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.strictEqual(data.length, 0)
			assert.deepStrictEqual(data, [])
		})

		it("should 500 if any other error", async (t) => {
			const classService = classServiceMock(t)
			classService.getStudent.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/students`,
			})

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(response.json(), {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on class not found", async (t) => {
			const classService = classServiceMock(t)
			classService.getTeacher.mock.mockImplementationOnce(() => {
				throw new NotFoundError(classId, Class)
			})
			const app = getApp(classService as unknown as ClassService)

			const response = await app.inject({
				method: "GET",
				url: `${CLASSES_ENDPOINT}/${classId}/teacher`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				name: "ClassError",
				message: `Class with locator "${classId}" could not be found.`,
			})
		})
	})
})
