import {
	Teacher,
	TeacherCreationType,
	TeacherUpdateType,
} from '../domain/Teacher.js'
import { Service } from './BaseService.js'

export class TeacherService extends Service<typeof Teacher> {
	update(id: string, newData: TeacherUpdateType) {
		const entity = this.findById(id)
		const updated = new Teacher({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}

	create(creationData: TeacherCreationType) {
		const entity = new Teacher(creationData)
		this.repository.save(entity)
		return entity
	}
}
