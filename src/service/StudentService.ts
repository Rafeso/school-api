import {
	Student,
	StudentCreationType,
	StudentUpdateType,
} from '../domain/Student.js'
import { Service } from './BaseService.js'

export class StudentService extends Service<typeof Student> {
	update(id: string, newData: StudentUpdateType) {
		const entity = this.findById(id)
		const updated = new Student({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}
	create(creationData: StudentCreationType) {
		const entity = new Student(creationData)
		this.repository.save(entity)
		return entity
	}
}
