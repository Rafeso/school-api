import { z } from 'zod'
import { ParentCreationSchema } from '../parent/types.js'

export const StudentCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	birthDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	parents: z.string().uuid().array().nonempty(),
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
