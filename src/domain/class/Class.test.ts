import { randomUUID } from 'crypto'
import assert from 'node:assert'
//@ts-nocheck
import { describe, it } from 'node:test'
import { ZodError } from 'zod'
import { Class } from './Class.js'
import { ClassCreationType } from './types.js'

describe('Class Domain', () => {
	const classEntityObj: ClassCreationType = {
		code: '1B-M',
		teacher: randomUUID(),
	}

	it('should return a class instance with the correct data', () => {
		const classEntity = new Class(classEntityObj)
		assert.ok(classEntity instanceof Class)
	})

	it('should return the correct data on toObject', () => {
		const classEntity = new Class(classEntityObj)
		assert.deepStrictEqual(classEntity.toObject(), {
			...classEntityObj,
			id: classEntity.id,
		})
	})

	it('should return the correct data on toJSON', () => {
		const classEntity = new Class(classEntityObj)
		assert.strictEqual(
			classEntity.toJSON(),
			JSON.stringify(classEntity.toObject()),
		)
	})

	it('should return the correct data on fromObject', () => {
		const classEntity = Class.fromObject(classEntityObj)
		assert.ok(classEntity instanceof Class)
		assert.deepStrictEqual(classEntity.toObject(), {
			...classEntityObj,
			id: classEntity.id,
		})
	})

	it('should return an error when trying to create a class with invalid data', () => {
		assert.throws(
			() => new Class({ ...classEntityObj, code: 'invalid' }),
			ZodError,
		)

		assert.throws(
			() => new Class({ ...classEntityObj, teacher: 'invalid' }),
			ZodError,
		)

		assert.throws(
			() => new Class({ ...classEntityObj, id: 'invalid' }),
			ZodError,
		)
	})
})
