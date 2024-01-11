import { Database } from "../data/Db"
import { Serializable, SerializableStatic } from "../domain/types"

export abstract class Service<
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
> {
	constructor(protected repository: Database<S>) {}

	findById(id: string) {
		const entity = this.repository.findByiD(id)
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
