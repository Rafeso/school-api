import enquirer from 'enquirer'
import {
	StudentCreationType,
	StudentCreationSchema,
	StudentUpdateType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'
import { inspect } from 'node:util'
import chalk from 'chalk'
export async function updateStudentHandler(
	service: StudentService,
	id?: string,
) {
	let StudentId: Required<StudentCreationType['id']>
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

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [
			{ name: 'firstName' },
			{ name: 'surname' },
			{ name: 'birthDate' },
			{ name: 'allergies' },
			{ name: 'bloodType' },
			{ name: 'medications' },
			{ name: 'startDate' },
			{ name: 'document' },
			{ name: 'class' },
		],
	})

	console.log(response.field)

	const updated = await enquirer.prompt<StudentUpdateType>({
		type: 'input',
		name: response.field,
		message: `New ${response.field}:`,
	})

	const Student = service.update(StudentId, updated).toObject()
	console.log(chalk.green.underline.bold('\nStudent updated successfully!'))
	console.log(inspect(Student, { depth: null, colors: true }))
}
