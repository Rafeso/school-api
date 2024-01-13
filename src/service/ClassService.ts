import { Database } from '../data/Db.js'
import { Class, ClassCreationType, ClassUpdateType } from '../domain/Class.js'
import { Student } from '../domain/Student.js'
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
		const entity = new Class(creationData)
		this.repository.save(entity)
		return entity
	}

	getTeacher(classId: string) {
		const classEntity = this.findById(classId)

		const teacher = this.teacherService.findById(classEntity.id)
		return teacher
	}

	remove(classId: string) {
		const students = this.studentService.listBy('class', classId)

		this.repository.remove(classId)
	}

	getStudent(classId: string) {
		const classEntity = this.findById(classId)
		return this.studentService.listBy('class', classEntity.id) as Student[]
	}
}
