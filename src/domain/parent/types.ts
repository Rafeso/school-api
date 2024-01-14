import { z } from 'zod'
import { AddressSchema } from '../types.js'

export const ParentCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	phones: z.array(z.string()).nonempty(),
	emails: z.array(z.string()).nonempty(),
	address: z.array(AddressSchema).nonempty(),
	document: z.string().min(1),
})

export type ParentCreationType = z.infer<typeof ParentCreationSchema>

export const ParentUpdateSchema = ParentCreationSchema.partial().omit({
	id: true,
})
export type ParentUpdateType = z.infer<typeof ParentUpdateSchema>
