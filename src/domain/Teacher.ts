import { randomUUID } from 'node:crypto'
import z from 'zod'
import { BaseDomain } from './BaseDomain.js'
import { Serializable } from './types.js'

export const TeacherCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	document: z.string(),
	phone: z.string(),
	email: z.string(),
	hiringDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	salary: z.number().min(1),
	major: z.string(),
})

export type TeacherCreationType = z.infer<typeof TeacherCreationSchema>

export const TeacherUpdateSchema = TeacherCreationSchema.partial().omit({
	id: true,
})
export type TeacherUpdateType = z.infer<typeof TeacherUpdateSchema>

export class Teacher extends BaseDomain implements Serializable {
	firstName: TeacherCreationType['firstName']
	surname: TeacherCreationType['surname']
	document: TeacherCreationType['document']
	phone: TeacherCreationType['phone']
	email: TeacherCreationType['email']
	hiringDate: Date
	salary: TeacherCreationType['salary']
	major: TeacherCreationType['major']
	readonly id: string

	constructor(data: TeacherCreationType) {
		super()
		const parsed = TeacherCreationSchema.parse(data)
		this.id = parsed.id ?? randomUUID()
		this.firstName = parsed.firstName
		this.surname = parsed.surname
		this.phone = parsed.phone
		this.email = parsed.email
		this.document = parsed.document
		this.hiringDate = new Date(parsed.hiringDate)
		this.salary = parsed.salary
		this.major = parsed.major
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = TeacherCreationSchema.parse(data)
		return new Teacher(parsed)
	}

	toObject() {
		return {
			id: this.id,
			firstName: this.firstName,
			surname: this.surname,
			document: this.document,
			phone: this.phone,
			email: this.email,
			hiringDate: this.hiringDate.toISOString(),
			salary: this.salary,
			major: this.major,
		}
	}
}
