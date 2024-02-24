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
			return chalk.red(`Failed to update parent phone: ${err.message}\n`)
		},
		successText: chalk.magentaBright.bold(
			'Parent phones updated successfully!\n',
		),
	}).then((parent) =>
		console.log(inspect(parent.toObject(), { depth: null, colors: true })),
	)
}
