import { z } from 'zod'

export const ClassCreationSchema = z.object({
	id: z.string().uuid().optional(),
	code: z.string().regex(/^[0-9]{1}[A-H]{1}-[MTN]$/),
	teacher: z.string().uuid(),
})
export type ClassCreationType = z.infer<typeof ClassCreationSchema>

export const ClassUpdateSchema = ClassCreationSchema.partial().omit({
	id: true,
})
export type ClassUpdateType = z.infer<typeof ClassUpdateSchema>
