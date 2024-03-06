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
	id?: string,
) {
	let StudentId: NonNullable<StudentCreationType['id']>
	if (id) {
		StudentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Student id:',
			validate(value) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	await oraPromise(service.findById(StudentId), {
		text: chalk.cyan('Finding student...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find student: ${err.message}\n`)
		},
	})

	const { confirmDeletion } = await inquirer.prompt<{
		confirmDeletion: boolean
	}>({
		type: 'confirm',
		name: 'confirmDeletion',
		message: `Are you sure you want to delete student: ${chalk.underline.bold.yellowBright(
			StudentId,
		)} ?`,
	})

	if (!confirmDeletion) {
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
				}\n`,
			),
		successText: chalk.cyan(
			`Student ${chalk.underline(StudentId)} was deleted!`,
		),
	})
}
