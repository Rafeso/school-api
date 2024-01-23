import { Database } from '../data/Db.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { ExtendedStudent, Student } from '../domain/student/Student.js'
import {
	StudentCreationType,
	StudentUpdateType,
} from '../domain/student/types.js'
import { Service } from './BaseService.js'
import { ParentService } from './ParentService.js'

export class StudentService extends Service<typeof Student> {
	constructor(
		repository: Database<typeof Student>,
		private readonly parentService: ParentService,
	) {
		super(repository)
	}

	update(id: string, newData: StudentUpdateType) {
		const entity = this.findById(id)
		const updated = new Student({
			...entity.toObject(),
			...newData,
		})
		this.repository.save(updated)

		const parents = this.getParents(updated.id)
		return new ExtendedStudent(updated, parents)
	}
	create(creationData: StudentCreationType) {
		const existing = this.repository.listBy('document', creationData.document)

		if (existing.length > 0)
			throw new ConflictError(Student, creationData.document)

		const parents = creationData.parents.map((parentId) =>
			this.parentService.findById(parentId),
		)
		const entity = new Student(creationData)
		this.repository.save(entity)

		return new ExtendedStudent(entity, parents)
	}

	listAll() {
		const entities = this.repository.listAll()
		return entities.map((student) => {
			const parents = this.getParents(student)
			return new ExtendedStudent(student, parents)
		})
	}

	getParents(studentIdOrEntity: string | Student) {
		const student =
			typeof studentIdOrEntity === 'string'
				? this.findById(studentIdOrEntity)
				: studentIdOrEntity
		return student.parents.map((parentId) =>
			this.parentService.findById(parentId),
		)
	}

	linkParents(id: string, parentsToUpdate: StudentCreationType['parents']) {
		const student = this.findById(id)
		const parents = parentsToUpdate.map((parentId) =>
			this.parentService.findById(parentId),
		)

		student.parents = parentsToUpdate
		this.repository.save(student)
		return new ExtendedStudent(student, parents)
	}
}
