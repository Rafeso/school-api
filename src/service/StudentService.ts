import {
	StudenCreationType,
	Student,
	StudentUpdateType,
} from "../domain/Student"
import { Service } from "./BaseService"

export class StudentService extends Service<typeof Student> {
	update(id: string, newData: StudentUpdateType) {
		const entity = this.findById(id) as Student
		const updated = new Student({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)
		return updated
	}
	create(creationData: StudenCreationType) {
		const entity = new Student(creationData)
		this.repository.save(entity)
		return entity
	}
}
