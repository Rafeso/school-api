import z from 'zod'

export const AddressSchema = z.object({
	street: z.string(),
	number: z.string(),
	neighborhood: z.string(),
	city: z.string(),
	state: z.string(),
	country: z.string().optional(),
	zipCode: z.string(),
})

export type AddressType = z.infer<typeof AddressSchema>

export interface SerializableStatic {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	new (...args: any[]): any
	fromObject(data: Record<string, unknown>): InstanceType<this>
}

export interface Serializable {
	toJSON(): string
	toObject(): Record<string, unknown>
	id: string
}
