import { Database } from '../data/Db.js'
import { BadRequestError } from '../domain/@errors/BadRequest.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { Parent } from '../domain/parent/Parent.js'
import { StudentMustHaveAtLeastOneParentError } from '../domain/student/@errors/StudentMustHaveAtLeastOneParentError.js'
import { Student } from '../domain/student/Student.js'
import type {
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
		const studentAlreadyExists = await this.repository.listBy(
			'document',
			creationData.document,
		)

		if (studentAlreadyExists.length > 0) {
			throw new ConflictError(Student, creationData.document)
		}

		creationData.parents.map((parentId) =>
			this.parentService.findById(parentId),
		)
		const entity = new Student(creationData)
		await this.repository.save(entity)

		return entity
	}

	async getParents(studentId: string) {
		const student = await this.findById(studentId)
		const parents = await Promise.all(
			student.parents.map((parentId: string) =>
				this.parentService.findById(parentId),
			),
		)

		return parents
	}

	async linkParents(
		id: string,
		parentsToUpdate: StudentCreationType['parents'],
	) {
		const student = await this.findById(id)

		const checkIfParentIsAlreadyLinked = await this.getParents(id)
		if (checkIfParentIsAlreadyLinked.length > 0) {
			throw new ConflictError(Parent, parentsToUpdate)
		}

		parentsToUpdate.map((parentId) => this.parentService.findById(parentId)) // Check in parent service if parent exists, and throw an NotFoundError if not.

		student.parents.push(...parentsToUpdate)
		await this.repository.save(student)
		return student
	}

	async unlinkParent(
		id: string,
		parentToDelete: NonNullable<StudentUpdateType['parents']>,
	) {
		const student = await this.findById(id)

		const checkIfisTheOnlyParent = await this.getParents(id)
		if (checkIfisTheOnlyParent.length === 1) {
			throw new StudentMustHaveAtLeastOneParentError(
				Student,
				parentToDelete.toString(),
				Parent,
			)
		}

		parentToDelete.map((parentId) => this.parentService.findById(parentId)) // Check in parent service if parent exists, and throw an NotFoundError if not.

		student.parents = student.parents.filter(
			(parent) => !parentToDelete.includes(parent),
		) as NonNullable<StudentUpdateType['parents']>
		await this.repository.save(student)
		return
	}

	async updateMedications(
		id: string,
		medicationsToUpdate: StudentUpdateType['medications'],
	) {
		const student = await this.findById(id)

		if (!medicationsToUpdate || medicationsToUpdate.length === 0) {
			throw new BadRequestError(Student, "Medications can't be empty")
		}

		student.medications?.push(...medicationsToUpdate)
		await this.repository.save(student)
		return student
	}

	async removeMedications(
		id: string,
		medicationsToRemove: StudentCreationType['medications'],
	) {
		if (!medicationsToRemove || medicationsToRemove.length === 0) {
			throw new BadRequestError(Student, "Medications can't be empty")
		}

		const student = await this.findById(id)
		student.medications = student.medications?.filter(
			(medication) => !medicationsToRemove.includes(medication),
		) as NonNullable<StudentCreationType['medications']>
		await this.repository.save(student)
		return
	}
}
