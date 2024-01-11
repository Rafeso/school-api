import z from "zod";
import { randomUUID } from "node:crypto";
import { Serializable } from "../types";

export const ClassCreationSchema = z.object({
	id: z.string().uuid().optional(),
	code: z.string().regex(/^[0-9]{1}[A-H]{1}-[MTN]$/),
	teacher: z.string().uuid().nullable(),
});
export type ClassCreationType = z.infer<typeof ClassCreationSchema>;

export const ClassUpdateSchema = ClassCreationSchema.partial().omit({
	id: true,
});
export type ClassUpdateType = z.infer<typeof ClassUpdateSchema>;

export class Class implements Serializable {
	code: ClassCreationType["code"];
	accessor teacher: ClassCreationType["teacher"];
	readonly id: string;

	constructor(data: ClassCreationType) {
		const parsed = ClassCreationSchema.parse(data);
		this.code = parsed.code;
		this.teacher = parsed.teacher;
		this.id = parsed.id ?? randomUUID();
	}

	static fromObject(data: Record<string, unknown>) {
		const parsed = ClassCreationSchema.parse(data);
		return new Class(parsed);
	}

	toObject() {
		return {
			id: this.id,
			code: this.code,
			teacher: this.teacher,
		};
	}

	toJSON() {
		return JSON.stringify(this.toObject);
	}
}
