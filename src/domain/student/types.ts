import { z } from 'zod'

export const StudentCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string().min(1),
	surname: z.string().min(1),
	birthDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	parents: z.array(z.string().uuid()).nonempty(),
	allergies: z.array(z.string()).optional(),
	bloodType: z.string().max(3),
	medications: z.array(z.string()).optional(),
	startDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	document: z.string().min(1),
	class: z.string().uuid(),
})

export type StudentCreationType = z.infer<typeof StudentCreationSchema>

export const StudentUpdateSchema = StudentCreationSchema.partial().omit({
	id: true,
	parents: true,
})
export type StudentUpdateType = z.infer<typeof StudentUpdateSchema>
