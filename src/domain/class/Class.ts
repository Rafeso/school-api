import { randomUUID } from 'node:crypto'
import { BaseDomain } from '../BaseDomain.js'
import { Teacher } from '../teacher/Teacher.js'
import { Serializable } from '../types.js'
import { ClassCreationSchema, ClassCreationType } from './types.js'

export class Class extends BaseDomain implements Serializable {
	code: ClassCreationType['code']
	accessor teacher: ClassCreationType['teacher']
	readonly id: string

	constructor(data: ClassCreationType) {
		super()
		const parsed = ClassCreationSchema.parse(data)
		this.code = parsed.code
		this.teacher = parsed.teacher
		this.id = parsed.id ?? randomUUID()
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = ClassCreationSchema.parse(data)
		return new Class(parsed)
	}

	toObject() {
		return {
			id: this.id,
			code: this.code,
			teacher: this.teacher,
		}
	}
}

export class ExtendedClass extends Class implements Serializable {
	teacherEntity: Teacher | null

	constructor(classEntity: Class, teacher?: Teacher) {
		super(classEntity.toObject())
		this.teacherEntity = teacher ?? null
	}

	toJSON() {
		return JSON.stringify(this.toObject())
	}

	toObject() {
		return {
			...super.toObject(),
			teacherEntity: this.teacherEntity
				? this.teacherEntity.toObject()
				: this.teacher,
		}
	}
}
