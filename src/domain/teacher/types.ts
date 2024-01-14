import { z } from 'zod'

export const TeacherCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string(),
	surname: z.string(),
	document: z.string(),
	phone: z.string(),
	email: z.string(),
	hiringDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	salary: z.number().min(1),
	major: z.string(),
})

export type TeacherCreationType = z.infer<typeof TeacherCreationSchema>

export const TeacherUpdateSchema = TeacherCreationSchema.partial().omit({
	id: true,
})
export type TeacherUpdateType = z.infer<typeof TeacherUpdateSchema>
