import assert from 'node:assert'
import { randomUUID } from 'node:crypto'
import { describe, it } from 'node:test'
import { ZodError } from 'zod'
import { Student } from './Student.js'
import { StudentCreationType } from './types.js'

const StudentEntityObj: StudentCreationType = {
	firstName: 'Rafael',
	surname: 'Feitosa',
	birthDate: new Date('2003-01-01').toISOString(),
	bloodType: 'O+',
	class: randomUUID(),
	document: '123456789',
	allergies: ['Chocolate'],
	medications: ['Dipirona'],
	parents: [randomUUID()],
	startDate: new Date('2010-10-10').toISOString(),
}

describe('Student Domain', () => {
	it('should return a Student instance with the correct data', () => {
		const StudentEntity = new Student(StudentEntityObj)
		assert.ok(StudentEntity instanceof Student)
	})

	it('should return the correct data on toObject', () => {
		const StudentEntity = new Student(StudentEntityObj)
		assert.deepStrictEqual(StudentEntity.toObject(), {
			...StudentEntityObj,
			id: StudentEntity.id,
		})
	})

	it('should return the correct data on toJSON', () => {
		const StudentEntity = new Student(StudentEntityObj)
		assert.strictEqual(
			StudentEntity.toJSON(),
			JSON.stringify(StudentEntity.toObject()),
		)
	})

	it('should return the correct data on fromObject', () => {
		const StudentEntity = Student.fromObject(StudentEntityObj)
		assert.ok(StudentEntity instanceof Student)
		assert.deepStrictEqual(StudentEntity.toObject(), {
			...StudentEntityObj,
			id: StudentEntity.id,
		})
	})

	it('should return an error when trying to create a Student with invalid data', () => {
		assert.throws(
			() => new Student({ ...StudentEntityObj, firstName: '', surname: '' }),
			ZodError,
		)

		assert.throws(
			() => new Student({ ...StudentEntityObj, document: '' }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Student({ ...StudentEntityObj, bloodType: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Student({ ...StudentEntityObj, class: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Student({ ...StudentEntityObj, startDate: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Student({ ...StudentEntityObj, birthDate: null }),
			ZodError,
		)

		assert.throws(
			// @ts-ignore
			() => new Student({ ...StudentEntityObj, parents: null }),
			ZodError,
		)
	})
})
