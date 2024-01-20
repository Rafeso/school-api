import { inspect } from 'util'
import enquirer from 'enquirer'

import {
	StudentCreationSchema,
	StudentCreationType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function findStudentHandler(service: StudentService, id?: string) {
	let StudentId: StudentCreationType['id']
	if (id) {
		StudentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Student id:',
			validate(value) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	try {
		const Student = service.findById(StudentId)
		console.log(inspect(Student, { depth: null, colors: true }))
	} catch (err) {
		console.error((err as Error).message)
	}
}
