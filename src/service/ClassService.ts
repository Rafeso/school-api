import { Database } from '../data/Db.js'
import { ConflictError } from '../domain/@errors/Conflict.js'
import { DependencyConflictError } from '../domain/@errors/DependencyConflict.js'
import { MissingDependecyError } from '../domain/@errors/MissingDependecy.js'
import { Class, ExtendedClass } from '../domain/class/Class.js'
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

	#assertTeacherExists(teacherId?: string | null) {
		if (teacherId) {
			this.teacherService.findById(teacherId)
		}
	}

	update(id: string, newData: ClassUpdateType) {
		const entity = this.findById(id)
		this.#assertTeacherExists(newData.teacher)

		const updated = new Class({ ...entity.toObject(), ...newData })
		this.repository.save(updated)

		if (!updated.teacher) return new ExtendedClass(updated)

		const teacher = this.teacherService.findById(updated.teacher)
		return new ExtendedClass(updated, teacher)
	}

	create(creationData: ClassCreationType) {
		const existing = this.repository.listBy('code', creationData.code)
		if (existing.length > 0) throw new ConflictError(Class, creationData.code)

		this.#assertTeacherExists(creationData.teacher)

		const entity = new Class(creationData)
		this.repository.save(entity)

		if (entity.teacher) {
			const teacher = this.teacherService.findById(entity.teacher)
			return new ExtendedClass(entity, teacher)
		}

		return new ExtendedClass(entity)
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
