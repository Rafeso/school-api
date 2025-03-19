import { describe, it } from 'node:test'
import { dummyDatabase, dummyParent, parentId } from '../utils/fixtures/mocks.js'
import { ParentService } from './ParentService.js'
import assert from 'node:assert'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'

describe('Parent Service', () => {
  describe('Create', () => {
    it('should create a parent', async (ctx) => {
      const DBMock = dummyDatabase(ctx, () => dummyParent(), {
        listBy: [],
      })
      const service = new ParentService(DBMock)

      await assert.doesNotReject(() => service.create(dummyParent().toObject()))
      assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
      assert.strictEqual(DBMock.save.mock.callCount(), 1)
    })

    it('should throw conflict if parent already exists', async (ctx) => {
      const DBMock = dummyDatabase(ctx, () => dummyParent())
      const service = new ParentService(DBMock)

      await assert.rejects(() => service.create(dummyParent().toObject()), ConflictError)
      assert.strictEqual(DBMock.listBy.mock.callCount(), 1)
      assert.strictEqual(DBMock.save.mock.callCount(), 0)
    })
  })

  describe('Update', () => {
    it('should update a parent', async (ctx) => {
      const DBMock = dummyDatabase(ctx, () => dummyParent())
      const service = new ParentService(DBMock)
      const result = await service.update(parentId, { document: '123456789' })

      assert.strictEqual(result.document, '123456789')
      assert.strictEqual(DBMock.findById.mock.callCount(), 1)
      assert.strictEqual(DBMock.save.mock.callCount(), 1)
    })

    it('should throw an error if parent does not exist', async (ctx) => {
      const DBMock = dummyDatabase(ctx, dummyParent, {
        findById: false,
      })
      const service = new ParentService(DBMock)

      await assert.rejects(() => service.update(parentId, { document: '123456789' }), NotFoundError)
      assert.strictEqual(DBMock.findById.mock.callCount(), 1)
      assert.strictEqual(DBMock.save.mock.callCount(), 0)
    })
  })

  describe('Remove', () => {
    it('should remove a parent', async (ctx) => {
      const DBMock = dummyDatabase(ctx, () => dummyParent())
      const service = new ParentService(DBMock)

      await assert.doesNotReject(() => service.remove(parentId))
      assert.strictEqual(DBMock.findById.mock.callCount(), 1)
      assert.strictEqual(DBMock.remove.mock.callCount(), 1)
    })

    it('should throw an error if parent does not exist', async (ctx) => {
      const DBMock = dummyDatabase(ctx, dummyParent, {
        findById: false,
      })
      const service = new ParentService(DBMock)

      await assert.rejects(() => service.remove(parentId), NotFoundError)
      assert.strictEqual(DBMock.findById.mock.callCount(), 1)
      assert.strictEqual(DBMock.remove.mock.callCount(), 0)
    })
  })
})