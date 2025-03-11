import { Collection, Db } from 'mongodb'
import { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Database<
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
> {
	readonly db: Collection
	readonly dbEntity: S

	constructor(connection: Db, entity: S) {
		this.db = connection.collection(entity.collection)
		this.dbEntity = entity
	}

	async findById(id: string) {
		const document = await this.db.findOne({ id })

		if (!document) return null
		return this.dbEntity.fromObject(document)
	}

	async list() {
		const documents = await this.db.find().toArray()
		return documents.map<I>((document) => this.dbEntity.fromObject(document))
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async listBy<L extends keyof I>(property: L, value: I[any]) {
		const command = { [property]: value }
		if (Array.isArray(value)) {
			command[property as string] = { $in: value }
		}
		const documents = await this.db.find(command).toArray()
		return documents.map((document) => this.dbEntity.fromObject(document))
	}

	async remove(id: string) {
		await this.db.deleteOne({ id })
	}

	async save(entity: I) {
		return await this.db.replaceOne({ id: entity.id }, entity.toObject(), {
			upsert: true,
		})
	}
}
