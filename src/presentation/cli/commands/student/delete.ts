import enquirer from 'enquirer'
import {
	StudentCreationSchema,
	StudentCreationType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'
import chalk from 'chalk'

export async function deleteStudentHandler(
	service: StudentService,
	id?: StudentCreationType['id'],
) {
	let StudentId: Required<StudentCreationType['id']>
	if (id) {
		StudentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	service.remove(StudentId)
	console.log(chalk.yellow(`Student ${chalk.underline(StudentId)} deleted`))
}
