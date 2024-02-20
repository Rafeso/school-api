import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { ParentCreationSchema } from '../../../../../domain/parent/types.js'
import { ParentService } from '../../../../../service/ParentService.js'

export async function updatePhone(service: ParentService, id: string) {
	const { phone } = await inquirer.prompt<{ phone: string }>({
		type: 'input',
		name: 'phone',
		message: chalk.cyan('New phone:'),
		validate(value) {
			return ParentCreationSchema.shape.phones.safeParse([value]).success
		},
	})

	await oraPromise(service.updatePhone(id, [phone]), {
		text: chalk.cyan('Updating parent phones...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to update parent phone: ${err.message}`)
		},
		successText: chalk.magentaBright.bold('Parent phones updated successfully!'),
	}).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
}

export async function updateEmail(service: ParentService, id: string) {
	const { email } = await inquirer.prompt<{ email: string }>({
		type: 'input',
		name: 'email',
		message: 'New email:',
		validate(value) {
			return ParentCreationSchema.shape.emails.safeParse([value]).success
		},
	})

	await oraPromise(service.updateEmail(id, [email]), {
		text: 'Updating parent email...',
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to update parent email: ${err.message}`)
		},
		successText: chalk.magentaBright.bold('Parent emails updated successfully!'),
	}).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
}
