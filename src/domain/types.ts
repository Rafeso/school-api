import z from 'zod'

export const AddressSchema = z.object({
	street: z.string(),
	city: z.string(),
	country: z.string().optional(),
	zipCode: z.string(),
})

export type AddressType = z.infer<typeof AddressSchema>

export interface SerializableStatic {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	new (...args: any[]): any
	collection: string
	fromObject(data: Record<string, unknown>): InstanceType<this>
}

export interface Serializable {
	toJSON(): string
	toObject(): Record<string, unknown>
	id: string
}
