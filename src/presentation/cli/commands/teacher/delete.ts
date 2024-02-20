import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { TeacherCreationSchema, TeacherCreationType } from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function deleteTeacherHandler(
	service: TeacherService,
	id?: TeacherCreationType['id'],
) {
	let teacherId: Required<TeacherCreationType['id']>
	if (id) {
		teacherId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		teacherId = id
	}

	const reponse = await inquirer.prompt<{ choice: boolean }>({
		type: 'confirm',
		name: 'choice',
		message: `Are you sure you want to delete teacher: ${chalk.underline.bold.yellowBright(
			teacherId,
		)} ?`,
	})

	if (reponse.choice === false) {
		process.exitCode = 1
		return console.warn(chalk.yellow('\nTeacher deletion aborted. You can exit safely now.'))
	}

	await oraPromise(service.remove(teacherId), {
		text: chalk.yellow('Deleting teacher...'),
		spinner: 'bouncingBar',
		failText: (err) =>
			chalk.red(`Failed to delete teacher ${chalk.underline(teacherId)}: ${err.message}`),
		successText: chalk.green(`Teacher ${chalk.underline(teacherId)} was deleted!`),
	})
}
