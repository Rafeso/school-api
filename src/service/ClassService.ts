import { Database } from '../data/Db.js'
import { Class, ClassCreationType, ClassUpdateType } from '../domain/Class.js'
import { ConflictError } from '../domain/Errors/Conflict.js'
import { DependencyConflictError } from '../domain/Errors/DependencyConflict.js'
import { MissingDependecyError } from '../domain/Errors/MissingDependecy.js'
import { Student } from '../domain/Student.js'
import { Teacher } from '../domain/Teacher.js'
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

	#assertsTeacherExists(teacherId?: string | null) {
		if (teacherId) {
			this.teacherService.findById(teacherId)
		}
	}

	update(id: string, newData: ClassUpdateType) {
		const entity = this.findById(id)
		this.#assertsTeacherExists(newData.teacher)

		const updated = new Class({ ...entity.toObject(), ...newData })
		this.repository.save(updated)
		return updated
	}
	create(creationData: ClassCreationType) {
		const existing = this.repository.listBy('code', creationData.code)
		if (existing) throw new ConflictError(this.repository.dbEntity, Class)

		const entity = new Class(creationData)
		this.repository.save(entity)
		return entity
	}

	getTeacher(classId: string) {
		const classEntity = this.findById(classId)
		if (!classEntity.teacher)
			throw new MissingDependecyError(Teacher, classId, Class)

		const teacher = this.teacherService.findById(classEntity.id)
		return teacher
	}

	remove(id: string) {
		const students = this.studentService.listBy('class', id)
		if (students.length > 0)
			throw new DependencyConflictError(Class, id, Student)

		this.repository.remove(id)
	}

	getStudent(classId: string) {
		const classEntity = this.findById(classId)
		return this.studentService.listBy('class', classEntity.id)
	}
}
