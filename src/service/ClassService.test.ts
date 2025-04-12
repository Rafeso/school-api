import assert from "node:assert"
import { randomUUID } from "node:crypto"
import { type Mock, type TestContext, describe, it } from "node:test"
import { ConflictError } from "../domain/@errors/Conflict.js"
import { DependencyConflictError } from "../domain/@errors/DependencyConflict.js"
import { MissingDependecyError } from "../domain/@errors/MissingDependecy.js"
import { NotFoundError } from "../domain/@errors/NotFound.js"
import type { Student } from "../domain/student/Student.js"
import { Teacher } from "../domain/teacher/Teacher.js"
import {
	classId,
	dummyClass,
	dummyDatabase,
	dummyStudent,
	dummyTeacher,
	studentId,
	teacherId,
} from "../utils/fixtures/mocks.js"
import { ClassService } from "./ClassService.js"
import type { StudentService } from "./StudentService.js"
import type { TeacherService } from "./TeacherService.js"

describe("Class Service", () => {
	// region Mocks
	const TeacherServiceMock = (
		t: TestContext,
		// biome-ignore lint/suspicious/noExplicitAny: Código de testes.
		mockReturn: { findById?: any } = {},
	) =>
		({
			findById: t.mock.fn(
				(id: string) => mockReturn.findById ?? dummyTeacher({ id }),
			),
		}) as { findById: Mock<(id: string) => Teacher> }

	const StudentServiceMock = (
		t: TestContext,
		// biome-ignore lint/suspicious/noExplicitAny: Código de testes.
		mockReturn: { listBy?: any } = {},
	) =>
		({
			listBy: t.mock.fn(
				// biome-ignore lint/suspicious/noExplicitAny: Código de testes.
				(prop: string, value: any) =>
					mockReturn.listBy ?? [dummyStudent({ id: studentId, [prop]: value })],
			),
			// biome-ignore lint/suspicious/noExplicitAny: Código de testes.
		}) as { listBy: Mock<(prop: string, value: any) => Student[]> }
	// endregion

	// region Create
	describe("Create", () => {
		it("should create a class", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass(), {
				listBy: [],
			})
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.doesNotReject(() => service.create(dummyClass().toObject()))
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it("should throw conflict if class already exists", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass())
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.rejects(
				() => service.create(dummyClass().toObject()),
				ConflictError,
			)
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it("should throw an error if teacher does not exist", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass(), {
				listBy: [],
			})
			const teacherService = TeacherServiceMock(ctx)
			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})

			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.rejects(
				() => service.create(dummyClass().toObject()),
				NotFoundError,
			)
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region Remove
	describe("Remove", () => {
		it("should remove a class", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass())
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			studentService.listBy.mock.mockImplementationOnce(() => [])
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.doesNotReject(() => service.remove(classId))
			assert.strictEqual(studentService.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 1)
		})

		it("should throw an error if there is a dependency conflict", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass(), {
				listBy: [],
			})
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.rejects(
				() => service.remove(dummyClass().toObject().id),
				DependencyConflictError,
			)
			assert.strictEqual(studentService.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 0)
		})
	})
	// endregion

	// region Update
	describe("Update", () => {
		it("should update a class whithout checking for teacher", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass())
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			const result = await service.update(classId, { code: "1C-T" })

			assert.strictEqual(result.code, "1C-T")
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it("should update a class checking for teacher", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass())
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)
			const newTeacherId = randomUUID()

			const result = await service.update(classId, { teacher: newTeacherId })

			assert.strictEqual(result.teacher, newTeacherId)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it("should throw an error if class does not exist", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass(), {
				findById: false,
			})
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.rejects(
				() => service.update(classId, { code: "1C-T" }),
				NotFoundError,
			)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it("should throw an error if teacher does not exist", async (ctx) => {
			const DBMock = dummyDatabase(ctx, dummyClass, {
				listBy: [],
			})
			const teacherService = TeacherServiceMock(ctx)
			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)
			const newTeacherId = randomUUID()

			await assert.rejects(
				() => service.update(classId, { code: "1C-T", teacher: newTeacherId }),
				NotFoundError,
			)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region GetTeacher
	describe("GetTeacher", () => {
		it("should get teacher of a class", async (t) => {
			const DBMock = dummyDatabase(t, () => dummyClass())
			const teacherService = TeacherServiceMock(t)
			const studentService = StudentServiceMock(t)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)
			const result = await service.getTeacher(classId)

			assert.deepStrictEqual(result.id, teacherId)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
		})

		it("should throw an error if teacher does not exist", async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyClass())
			const teacherService = TeacherServiceMock(ctx)
			teacherService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(teacherId, Teacher)
			})
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)
			await assert.rejects(() => service.getTeacher(classId), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 1)
		})

		it("should throw an error if class has no teacher", async (t) => {
			const DBMock = dummyDatabase(t, () => dummyClass(), {
				findById: dummyClass({ code: "1B-M", teacher: null }),
			})
			const teacherService = TeacherServiceMock(t)
			const studentService = StudentServiceMock(t)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)

			await assert.rejects(service.getTeacher(classId), MissingDependecyError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(teacherService.findById.mock.callCount(), 0)
		})
	})
	// endregion

	// region GetStudent
	describe("GetStudent", () => {
		it("should get student of a class", async (ctx) => {
			const DBMock = dummyDatabase(ctx, dummyClass)
			const teacherService = TeacherServiceMock(ctx)
			const studentService = StudentServiceMock(ctx)
			const service = new ClassService(
				DBMock,
				teacherService as unknown as TeacherService,
				studentService as unknown as StudentService,
			)
			const result = await service.getStudent(classId)

			assert.deepStrictEqual(result.length, 1)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(studentService.listBy.mock.callCount(), 1)
		})
	})
	// endregion
})
