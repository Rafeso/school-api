import z from "zod";
import { randomUUID } from "node:crypto";
import { Serializable } from "../types";
import { ParentCreationSchema } from "../parent/Parent";

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
});

export type StudenCreationType = z.infer<typeof StudentCreationSchema>;

export const StudendUpdateSchema = StudentCreationSchema.partial().omit({
	id: true,
});
export type StudentUpdateType = z.infer<typeof StudendUpdateSchema>;

export class Studend implements Serializable {
	name: StudenCreationType["firstName"];
	surname: StudenCreationType["surname"];
	birthDate: Date;
	accessor parents: StudenCreationType["parents"];
	allergies: StudenCreationType["allergies"];
	bloodType: StudenCreationType["bloodType"];
	medications: StudenCreationType["medications"];
	startDate: StudenCreationType["startDate"];
	document: StudenCreationType["document"];
	class: StudenCreationType["class"];
	readonly id: string;

	constructor(data: StudenCreationType) {
		const parsed = StudentCreationSchema.parse(data);
		this.id = parsed.id ?? randomUUID();
		this.name = parsed.firstName;
		this.surname = parsed.surname;
		this.birthDate = new Date(parsed.birthDate);
		this.parents = parsed.parents;
		this.allergies = parsed.allergies;
		this.bloodType = parsed.bloodType;
		this.medications = parsed.medications;
		this.startDate = parsed.startDate;
		this.document = parsed.document;
		this.class = parsed.class;
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = StudentCreationSchema.parse(data);
		return new Studend(parsed);
	}

	toObject() {
		return {
			id: this.id,
			firstName: this.name,
			surname: this.surname,
			birthDate: this.birthDate,
			parents: this.parents,
			allergies: this.allergies,
			bloodType: this.bloodType,
			medications: this.medications,
			startDate: this.startDate,
			document: this.document,
			class: this.class,
		};
	}

	toJSON() {
		return JSON.stringify(this.toObject());
	}
}
