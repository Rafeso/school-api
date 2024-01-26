import { ConflictError } from '../domain/@errors/Conflict.js'
import { Parent } from '../domain/parent/Parent.js'
import { ParentCreationType, ParentUpdateType } from '../domain/parent/types.js'
import { Service } from './BaseService.js'

export class ParentService extends Service<typeof Parent> {
	create(creationData: ParentCreationType) {
		const existing = this.repository.listBy('document', creationData.document)
		if (existing.length > 0) {
			throw new ConflictError(Parent, creationData.document)
		}
		const entity = new Parent(creationData)
		this.repository.save(entity)
		return entity
	}

	update(id: string, newData: ParentUpdateType) {
		const entity = this.findById(id)
		const updated = new Parent({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}
}
