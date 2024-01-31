import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise, spinners } from 'ora'
import { Class } from '../../../../domain/class/Class.js'
import { ClassCreationSchema } from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function createClassHandler(service: ClassService) {
	const response = await enquirer.prompt<{ code: string; teacher: string }>([
		{
			name: 'code',
			type: 'input',
			message: 'Class Code (Ex: 1A-M):',
			required: true,
			validate(value) {
				return ClassCreationSchema.shape.code.safeParse(value).success
			},
		},
		{
			name: 'teacher',
			type: 'input',
			message: 'Class Teacher:',
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
		text: 'Creating class...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to create class: ${err.message}`,
		successText: chalk.green(`Class ${chalk.underline(newClass.id)} created successfully`),
	}).then((classCreated) => console.log(inspect(classCreated.toObject(), { depth: null, colors: true })))
}
