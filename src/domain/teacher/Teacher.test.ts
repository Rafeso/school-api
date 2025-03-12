import assert from 'node:assert'
import { describe, it } from 'node:test'
import { ZodError } from 'zod'
import { Teacher } from './Teacher.js'
import { TeacherCreationType } from './types.js'

const TeacherEntityObj: TeacherCreationType = {
	firstName: 'Rafael',
	surname: 'Feitosa',
	hiringDate: new Date('2010-10-10').toISOString(),
	email: 'teste@testando.com',
	phone: '11939555105',
	salary: 5000,
	major: 'Computer Science',
	document: '12345678',
}

describe('Teacher Domain', () => {
	it('should return a Teacher instance with the correct data', () => {
		const TeacherEntity = new Teacher(TeacherEntityObj)
		assert.ok(TeacherEntity instanceof Teacher)
	})

	it('should return the correct data on toObject', () => {
		const TeacherEntity = new Teacher(TeacherEntityObj)
		assert.deepStrictEqual(TeacherEntity.toObject(), {
			...TeacherEntityObj,
			id: TeacherEntity.id,
		})
	})

	it('should return the correct data on toJSON', () => {
		const TeacherEntity = new Teacher(TeacherEntityObj)
		assert.strictEqual(
			TeacherEntity.toJSON(),
			JSON.stringify(TeacherEntity.toObject()),
		)
	})

	it('should return the correct data on fromObject', () => {
		const TeacherEntity = Teacher.fromObject(TeacherEntityObj)
		assert.ok(TeacherEntity instanceof Teacher)
		assert.deepStrictEqual(TeacherEntity.toObject(), {
			...TeacherEntityObj,
			id: TeacherEntity.id,
		})
	})

	it('should return an error when trying to create a Teacher with invalid data', () => {
		assert.throws(
			() => new Teacher({ ...TeacherEntityObj, firstName: '', surname: '' }),
			ZodError,
		)

		assert.throws(
			() => new Teacher({ ...TeacherEntityObj, document: '' }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Teacher({ ...TeacherEntityObj, salary: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Teacher({ ...TeacherEntityObj, hiringDate: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Teacher({ ...TeacherEntityObj, major: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Teacher({ ...TeacherEntityObj, phone: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Teacher({ ...TeacherEntityObj, email: null }),
			ZodError,
		)
	})
})
