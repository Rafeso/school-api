import z from "zod";
import { AddressSchema, Serializable } from "./types";
import { randomUUID } from "node:crypto";

export const ParentCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	phones: z.array(z.string()).nonempty(),
	emails: z.array(z.string()).nonempty(),
	address: z.array(AddressSchema).nonempty(),
	document: z.string().min(1),
});

export type ParentCreationType = z.infer<typeof ParentCreationSchema>;

export class Parent implements Serializable {
	name: ParentCreationType["firstName"];
	surname: ParentCreationType["surname"];
	phones: ParentCreationType["phones"];
	emails: ParentCreationType["emails"];
	address: ParentCreationType["address"];
	document: ParentCreationType["document"];
	readonly id: string;

	constructor(data: ParentCreationType) {
		const parsed = ParentCreationSchema.parse(data);
		this.id = parsed.id ?? randomUUID();
		this.name = parsed.firstName;
		this.surname = parsed.surname;
		this.phones = parsed.phones;
		this.emails = parsed.emails;
		this.address = parsed.address;
		this.document = parsed.document;
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = ParentCreationSchema.parse(data);
		return new Parent(parsed);
	}

	toObject() {
		return {
			id: this.id,
			firstName: this.name,
			surname: this.surname,
			phones: this.phones,
			emails: this.emails,
			address: this.address,
			document: this.document,
		};
	}
	toJSON() {
		return JSON.stringify(this.toObject());
	}
}
