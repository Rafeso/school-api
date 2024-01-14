import { Parent } from '../domain/parent/Parent.js'
import { ParentCreationType } from '../domain/parent/types.js'
import { Service } from './BaseService.js'

export class ParentService extends Service<typeof Parent> {
	create(creationData: ParentCreationType): Parent {
		const entity = new Parent(creationData)
		this.repository.save(entity)
		return entity
	}

	update(id: string, newData: ParentCreationType) {
		const entity = this.findById(id)
		const updated = new Parent({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}
}
