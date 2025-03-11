import assert from 'assert'
import { after, afterEach, before, describe, it } from 'node:test'
import { appConfig } from '../../config.js'
import { Parent } from '../../domain/parent/Parent.js'
import { connectToDatabase } from '../connection.js'
import { ParentRepository } from './ParentRepository.js'

describe('ParentRepository', async () => {
	const { db } = await connectToDatabase(appConfig)
	const parent = new Parent({
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
	})

	before(async () => {
		await db.collection(Parent.collection).deleteMany({})
	})

	afterEach(async () => {
		await db.collection(Parent.collection).deleteMany({})
	})

	after(() => {
		process.exit()
	})

	it('should create a parent', async () => {
		const parentRepository = new ParentRepository(db)
		await parentRepository.save(parent)

		const result = await parentRepository.findById(parent.id)
		assert.ok(result instanceof Parent)
		assert.deepStrictEqual(result, parent)
	})

	it('should update a parent', async () => {
		const parentRepository = new ParentRepository(db)
		const newParent = new Parent({
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
		})
		await parentRepository.save(newParent)
		newParent.firstName = 'João'

		await parentRepository.save(newParent)
		const result = await parentRepository.findById(newParent.id)
		assert.ok(result instanceof Parent)

		assert.deepStrictEqual(result, newParent)
	})

	it('should list parents in database', async () => {
		const parentRepository = new ParentRepository(db)
		await parentRepository.save(parent)
		const result = await parentRepository.list()

		assert.ok(result[0] instanceof Parent)
		assert.ok(result.length === 1)
		assert.deepStrictEqual(result, [parent])
	})

	it('should list parents by property', async () => {
		const parentRepository = new ParentRepository(db)
		await parentRepository.save(parent)
		const result = await parentRepository.listBy('document', parent.document)
		assert.ok(result.length === 1)
		assert.ok(result[0] instanceof Parent)
		assert.deepStrictEqual(result, [parent])
	})

	it('should find a parent by id', async () => {
		const parentRepository = new ParentRepository(db)
		await parentRepository.save(parent)
		const result = await parentRepository.findById(parent.id)

		assert.ok(result instanceof Parent)
		assert.deepStrictEqual(result, parent)
	})
})
