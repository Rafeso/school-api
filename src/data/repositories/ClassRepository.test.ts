import assert from "node:assert"
import { after, afterEach, before, describe, it } from "node:test"
import { appConfig } from "../../config.js"
import { Class } from "../../domain/class/Class.js"
import { connectToDatabase } from "../connection.js"
import { ClassRepository } from "./ClassRepository.js"

describe("ClassRepository", async () => {
	const { db, close } = await connectToDatabase(appConfig)
	const classEntity = new Class({
		code: "1B-M",
		teacher: null,
	})

	before(async () => {
		await db.collection(Class.collection).deleteMany({})
	})

	afterEach(async () => {
		await db.collection(Class.collection).deleteMany({})
	})

	after(() => {
		process.exit()
	})

	it("should find a class by id", async () => {
		const classRepository = new ClassRepository(db)
		await classRepository.save(classEntity)
		const result = await classRepository.findById(classEntity.id)
		assert.ok(result instanceof Class)
		assert.deepStrictEqual(result, classEntity)
	})

	it("should create a class", async () => {
		const classRepository = new ClassRepository(db)
		await classRepository.save(classEntity)
		const result = await classRepository.findById(classEntity.id)
		assert.deepStrictEqual(result, classEntity)
	})

	it("should list classes in database", async () => {
		const classRepository = new ClassRepository(db)
		await classRepository.save(classEntity)
		const result = await classRepository.list()
		assert.ok(result.length === 1)
		assert.ok(result[0] instanceof Class)
		assert.deepStrictEqual(result, [classEntity])
	})

	it("should update a class", async () => {
		const classRepository = new ClassRepository(db)
		const newClass = new Class({
			code: "1B-M",
			teacher: null,
		})
		await classRepository.save(newClass)

		newClass.code = "2B-M"
		await classRepository.save(newClass)
		const entity = await classRepository.findById(newClass.id)
		assert.ok(entity instanceof Class)
		assert.deepStrictEqual(entity, newClass)
	})

	it("should list classes by property", async () => {
		const classRepository = new ClassRepository(db)
		await classRepository.save(classEntity)
		const result = await classRepository.listBy("code", classEntity.code)
		assert.ok(result.length === 1)
		assert.ok(result[0] instanceof Class)
		assert.deepStrictEqual(result, [classEntity])
	})

	it("should remove a class from the database", async () => {
		const classRepository = new ClassRepository(db)
		await classRepository.save(classEntity)
		const entity = await classRepository.list()
		assert.ok(entity.length === 1)
		classRepository.remove(entity[0].id)
		const result = await classRepository.list()
		assert.ok(result.length === 0)
	})
})
