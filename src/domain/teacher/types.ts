import { z } from 'zod'

export const TeacherCreationSchema = z.object({
	id: z.string().uuid().optional(),
	firstName: z.string().min(1),
	surname: z.string().min(1),
	document: z.string().min(1),
	phone: z.string().min(1),
	email: z.string().email().min(1),
	hiringDate: z
		.string()
		.datetime()
		.refine((date) => !Number.isNaN(new Date(date).getTime())),
	salary: z.number().min(1),
	major: z.string().min(1),
})

export type TeacherCreationType = z.infer<typeof TeacherCreationSchema>

export const TeacherUpdateSchema = TeacherCreationSchema.partial().omit({
	id: true,
})
export type TeacherUpdateType = z.infer<typeof TeacherUpdateSchema>
