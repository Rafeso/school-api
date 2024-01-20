import { inspect } from 'util'
import enquirer from 'enquirer'

import {
	TeacherCreationSchema,
	TeacherCreationType,
} from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function findTeacherHandler(service: TeacherService, id?: string) {
	let TeacherId: TeacherCreationType['id']
	if (id) {
		TeacherId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		TeacherId = id
	}

	try {
		const Teacher = service.findById(TeacherId)
		console.log(inspect(Teacher, { depth: null, colors: true }))
	} catch (err) {
		console.error((err as Error).message)
	}
}
