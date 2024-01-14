import { randomUUID } from 'node:crypto'
import { BaseDomain } from '../BaseDomain.js'
import { Serializable } from '../sharedTypes.js'
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
