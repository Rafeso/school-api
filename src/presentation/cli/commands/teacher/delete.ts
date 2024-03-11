import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	TeacherCreationSchema,
	TeacherCreationType,
} from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'
import { logger } from '../../../../utils/logger.js'

export async function deleteTeacherHandler(
	service: TeacherService,
	id?: string,
) {
	let teacherId: NonNullable<TeacherCreationType['id']>
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

	const { confirmDeletion } = await inquirer.prompt<{
		confirmDeletion: boolean
	}>({
		type: 'confirm',
		name: 'confirmDeletion',
		message: `Are you sure you want to delete teacher: ${chalk.underline.bold.yellowBright(
			teacherId,
		)} ?`,
	})

	if (!confirmDeletion) {
		logger.info('\nTeacher deletion aborted. exiting...')
		process.exit(0)
	}

	await oraPromise(service.remove(teacherId), {
		text: chalk.cyan('Deleting teacher...'),
		spinner: 'bouncingBar',
		failText: (err) => chalk.red(`Failed to delete teacher: ${err.message}\n`),
		successText: chalk.green(
			`Teacher ${chalk.underline(teacherId)} was deleted!`,
		),
	})
}
