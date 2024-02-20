import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	StudentCreationSchema,
	StudentCreationType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function deleteStudentHandler(
	service: StudentService,
	id?: StudentCreationType['id'],
) {
	let StudentId: NonNullable<StudentCreationType['id']>
	if (id) {
		StudentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Student id:',
			validate(value: NonNullable<StudentCreationType['id']>) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	const response = await inquirer.prompt<{ choice: boolean }>({
		type: 'confirm',
		name: 'choice',
		message: `Are you sure you want to delete student: ${chalk.underline.bold.yellowBright(
			StudentId,
		)} ?`,
	})

	if (response.choice === false) {
		return console.info(
			chalk.yellow(
				'\nStudent deletion process aborted. You can exit safely now!',
			),
		)
	}

	await oraPromise(service.remove(StudentId), {
		text: 'Deleting student...',
		spinner: 'bouncingBar',
		failText: (err) =>
			chalk.red(
				`Failed to delete student ${chalk.underline(StudentId)}: ${
					err.message
				}`,
			),
		successText: chalk.cyan(
			`Student ${chalk.underline(StudentId)} was deleted!`,
		),
	})
}
