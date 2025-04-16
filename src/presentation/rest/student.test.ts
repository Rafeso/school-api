import assert, { throws } from "node:assert"
import { type TestContext, describe, it } from "node:test"
import fastify from "fastify"
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { ConflictError } from "../../domain/@errors/Conflict.js"
import { NotFoundError } from "../../domain/@errors/NotFound.js"
import { Parent } from "../../domain/parent/Parent.js"
import { Student } from "../../domain/student/Student.js"
import { StudentMustHaveAtLeastOneParentError } from "../../domain/student/errors/StudentMustHaveAtLeastOneParentError.js"
import type {
	StudentCreationType,
	StudentUpdateType,
} from "../../domain/student/types.js"
import type { StudentService } from "../../service/StudentService.js"
import {
	dummyParent,
	dummyStudent,
	parentId,
	studentId,
} from "../../utils/fixtures/mocks.js"
import { errorHandler } from "./handlers/error-handler.js"
import { studentRouterFactory } from "./student.js"

const studentServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof StudentService]?: ReturnType<StudentService[T]>
	} = {},
) => ({
	findById: t.mock.fn(
		(id: string) => methodReturns.findById ?? dummyStudent({ id }),
	),
	list: t.mock.fn(
		(_page: number, _per_page: number) =>
			methodReturns.list ?? [dummyStudent({ id: studentId })],
	),
	remove: t.mock.fn((_id: string) => methodReturns.remove ?? t.mock.fn()),
	linkParents: t.mock.fn(
		(id: string, parents: StudentCreationType["parents"]) =>
			methodReturns.linkParents ?? dummyStudent({ parents: parents, id: id }),
	),
	getParents: t.mock.fn(
		(_id: string) => methodReturns.getParents ?? [dummyParent()],
	),
	unlinkParent: t.mock.fn(
		(_id: string, _parentToDelete: StudentCreationType["parents"]) =>
			methodReturns.unlinkParent ?? t.mock.fn(),
	),
	create: t.mock.fn(
		(student: StudentCreationType) =>
			methodReturns.create ?? dummyStudent(student),
	),
	update: t.mock.fn(
		(id: string, values: StudentUpdateType) =>
			methodReturns.update ?? dummyStudent({ ...values, id: id }),
	),
})

function getApp(studentService: StudentService) {
	const app = fastify()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler(errorHandler)
	app.register(studentRouterFactory(studentService), {
		prefix: "/v1/students",
	})

	return app
}

const STUDENTS_ENDPOINT = "/v1/students"

