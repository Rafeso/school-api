import { randomUUID } from 'node:crypto'
import { BaseDomain } from '../BaseDomain.js'
import { Serializable } from '../types.js'
import { ParentCreationSchema, ParentCreationType } from './types.js'

export class Parent extends BaseDomain implements Serializable {
	firstName: ParentCreationType['firstName']
	surname: ParentCreationType['surname']
	phones: ParentCreationType['phones']
	emails: ParentCreationType['emails']
	address: ParentCreationType['address']
	document: ParentCreationType['document']
	readonly id: string

	constructor(data: ParentCreationType) {
		super()
		const parsed = ParentCreationSchema.parse(data)
		this.id = parsed.id ?? randomUUID()
		this.firstName = parsed.firstName
		this.surname = parsed.surname
		this.phones = parsed.phones
		this.emails = parsed.emails
		this.address = parsed.address
		this.document = parsed.document
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = ParentCreationSchema.parse(data)
		return new Parent(parsed)
	}

	toObject() {
		return {
			id: this.id,
			firstName: this.firstName,
			surname: this.surname,
			phones: this.phones,
			emails: this.emails,
			address: this.address,
			document: this.document,
		}
	}
}
