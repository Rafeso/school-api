import { Parent, ParentCreationType } from '../domain/Parent'
import { Service } from './BaseService'

export class ParentService extends Service<typeof Parent> {
	create(creationData: ParentCreationType): Parent {
		const entity = new Parent(creationData)
		this.repository.save(entity)
		return entity
	}

	update(id: string, newData: ParentCreationType) {
		const entity = this.findById(id) as Parent
		const updated = new Parent({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}
}
