import { Database } from '@data/Db.js'
import { NotFoundError } from '@domain/@errors/NotFound.js'
import type { Serializable, SerializableStatic } from '@domain/types.js'

export abstract class Service<
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
> {
	constructor(protected repository: Database<S>) {}

	findById(id: string) {
		const entity = this.repository.findById(id)
		if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
		return entity
	}

	listAll() {
		return this.repository.listAll()
	}

	listBy<L extends keyof I>(property: L, value: I[L]) {
		const entity = this.repository.listBy(property, value)
		return entity
	}

	remove(id: string) {
		this.repository.remove(id)
		return
	}

	abstract update(id: string, newData: unknown): I
	abstract create(creationData: unknown): I
}
