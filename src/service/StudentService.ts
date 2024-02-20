import { Database } from '../data/Db.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { Parent } from '../domain/parent/Parent.js'
import { StudentMustHaveAtLeastOneParentError } from '../domain/student/@errors/StudentMustHaveAtLeastOneParentError.js'
import { Student } from '../domain/student/Student.js'
import { StudentCreationType, StudentUpdateType } from '../domain/student/types.js'
import { Service } from './BaseService.js'
import { ParentService } from './ParentService.js'

export class StudentService extends Service<typeof Student> {
	constructor(
		repository: Database<typeof Student>,
		private readonly parentService: ParentService,
	) {
		super(repository)
	}

	async update(id: string, newData: StudentUpdateType) {
		const entity = await this.findById(id)
		const updated = new Student({
			...entity.toObject(),
			...newData,
		})
		await this.repository.save(updated)

		return updated
	}

	async create(creationData: StudentCreationType) {
		const existing = await this.repository.listBy('document', creationData.document)

		if (existing.length > 0) throw new ConflictError(Student, creationData.document)

		creationData.parents.map((parentId) => this.parentService.findById(parentId))
		const entity = new Student(creationData)
		await this.repository.save(entity)

		return entity
	}

	async getParents(studentId: string) {
		const student = await this.findById(studentId)
		const parents = await Promise.all(
			student.parents.map((parentId: string) => this.parentService.findById(parentId)),
		)

		return parents
	}

	async linkParents(id: string, parentsToUpdate: StudentCreationType['parents']) {
		const student = await this.findById(id)

		const checkParent = await this.getParents(id)
		if (checkParent.length > 1) {
			throw new ConflictError(Parent, parentsToUpdate)
		}
		parentsToUpdate.map((parentId) => this.parentService.findById(parentId))

		student.parents.push(...parentsToUpdate)
		await this.repository.save(student)
		return student
	}

	async unlinkParent(id: string, parentToDelete: StudentCreationType['parents']) {
		const student = await this.findById(id)

		const checkIfisTheOnlyParent = await this.getParents(id)
		if (checkIfisTheOnlyParent.length === 1) {
			throw new StudentMustHaveAtLeastOneParentError(Student, parentToDelete.toString(), Parent)
		}

		student.parents = student.parents.filter(
			(parent) => !parentToDelete.includes(parent),
		) as StudentCreationType['parents']
		await this.repository.save(student)
		return student
	}

	async updateAllergies(id: string, allergies: NonNullable<StudentUpdateType['allergies']>) {
		const student = await this.findById(id)
		student.allergies?.push(...allergies)
		await this.repository.save(student)
		return student
	}

	async updateMedications(
		id: string,
		medications: NonNullable<StudentCreationType['medications']>,
	) {
		const student = await this.findById(id)
		student.medications?.push(...medications)
		await this.repository.save(student)
		return student
	}
}
