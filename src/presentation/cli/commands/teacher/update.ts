import enquirer from 'enquirer'
import {
	TeacherCreationType,
	TeacherCreationSchema,
	TeacherUpdateType,
} from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'
import { inspect } from 'node:util'
import chalk from 'chalk'
export async function updateTeacherHandler(
	service: TeacherService,
	id?: string,
) {
	let TeacherId: Required<TeacherCreationType['id']>
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

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [{ name: 'firstName' }, { name: 'surname' }],
	})

	console.log(response.field)

	const updated = await enquirer.prompt<TeacherUpdateType>({
		type: 'input',
		name: response.field,
		message: `New ${response.field}:`,
	})

	const teacher = service.update(TeacherId, updated).toObject()
	console.log(chalk.green.underline.bold('\nTeacher updated successfully!'))
	console.log(inspect(teacher, { depth: null, colors: true }))
}
