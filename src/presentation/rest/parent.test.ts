import assert from "node:assert"
import { type TestContext, describe, it } from "node:test"
import fastify from "fastify"
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { ConflictError } from "../../domain/@errors/Conflict.js"
import { NotFoundError } from "../../domain/@errors/NotFound.js"
import { Parent } from "../../domain/parent/Parent.js"
import type {
	ParentCreationType,
	ParentUpdateType,
} from "../../domain/parent/types.js"
import type { Student } from "../../domain/student/Student.js"
import type { ParentService } from "../../service/ParentService.js"
import type { StudentService } from "../../service/StudentService.js"
import {
	dummyParent,
	dummyStudent,
	parentId,
	studentId,
} from "../../utils/fixtures/mocks.js"
import { errorHandler } from "./handlers/error-handler.js"
import { parentRouterFactory } from "./parent.js"

const parentServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof ParentService]?: ReturnType<ParentService[T]>
	} = {},
) => ({
	findById: t.mock.fn(
		(id: string) => methodReturns.findById ?? dummyParent({ id }),
	),
	list: t.mock.fn(
		(_page: number, _per_page: number) =>
			methodReturns.list ?? [dummyParent({ id: parentId })],
	),
	remove: t.mock.fn((_id: string) => methodReturns.remove ?? t.mock.fn()),
	create: t.mock.fn(
		(_class: ParentCreationType) => methodReturns.create ?? dummyParent(_class),
	),
	update: t.mock.fn(
		(_id: string, _values: ParentUpdateType) =>
			methodReturns.update ?? dummyParent({ ..._values, id: _id }),
	),
})

const studentServiceMock = (
	t: TestContext,
	methodReturns: {
		[T in keyof StudentService]?: ReturnType<StudentService[T]>
	} = {},
) => ({
	listBy: t.mock.fn(
		(_property: string, _value: string[]) =>
			methodReturns.listBy ?? [dummyStudent({ id: studentId })],
	),
})

function getApp(parentService: ParentService, studentService: StudentService) {
	const app = fastify()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler(errorHandler)
	app.register(parentRouterFactory(parentService, studentService), {
		prefix: "/v1/parents",
	})

	return app
}

const PARENTS_ENDPOINT = "/v1/parents"

describe("parentRouterFactory", () => {
	describe("POST /", () => {
		it("should 200 on create parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			const newParent = dummyParent().toObject()

			const response = await app.inject({
				method: "POST",
				url: `${PARENTS_ENDPOINT}`,
				body: newParent,
			})

			assert.strictEqual(response.statusCode, 201)
			assert.deepStrictEqual(response.json(), newParent)
		})

		it("should 500 if any other error", async (t) => {
			const studentService = studentServiceMock(t)
			const parentService = parentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			const newParent = dummyParent().toObject()

			parentService.create.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "POST",
				url: `${PARENTS_ENDPOINT}`,
				body: newParent,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 409 on parent already exists", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			const newParent = dummyParent().toObject()

			parentService.create.mock.mockImplementationOnce(() => {
				throw new ConflictError(Parent, newParent.document)
			})

			const response = await app.inject({
				method: "POST",
				url: `${PARENTS_ENDPOINT}`,
				body: newParent,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "ParentError",
				message: `Parent with locator "${newParent.document}" already exists.`,
			})
		})
	})

	describe("GET /", () => {
		it("should return a parent list", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, [dummyParent({ id: parentId }).toObject()])
		})

		it("should return empty list on no classes", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			parentService.list.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, [])
		})
	})

	describe("GET /:id", () => {
		it("should return a parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})
			const data = response.json()
			assert.strictEqual(response.statusCode, 200)
			assert.deepStrictEqual(data, dummyParent({ id: parentId }).toObject())
		})

		it("should 500 if any other error", async (t) => {
			const studentService = studentServiceMock(t)
			const parentService = parentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			parentService.findById.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 404 on no parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			parentService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(parentId, Parent)
			})

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "ParentError",
				message: `Parent with locator "${parentId}" could not be found.`,
			})
		})
	})

	describe("PUT /:id", () => {
		it("should 200 on update parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "PUT",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
				body: {
					phones: ["11 93947-3925"],
				},
			})
			const data = response.json() as Parent

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Object.keys(data).length === 7)
			assert.ok(data.phones.includes("11 93947-3925"))
			assert.strictEqual(data.id, parentId)
			assert.match(data.id, /^[0-9a-f-]{36}$/)
		})

		it("should 500 if any other error", async (t) => {
			const studentService = studentServiceMock(t)
			const parentService = parentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			parentService.update.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "PUT",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
				body: {
					phones: ["11 93593-9439"],
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

		it("should 404 on no parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			parentService.update.mock.mockImplementationOnce(() => {
				throw new NotFoundError(parentId, Parent)
			})

			const response = await app.inject({
				method: "PUT",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
				body: {
					phones: ["11 93947-3925"],
				},
			})
			const data = response.json()

			assert.strictEqual(response.statusCode, 404)
			assert.deepStrictEqual(data, {
				code: "NOT_FOUND",
				name: "ParentError",
				message: `Parent with locator "${parentId}" could not be found.`,
			})
		})
	})

	describe("DELETE /:id", () => {
		it("should delete a parent", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			studentService.listBy.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "DELETE",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})

			assert.strictEqual(response.statusCode, 204)
			assert.ok(!response.body.length)
		})

		it("should 500 if any other error", async (t) => {
			const studentService = studentServiceMock(t)
			const parentService = parentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			studentService.listBy.mock.mockImplementationOnce(() => [])
			parentService.remove.mock.mockImplementationOnce(() => {
				throw new Error("foo")
			})

			const response = await app.inject({
				method: "DELETE",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})

			const data = response.json()

			assert.strictEqual(response.statusCode, 500)
			assert.deepStrictEqual(data, {
				code: "UNKNOWN_ERROR",
				name: "Error",
				message: "foo",
			})
		})

		it("should 409 if has students assigned", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "DELETE",
				url: `${PARENTS_ENDPOINT}/${parentId}`,
			})

			assert.strictEqual(response.statusCode, 409)
			assert.deepStrictEqual(response.json(), {
				code: "CONFLICT",
				name: "ParentError",
				message: "Cannot delete parent because it has students assigned.",
			})
		})
	})

	describe("GET /:id/students", () => {
		it("should return a list of students", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}/${parentId}/students`,
			})

			const data = response.json() as Student[]

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(data.every((student: Student) => student.parents))
		})

		it("should return an empty list", async (t) => {
			const parentService = parentServiceMock(t)
			const studentService = studentServiceMock(t)
			const app = getApp(
				parentService as unknown as ParentService,
				studentService as unknown as StudentService,
			)
			studentService.listBy.mock.mockImplementationOnce(() => [])

			const response = await app.inject({
				method: "GET",
				url: `${PARENTS_ENDPOINT}/${parentId}/students`,
			})

			const data = response.json() as Student[]

			assert.strictEqual(response.statusCode, 200)
			assert.ok(Array.isArray(data))
			assert.ok(!data.length)
			assert.deepStrictEqual(data, [])
		})
	})
})
