import { Database } from '../data/Db.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'
import { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Service<
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
> {
	constructor(protected repository: Database<S>) {}

	async findById(id: string) {
		const entity = await this.repository.findById(id)
		if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
		return entity
	}

	async list(page = 1, perPage = 20) {
		const entity = await this.repository.list()
		return entity.slice((page - 1) * perPage, page * perPage)
	}

	async listBy<L extends keyof I>(property: L, value: I[L]) {
		const entity = await this.repository.listBy(property, value)
		return entity
	}

	async remove(id: string) {
		const entity = await this.findById(id)
		if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
		await this.repository.remove(id)
		return
	}

	abstract update(id: string, newData: unknown): Promise<I>
	abstract create(creationData: unknown): Promise<I>
}
