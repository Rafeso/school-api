import type { Database } from '../data/Db.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { Parent } from '../domain/parent/Parent.js'
import { Student } from '../domain/student/Student.js'
import { StudentMustHaveAtLeastOneParentError } from '../domain/student/errors/StudentMustHaveAtLeastOneParentError.js'
import type { StudentCreationType, StudentUpdateType } from '../domain/student/types.js'
import { Service } from './BaseService.js'
import type { ParentService } from './ParentService.js'

export class StudentService extends Service<typeof Student> {
	constructor(
		repository: Database<typeof Student>,
		private readonly parentService: ParentService,
	) {
		super(repository)
	}

	async #assertParentExists(parents?: string[]) {
		if (parents) {
			await Promise.all(parents.map((parentId: string) => this.parentService.findById(parentId)))
		}
	}

	async update(id: string, newData: Omit<StudentUpdateType, 'parents'>) {
		const entity = await this.findById(id)

		const entityObj = entity.toObject()
		const updated = new Student({
			id: entityObj.id,
			document: entityObj.document,
			firstName: newData.firstName ?? entityObj.firstName,
			surname: newData.surname ?? entityObj.surname,
			allergies: newData.allergies ? [...entityObj.allergies, ...newData.allergies] : entityObj.allergies,
			medications: newData.medications ? [...entityObj.medications, ...newData.medications] : entityObj.medications,
			bloodType: newData.bloodType ?? entityObj.bloodType,
			birthDate: entityObj.birthDate,
			class: newData.class ?? entityObj.class,
			parents: entityObj.parents,
			startDate: newData.startDate ?? entityObj.startDate,
		})
		await this.repository.save(updated)

		return updated
	}

	async create(data: StudentCreationType) {
		const studentAlreadyExists = await this.repository.listBy('document', data.document)

		if (studentAlreadyExists.length > 0) {
			throw new ConflictError(Student, data.document)
		}

		await this.#assertParentExists(data.parents)

		const entity = new Student(data)
		await this.repository.save(entity)

		return entity
	}

	async getParents(studentId: string) {
		const student = await this.findById(studentId)
		const parents = await Promise.all(student.parents.map((parentId: string) => this.parentService.findById(parentId)))

		return parents
	}

	async linkParents(id: string, parentsToUpdate: NonNullable<StudentUpdateType['parents']>) {
		const student = await this.findById(id)

		const checkIfParentIsAlreadyLinked = student.parents.filter((parent) => parentsToUpdate.includes(parent))
		if (checkIfParentIsAlreadyLinked.length > 0) {
			throw new ConflictError(Parent, parentsToUpdate)
		}

		await this.#assertParentExists(parentsToUpdate)

		student.parents = [...student.parents, ...parentsToUpdate]
		await this.repository.save(student)
		return student
	}

	async unlinkParent(id: string, parentToDelete: NonNullable<StudentUpdateType['parents']>) {
		const student = await this.findById(id)

		const checkIfisTheOnlyParent = await Promise.all(
			student.parents.map((parentId: string) => this.parentService.findById(parentId)),
		)
		if (checkIfisTheOnlyParent.length === 1) {
			throw new StudentMustHaveAtLeastOneParentError(Student, parentToDelete.toString(), Parent)
		}

		const updatedParents = student.parents.filter((parent) => !parentToDelete.includes(parent))
		student.parents = updatedParents as NonNullable<StudentUpdateType['parents']>
		await this.repository.save(student)
		return student
	}
}
