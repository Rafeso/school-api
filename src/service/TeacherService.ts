import { ConflictError } from '../domain/@errors/Conflict.js'
import { Teacher } from '../domain/teacher/Teacher.js'
import type { TeacherCreationType, TeacherUpdateType } from '../domain/teacher/types.js'
import { Service } from './BaseService.js'

export class TeacherService extends Service<typeof Teacher> {
	async update(id: string, newData: TeacherUpdateType) {
		const entity = await this.findById(id)
		const updated = new Teacher({
			id: entity.id,
			document: entity.document,
			firstName: newData.firstName ?? entity.firstName,
			surname: newData.surname ?? entity.surname,
			email: newData.email ?? entity.email,
			phone: newData.phone ?? entity.phone,
			hiringDate: entity.hiringDate.toISOString(),
			salary: newData.salary ?? entity.salary,
			major: newData.major ?? entity.major,
		})

		await this.repository.save(updated)
		return updated
	}

	async create(creationData: TeacherCreationType) {
		const existing = await this.repository.listBy('document', creationData.document)
		if (existing.length > 0) {
			throw new ConflictError(Teacher, creationData.document)
		}
		const entity = new Teacher(creationData)
		await this.repository.save(entity)
		return entity
	}
}
