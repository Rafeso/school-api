import { Database } from '../data/Db.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'
import { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Service<S extends SerializableStatic, I extends Serializable = InstanceType<S>> {
	constructor(protected repository: Database<S>) {}

	async findById(id: string) {
		const entity = await this.repository.findById(id)
		if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
		return entity
	}

	async listAll() {
		return await this.repository.listAll()
	}

	async listBy<L extends keyof I>(property: L, value: I[L]) {
		const entity = await this.repository.listBy(property, value)
		return entity
	}

	async remove(id: string) {
		await this.repository.remove(id)
		return
	}

	abstract update(id: string, newData: unknown): Promise<I>
	abstract create(creationData: unknown): Promise<I>
}
