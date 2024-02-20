import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { TeacherCreationSchema, TeacherCreationType } from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function findTeacherHandler(service: TeacherService, id?: string) {
	let TeacherId: TeacherCreationType['id']
	if (id) {
		TeacherId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		TeacherId = id
	}

	await oraPromise(service.findById(TeacherId), {
		text: chalk.cyan('Finding teacher...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find teacher ${TeacherId}: ${err.message}\n`)
		},
		successText: chalk.green('Teacher was found!\n'),
	}).then((teacher) => {
		console.log(inspect(teacher.toObject(), { depth: null, colors: true }))
	})
}
