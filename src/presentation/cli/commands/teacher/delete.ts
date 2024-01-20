import enquirer from 'enquirer'
import {
	TeacherCreationSchema,
	TeacherCreationType,
} from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function deleteTeacherHandler(
	service: TeacherService,
	id?: TeacherCreationType['id'],
) {
	let teacherId: Required<TeacherCreationType['id']>
	if (id) {
		teacherId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		teacherId = id
	}
	service.remove(teacherId)
	console.log(`Teacher ${teacherId} deleted`)
}
