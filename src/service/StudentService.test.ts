import assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { type Mock, type TestContext, describe, it } from 'node:test'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'
import { Parent } from '../domain/parent/Parent.js'
import { StudentMustHaveAtLeastOneParentError } from '../domain/student/errors/StudentMustHaveAtLeastOneParentError.js'
import { dummyDatabase, dummyParent, dummyStudent, parentId, studentId } from '../utils/fixtures/mocks.js'
import type { ParentService } from './ParentService.js'
import { StudentService } from './StudentService.js'

describe('Student Service', () => {
	// region Mocks
	const ParentServiceMock = (
		ctx: TestContext,
		// biome-ignore lint/suspicious/noExplicitAny: Código de testes.
		mockReturn: { findById?: any } = {},
	) =>
		({
			findById: ctx.mock.fn((id: string) => mockReturn.findById ?? dummyParent({ id })),
		}) as { findById: Mock<(id: string) => Parent> }
	// endregion

	// region Create
	describe('Create', () => {
		it('should create a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), {
				listBy: [],
			})
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.doesNotReject(() => service.create(dummyStudent().toObject()))
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw conflict if student already exists', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.create(dummyStudent().toObject()), ConflictError)
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it('should throw an not found error if parent does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), {
				listBy: [],
			})
			const parentService = ParentServiceMock(ctx)
			parentService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Parent)
			})
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.create(dummyStudent().toObject()), NotFoundError)
			assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region Update
	describe('Update', () => {
		it('should update a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			const result = await service.update(studentId, { firstName: 'John', surname: 'Doe', medications: ['Aspirin'] })

			assert.strictEqual(result.firstName, 'John')
			assert.strictEqual(result.surname, 'Doe')
			assert.deepStrictEqual(result.medications, ['Dipirona', 'Aspirin'])
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw an error if student does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), {
				findById: false,
			})
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.update(studentId, { firstName: 'John', surname: 'Doe', medications: ['Aspirin'] }), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region Remove
	describe('Remove', () => {
		it('should remove a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.doesNotReject(() => service.remove(studentId))
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 1)
		})

		it('should throw an error if student does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), {
				findById: false,
			})
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.remove(studentId), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.remove.mock.callCount(), 0)
		})
	})
	// endregion

	// region LinkParent
	describe('LinkParent', () => {
		it('should link a parent to a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)
			const result = await service.linkParents(studentId, [parentId])

			assert.strictEqual(result.parents.length, 2)
			assert.strictEqual(result.parents[1], parentId)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw and error if parent is already linked', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent({ parents: [parentId] }))
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.linkParents(studentId, [parentId]), ConflictError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it('should throw an error if student does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), { findById: false })
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.linkParents(studentId, [parentId]), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it('should throw an error if parent does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			parentService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(parentId, Parent)
			})
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.linkParents(studentId, [parentId]), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region UnlinkParent
	describe('UnlinkParent', () => {
		it('should unlink a parent from a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent({ parents: [parentId, randomUUID()] }))
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)
			const result = await service.unlinkParent(studentId, [parentId])

			assert.strictEqual(result.parents.length, 1)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 2)
			assert.strictEqual(DBMock.save.mock.callCount(), 1)
		})

		it('should throw an NotFoundError if student does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), { findById: false })
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.unlinkParent(studentId, [parentId]), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 0)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})

		it('should throw an StudentMustHaveAtLeastOneParentError if student only has one parent', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent({ parents: [parentId] }))
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.unlinkParent(studentId, [parentId]), StudentMustHaveAtLeastOneParentError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 1)
			assert.strictEqual(DBMock.save.mock.callCount(), 0)
		})
	})
	// endregion

	// region GetParent
	describe('GetParent', () => {
		it('should get parents of a student', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			const result = await service.getParents(studentId)

			assert.deepStrictEqual(result.length, 1)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 1)
		})

		it('should throw an NotFoundError if student does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent(), {
				findById: false,
			})
			const parentService = ParentServiceMock(ctx)
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.getParents(studentId), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 0)
		})

		it('should throw an NotFoundError if parent does not exist', async (ctx) => {
			const DBMock = dummyDatabase(ctx, () => dummyStudent())
			const parentService = ParentServiceMock(ctx)
			parentService.findById.mock.mockImplementationOnce(() => {
				throw new NotFoundError(studentId, Parent)
			})
			const service = new StudentService(DBMock, parentService as unknown as ParentService)

			await assert.rejects(() => service.getParents(studentId), NotFoundError)
			assert.strictEqual(DBMock.findById.mock.callCount(), 1)
			assert.strictEqual(parentService.findById.mock.callCount(), 1)
		})
	})
	// endregion
})
