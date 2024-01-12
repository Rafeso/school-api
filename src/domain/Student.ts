import { randomUUID } from 'node:crypto'
import z from 'zod'
import { BaseDomain } from './BaseDomain'
import { ParentCreationSchema } from './Parent'
import { Serializable } from './types'

export const StudentCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	birthDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	parents: z.array(ParentCreationSchema).nonempty(),
	allergies: z.array(z.string()).optional(),
	bloodType: z.string().max(3),
	medications: z.array(z.string()).optional(),
	startDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	document: z.string(),
	class: z.string().uuid(),
})

export type StudentCreationType = z.infer<typeof StudentCreationSchema>

export const StudendUpdateSchema = StudentCreationSchema.partial().omit({
	id: true,
})
export type StudentUpdateType = z.infer<typeof StudendUpdateSchema>

export class Student extends BaseDomain implements Serializable {
	firstName: StudentCreationType['firstName']
	surname: StudentCreationType['surname']
	birthDate: Date
	accessor parents: StudentCreationType['parents']
	allergies: StudentCreationType['allergies']
	bloodType: StudentCreationType['bloodType']
	medications: StudentCreationType['medications']
	startDate: StudentCreationType['startDate']
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
		this.startDate = parsed.startDate
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
			startDate: this.startDate,
			document: this.document,
			class: this.class,
		}
	}
}
