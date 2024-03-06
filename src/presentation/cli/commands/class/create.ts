import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { Class } from '../../../../domain/class/Class.js'
import { ClassCreationSchema } from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function createClassHandler(service: ClassService) {
	const response = await inquirer.prompt<{ code: string; teacher: string }>([
		{
			name: 'code',
			type: 'input',
			message: 'Class code (Ex: 1A-M):',
			required: true,
			validate(value) {
				return ClassCreationSchema.shape.code.safeParse(value).success
			},
		},
		{
			name: 'teacher',
			type: 'input',
			message: 'Class teacher (id):',
			validate(value) {
				return ClassCreationSchema.shape.teacher.safeParse(value).success
			},
		},
	])
	const newClass = new Class({
		code: response.code,
		teacher: response.teacher,
	})

	await oraPromise(service.create(newClass), {
		text: chalk.cyan('Creating class...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to create class: ${err.message}`)
		},
		successText: chalk.magentaBright.bold('Class created successfully!\n'),
	}).then((classCreated) =>
		console.log(
			inspect(classCreated.toObject(), { depth: null, colors: true }),
		),
	)
}
