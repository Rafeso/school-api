import assert from 'node:assert'
import { describe, it } from 'node:test'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'
import { dummyDatabase, dummyTeacher, teacherId } from '../utils/fixtures/mocks.js'
import { TeacherService } from './TeacherService.js'

describe('Teacher Service', () => {
	// region Create
	describe('Create', () => {
		it('should create a teacher', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyTeacher(), {
				listBy: [],
			})

			const service = new TeacherService(DBMock)

			await assert.doesNotReject(() => service.create(dummyTeacher().toObject()))
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw conflict if teacher already exists', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyTeacher())
			const service = new TeacherService(DBMock)

			await assert.rejects(() => service.create(dummyTeacher().toObject()), ConflictError)
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region Update
	describe('Update', () => {
		it('should update a teacher', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyTeacher())
			const service = new TeacherService(DBMock)
			const result = await service.update(teacherId, { email: 'test@example.com' })

			assert.strictEqual(result.email, 'test@example.com')
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw an error if teacher does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, dummyTeacher, {
				findById: false,
			})
			const service = new TeacherService(DBMock)

			await assert.rejects(() => service.update(teacherId, { document: '123456789' }), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region Remove
	describe('Remove', () => {
		it('should remove a teacher', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyTeacher())
			const service = new TeacherService(DBMock)

			await assert.doesNotReject(() => service.remove(teacherId))
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 1)
		})

		it('should throw an error if teacher does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, dummyTeacher, {
				findById: false,
			})
			const service = new TeacherService(DBMock)

			await assert.rejects(() => service.remove(teacherId), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 0)
		})
	})
	// endregion
})
