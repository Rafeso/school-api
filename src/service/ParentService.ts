import { BadRequestError } from '../domain/@errors/BadRequest.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { Parent } from '../domain/parent/Parent.js'
import type {
	ParentCreationType,
	ParentUpdateType,
} from '../domain/parent/types.js'
import { Service } from './BaseService.js'

export class ParentService extends Service<typeof Parent> {
	async create(creationData: ParentCreationType) {
		const existing = await this.repository.listBy(
			'document',
			creationData.document,
		)
		if (existing.length > 0) {
			throw new ConflictError(Parent, creationData.document)
		}
		const entity = new Parent(creationData)
		await this.repository.save(entity)
		return entity
	}

	async update(id: string, newData: ParentUpdateType) {
		const entity = await this.findById(id)
		const updated = new Parent({
			...entity.toObject(),
			...newData,
		})
		await this.repository.save(updated)
		return updated
	}

	async updatePhone(id: string, phone: ParentUpdateType['phones']) {
		if (!phone || phone.length === 0) {
			throw new BadRequestError(Parent, 'Phone cannot be empty')
		}
		const parent = await this.findById(id)
		parent.phones.push(...phone)
		await this.repository.save(parent)
		return parent
	}
}
