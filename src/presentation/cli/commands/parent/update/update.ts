import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ParentCreationSchema, ParentCreationType, ParentUpdateType } from '../../../../../domain/parent/types.js'
import { ParentService } from '../../../../../service/ParentService.js'
import { updateAddress, updateEmail, updatePhone } from './propmt.js'
export async function updateParentHandler(service: ParentService, id?: string) {
	let ParentId: Required<ParentCreationType['id']>
	if (id) {
		ParentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		ParentId = id
	}

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
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
		case 'address':
			updateAddress(service, ParentId)
			break
		default: {
			const updated = await enquirer.prompt<ParentUpdateType>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			oraPromise(service.update(ParentId, updated), {
				text: 'Updating parent...',
				spinner: 'bouncingBar',
				failText: (err) => `Failed to update parent ${chalk.underline(ParentId)}: ${err.message}`,
				successText: chalk.green.underline.bold(`\nParent ${response.field} updated successfully!`),
			}).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
		}
	}
}
