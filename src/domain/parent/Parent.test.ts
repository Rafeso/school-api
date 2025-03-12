import assert from 'node:assert'
//@ts-nocheck
import { describe, it } from 'node:test'
import { ZodError } from 'zod'
import { Parent } from './Parent.js'
import { ParentCreationType } from './types.js'

const ParentEntityObj: ParentCreationType = {
	firstName: 'Lucas',
	surname: 'Santos',
	phones: ['123456789'],
	emails: ['foo@gmail.com'],
	document: '123456789',
	address: [
		{
			city: 'Foo',
			country: 'Bar',
			street: 'Baz',
			zipCode: '123456',
		},
	],
}

describe('Parent Domain', () => {
	it('should return a Parent instance with the correct data', () => {
		const ParentEntity = new Parent(ParentEntityObj)
		assert.ok(ParentEntity instanceof Parent)
	})

	it('should return the correct data on toObject', () => {
		const ParentEntity = new Parent(ParentEntityObj)
		assert.deepStrictEqual(ParentEntity.toObject(), {
			...ParentEntityObj,
			id: ParentEntity.id,
		})
	})

	it('should return the correct data on toJSON', () => {
		const ParentEntity = new Parent(ParentEntityObj)
		assert.strictEqual(
			ParentEntity.toJSON(),
			JSON.stringify(ParentEntity.toObject()),
		)
	})

	it('should return the correct data on fromObject', () => {
		const ParentEntity = Parent.fromObject(ParentEntityObj)
		assert.ok(ParentEntity instanceof Parent)
		assert.deepStrictEqual(ParentEntity.toObject(), {
			...ParentEntityObj,
			id: ParentEntity.id,
		})
	})

	it('should return an error when trying to create a Parent with invalid data', () => {
		assert.throws(
			() => new Parent({ ...ParentEntityObj, firstName: '', surname: '' }),
			ZodError,
		)

		assert.throws(
			() => new Parent({ ...ParentEntityObj, document: '' }),
			ZodError,
		)

		assert.throws(
			() => new Parent({ ...ParentEntityObj, emails: [] }),
			ZodError,
		)

		assert.throws(
			() => new Parent({ ...ParentEntityObj, phones: [] }),
			ZodError,
		)

		assert.throws(
			() => new Parent({ ...ParentEntityObj, address: [] }),
			ZodError,
		)
	})
})
