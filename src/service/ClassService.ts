import { Database } from '../data/Db.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { DependencyConflictError } from '../domain/@errors/DependencyConflict.js'
import { MissingDependecyError } from '../domain/@errors/MissingDependecy.js'
import { Class } from '../domain/class/Class.js'
import { ClassCreationType, ClassUpdateType } from '../domain/class/types.js'
import { Student } from '../domain/student/Student.js'
import { Teacher } from '../domain/teacher/Teacher.js'
import { Service } from './BaseService.js'
import { StudentService } from './StudentService.js'
import { TeacherService } from './TeacherService.js'

export class ClassService extends Service<typeof Class> {
	constructor(
		repository: Database<typeof Class>,
		private readonly teacherService: TeacherService,
		private readonly studentService: StudentService,
	) {
		super(repository)
	}

	async #assertTeacherExists(teacherId?: string | null) {
		if (teacherId) {
			await this.teacherService.findById(teacherId)
		}
	}

	async update(id: string, newData: ClassUpdateType) {
		const entity = await this.findById(id)
		this.#assertTeacherExists(newData.teacher)

		const updated = new Class({ ...entity.toObject(), ...newData })
		await this.repository.save(updated)
		return updated
	}

	async create(creationData: ClassCreationType) {
		const existing = await this.repository.listBy('code', creationData.code)
		if (existing.length > 0) throw new ConflictError(Class, creationData.code)

		await this.#assertTeacherExists(creationData.teacher)

		const entity = new Class(creationData)
		await this.repository.save(entity)

		return entity
	}

	async getTeacher(classId: string) {
		const classEntity = await this.findById(classId)
		if (!classEntity.teacher) throw new MissingDependecyError(Teacher, classId, Class)

		const teacher = await this.teacherService.findById(classEntity.id)
		return teacher
	}

	async remove(id: string) {
		const students = await this.studentService.listBy('class', id)
		if (students.length > 0) throw new DependencyConflictError(Class, id, Student)

		await this.repository.remove(id)
	}

	async getStudent(classId: string) {
		const classEntity = await this.findById(classId)
		return this.studentService.listBy('class', classEntity.id)
	}
}
