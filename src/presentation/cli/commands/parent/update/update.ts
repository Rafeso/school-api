import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	ParentCreationSchema,
	ParentCreationType,
	ParentUpdateType,
} from '../../../../../domain/parent/types.js'
import { ParentService } from '../../../../../service/ParentService.js'
import { updateEmail, updatePhone } from './prompt.js'

export async function updateParentHandler(
	service: ParentService,
	id?: ParentCreationType['id'],
) {
	let ParentId: NonNullable<ParentCreationType['id']>
	if (id) {
		ParentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})

		ParentId = id
	}

	const response = await inquirer.prompt<{ field: string }>({
		type: 'list',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [
			{ name: 'firstName' },
			{ name: 'surname' },
			{ name: 'phones' },
			{ name: 'emails' },
			{ name: 'address' },
			{ name: 'document' },
		],
	})

	switch (response.field) {
		case 'phones':
			updatePhone(service, ParentId)
			break
		case 'emails':
			updateEmail(service, ParentId)
			break
		default: {
			const updated = await inquirer.prompt<
				Omit<ParentUpdateType, 'phones' | 'emails'>
			>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			oraPromise(service.update(ParentId, updated), {
				text: chalk.cyan('Updating parent...'),
				spinner: 'bouncingBar',
				failText: (err) => {
					process.exitCode = 1
					return chalk.red(
						`Failed to update parent ${response.field}: ${err.message}\n`,
					)
				},
				successText: chalk.magentaBright.bold(
					`\nParent ${response.field} updated successfully!`,
				),
			}).then((parent) =>
				console.log(inspect(parent.toObject(), { depth: null, colors: true })),
			)
		}
	}
}