describe("studentRouterFactory", () => {
	describe("POST /", () => {
		it("should 200 on create student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			const newStudent = dummyStudent().toObject()

			const response = await app.inject({
				method: "POST",
				url: `${STUDENTS_ENDPOINT}`,
				body: newStudent,
			})

			assert.strictEqual(response.statusCode, 201)
			assert.deepStrictEqual(response.json(), newStudent)
		})

		it("should 404 on no parent", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			const newStudent = dummyStudent({
				id: studentId,
				parents: [parentId],
			}).toObject()
			studentService.create.mock.mockImplementationOnce(() => {
				throw new NotFoundError(parentId, Parent)
			})

			const response = await app.inject({
				method: "POST",
				url: `${STUDENTS_ENDPOINT}`,
				body: newStudent,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				name: "ParentError",
				message: `Parent with locator "${parentId}" could not be found.`,
			})
		})

		it("should 409 on student already exists", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			const newStudent = dummyStudent().toObject()

			studentService.create.mock.mockImplementationOnce(() => {
				throw new ConflictError(Student, newStudent.document)
			})

			const response = await app.inject({
				method: "POST",
				url: `${STUDENTS_ENDPOINT}`,
				body: newStudent,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "StudentError",
				message: `Student with locator "${newStudent.document}" already exists.`,
			})
		})
	})

	describe("GET /", () => {
		it("should return a student list", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.list.mock.mockImplementationOnce(() => [
				dummyStudent({ id: studentId, parents: [parentId] }),
			])

			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}`,
			})
			const data = response.json() as Student[]
			assert.strictEqual(response.statusCode, 200)
			assert.ok(data.every((student: Student) => student.parents))
		})

		it("should return empty list on no students", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.list.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, [])
		})
	})

	describe("GET /:id", () => {
		it("should return a student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.findById.mock.mockImplementationOnce(() =>
				dummyStudent({ id: studentId, parents: [parentId] }),
			)

			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(
				data,
				dummyStudent({ id: studentId, parents: [parentId] }).toObject(),
			)
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})

			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "StudentError",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})

	describe("GET /:id/parents", () => {
		it("should return a parent list", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)

			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
			})
			const data = response.json() as Parent[]

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(data.every((parent: Parent) => parent.id))
		})

		it("should return empty list", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.getParents.mock.mockImplementationOnce(() => [])
			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, [])
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.getParents.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})
			const response = await app.inject({
				method: "GET",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				name: "StudentError",
				code: "NOT_FOUND",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})

	describe("PATCH /:id/parents", () => {
		it("should patch student parents", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			const response = await app.inject({
				method: "PATCH",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
				body: {
					parents: [parentId],
				},
			})
			const data = response.json() as Student

			assert.strictEqual(response.statusCode, 200)
			assert.ok(data.parents.includes(parentId))
		})

		it("should 404 on no parent", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.linkParents.mock.mockImplementationOnce(() => {
				throw new NotFoundError(parentId, Parent)
			})
			const response = await app.inject({
				method: "PATCH",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
				body: {
					parents: [parentId],
				},
			})
			const data = response.json() as Student

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				name: "ParentError",
				code: "NOT_FOUND",
				message: `Parent with locator "${parentId}" could not be found.`,
			})
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.linkParents.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})
			const response = await app.inject({
				method: "PATCH",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents`,
				body: {
					parents: [parentId],
				},
			})
			const data = response.json() as Student

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				name: "StudentError",
				code: "NOT_FOUND",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})

	describe("PUT /:id", () => {
		it("should 200 on update student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)

			const response = await app.inject({
				method: "PUT",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
				body: {
					allergies: ["someallergie"],
				},
			})
			const data = response.json() as Student

			assert.strictEqual(response.statusCode, 200)
			assert.ok(data.allergies.includes("someallergie"))
			assert.strictEqual(data.id, studentId)
			assert.match(data.id, /^[0-9a-f-]{36}$/)
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)

			studentService.update.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})

			const response = await app.inject({
				method: "PUT",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
				body: {
					allergies: ["someallergie"],
				},
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "StudentError",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})

	describe("DELETE /:id", () => {
		it("should delete a student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)

			const response = await app.inject({
				method: "DELETE",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
			})

			assert.strictEqual(response.statusCode, 204)
			assert.ok(!response.body.length)
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.remove.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${STUDENTS_ENDPOINT}/${studentId}`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				name: "StudentError",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})

	describe("DELETE /:id/parents/:parentId", () => {
		it("should delete a parent", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)

			const response = await app.inject({
				method: "DELETE",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents/${parentId}`,
			})

			assert.strictEqual(response.statusCode, 204)
			assert.ok(!response.body.length)
		})

		it("should 409 if is the only parent", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.unlinkParent.mock.mockImplementationOnce(() => {
				throw new StudentMustHaveAtLeastOneParentError(
					Student,
					parentId,
					Parent,
				)
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents/${parentId}`,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "StudentError",
				message: `Parent with locator "${parentId}" could not be removed from because Student must have at least one parent.`,
			})
		})

		it("should 404 on no student", async (t) => {
			const studentService = studentServiceMock(t)
			const app = getApp(studentService as unknown as StudentService)
			studentService.unlinkParent.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Student)
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${STUDENTS_ENDPOINT}/${studentId}/parents/${parentId}`,
			})

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(response.json(), {
				code: "NOT_FOUND",
				name: "StudentError",
				message: `Student with locator "${studentId}" could not be found.`,
			})
		})
	})
})
