import { randomUUID } from 'node:crypto'
import { BaseDomain } from '../BaseDomain.js'
import { Parent } from '../parent/Parent.js'
import { Serializable } from '../types.js'
import { StudentCreationSchema, StudentCreationType } from './types.js'

export class Student extends BaseDomain implements Serializable {
	firstName: StudentCreationType['firstName']
	surname: StudentCreationType['surname']
	birthDate: Date
	accessor parents: StudentCreationType['parents']
	allergies: StudentCreationType['allergies']
	bloodType: StudentCreationType['bloodType']
	medications: StudentCreationType['medications']
	startDate: Date
	document: StudentCreationType['document']
	class: StudentCreationType['class']
	readonly id: string

	constructor(data: StudentCreationType) {
		super()
		const parsed = StudentCreationSchema.parse(data)
		this.id = parsed.id ?? randomUUID()
		this.firstName = parsed.firstName
		this.surname = parsed.surname
		this.birthDate = new Date(parsed.birthDate)
		this.parents = parsed.parents
		this.allergies = parsed.allergies
		this.bloodType = parsed.bloodType
		this.medications = parsed.medications
		this.startDate = new Date(parsed.startDate)
		this.document = parsed.document
		this.class = parsed.class
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = StudentCreationSchema.parse(data)
		return new Student(parsed)
	}

	toObject() {
		return {
			id: this.id,
			firstName: this.firstName,
			surname: this.surname,
			birthDate: this.birthDate.toISOString(),
			parents: this.parents,
			allergies: this.allergies,
			bloodType: this.bloodType,
			medications: this.medications,
			startDate: this.startDate.toISOString(),
			document: this.document,
			class: this.class,
		}
	}
}

export class ExtendedStudent extends Student {
	parentEntity: Parent[]

	constructor(studentEntity: Student, parents: Parent[]) {
		super(studentEntity.toObject())
		this.parentEntity = parents
	}

	toJSON() {
		return JSON.stringify(this.toObject())
	}

	toObject() {
		return {
			...super.toObject(),
			parentEntity: this.parentEntity,
		}
	}
}
