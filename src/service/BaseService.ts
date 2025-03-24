import type { Database } from '../data/Db.js'
import { NotFoundError } from '../domain/@errors/NotFound.js'
import type { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Service<S extends SerializableStatic, I extends Serializable = InstanceType<S>> {
	constructor(protected repository: Database<S>) {}

	async findById(id: string) {
		const entity = await this.repository.findById(id)
		if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
		return entity
	}

	async list({ page, per_page }: { page: number; per_page: number }) {
		const entity = await this.repository.list()
		return entity.slice((page - 1) * per_page, page * per_page)
	}

	async listBy<L extends keyof Omit<I, 'toJSON' | 'toObject'>>(property: L, value: I[L]) {
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
