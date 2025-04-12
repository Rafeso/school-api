import assert from "node:assert"
import { randomUUID } from "node:crypto"
import { after, afterEach, before, describe, it } from "node:test"
import { appConfig } from "../../config.js"
import { Student } from "../../domain/student/Student.js"
import { connectToDatabase } from "../connection.js"
import { StudentRepository } from "./StudentRepository.js"

describe("StudentRepository", async () => {
	const { db } = await connectToDatabase(appConfig)
	const student = new Student({
		firstName: "Rafael",
		surname: "Feitosa",
		birthDate: new Date("2003-01-01").toISOString(),
		bloodType: "O+",
		class: randomUUID(),
		document: "123456789",
		allergies: ["Chocolate"],
		medications: ["Dipirona"],
		parents: [randomUUID()],
		startDate: new Date("2010-10-10").toISOString(),
	})

	before(async () => {
		await db.collection(Student.collection).deleteMany({})
	})

	afterEach(async () => {
		await db.collection(Student.collection).deleteMany({})
	})

	after(() => {
		process.exit()
	})

	it("should create a student", async () => {
		const studentRepository = new StudentRepository(db)
		await studentRepository.save(student)

		const result = await studentRepository.findById(student.id)
		assert.ok(result instanceof Student)
		assert.deepStrictEqual(result, student)
	})

	it("should update a student", async () => {
		const studentRepository = new StudentRepository(db)
		const newStudent = new Student({
			firstName: "Rafael",
			surname: "Feitosa",
			birthDate: new Date("2003-01-01").toISOString(),
			bloodType: "O+",
			class: randomUUID(),
			document: "123456789",
			allergies: ["Chocolate"],
			medications: ["Dipirona"],
			parents: [randomUUID()],
			startDate: new Date("2010-10-10").toISOString(),
		})
		await studentRepository.save(newStudent)
		newStudent.firstName = "João"

		await studentRepository.save(newStudent)
		const result = await studentRepository.findById(newStudent.id)
		assert.ok(result instanceof Student)

		assert.deepStrictEqual(result, newStudent)
	})

	it("should list students in database", async () => {
		const studentRepository = new StudentRepository(db)
		await studentRepository.save(student)
		const result = await studentRepository.list()

		assert.ok(result[0] instanceof Student)
		assert.ok(result.length === 1)
		assert.deepStrictEqual(result, [student])
	})

	it("should list students by property", async () => {
		const studentRepository = new StudentRepository(db)
		await studentRepository.save(student)
		const result = await studentRepository.listBy("document", student.document)
		assert.ok(result.length === 1)
		assert.ok(result[0] instanceof Student)
		assert.deepStrictEqual(result, [student])
	})

	it("should find a student by id", async () => {
		const studentRepository = new StudentRepository(db)
		await studentRepository.save(student)
		const result = await studentRepository.findById(student.id)

		assert.ok(result instanceof Student)
		assert.deepStrictEqual(result, student)
	})
})
