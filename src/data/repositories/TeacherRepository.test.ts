import assert from 'assert'
import { after, afterEach, before, describe, it } from 'node:test'
import { appConfig } from '../../config.js'
import { Teacher } from '../../domain/teacher/Teacher.js'
import { connectToDatabase } from '../connection.js'
import { TeacherRepository } from './TeacherRepository.js'

describe('TeacherRepository', async () => {
	const { db } = await connectToDatabase(appConfig)
	const teacher = new Teacher({
		firstName: 'Rafael',
		surname: 'Feitosa',
		hiringDate: new Date('2010-10-10').toISOString(),
		email: 'teste@testando.com',
		phone: '11939555105',
		salary: 5000,
		major: 'Computer Science',
		document: '12345678',
	})

	before(async () => {
		await db.collection(Teacher.collection).deleteMany({})
	})

	afterEach(async () => {
		await db.collection(Teacher.collection).deleteMany({})
	})

	after(() => {
		process.exit()
	})

	it('should create a teacher', async () => {
		const teacherRepository = new TeacherRepository(db)
		await teacherRepository.save(teacher)

		const result = await teacherRepository.findById(teacher.id)
		assert.ok(result instanceof Teacher)
		assert.deepStrictEqual(result, teacher)
	})

	it('should update a teacher', async () => {
		const teacherRepository = new TeacherRepository(db)
		const newTeacher = new Teacher({
			firstName: 'Rafael',
			surname: 'Feitosa',
			hiringDate: new Date('2010-10-10').toISOString(),
			email: 'teste@testando.com',
			phone: '11939555105',
			salary: 5000,
			major: 'Computer Science',
			document: '12345678',
		})
		await teacherRepository.save(newTeacher)
		newTeacher.firstName = 'João'

		await teacherRepository.save(newTeacher)
		const result = await teacherRepository.findById(newTeacher.id)
		assert.ok(result instanceof Teacher)

		assert.deepStrictEqual(result, newTeacher)
	})

	it('should list teachers in database', async () => {
		const teacherRepository = new TeacherRepository(db)
		await teacherRepository.save(teacher)
		const result = await teacherRepository.list()

		assert.ok(result[0] instanceof Teacher)
		assert.ok(result.length === 1)
		assert.deepStrictEqual(result, [teacher])
	})

	it('should list teachers by property', async () => {
		const teacherRepository = new TeacherRepository(db)
		await teacherRepository.save(teacher)
		const result = await teacherRepository.listBy('document', teacher.document)
		assert.ok(result.length === 1)
		assert.ok(result[0] instanceof Teacher)
		assert.deepStrictEqual(result, [teacher])
	})

	it('should find a teacher by id', async () => {
		const teacherRepository = new TeacherRepository(db)
		await teacherRepository.save(teacher)
		const result = await teacherRepository.findById(teacher.id)

		assert.ok(result instanceof Teacher)
		assert.deepStrictEqual(result, teacher)
	})
})
