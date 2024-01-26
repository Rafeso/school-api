import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { ZodError } from 'zod'
import {
	ParentCreationSchema,
	ParentCreationType,
	ParentUpdateType,
} from '../../../../domain/parent/types.js'
import { AddressSchema } from '../../../../domain/types.js'
import { ParentService } from '../../../../service/ParentService.js'
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

	async function updatePhone(id: string) {
		const response = await enquirer.prompt<{ phones: string }>({
			type: 'input',
			name: 'phones',
			message: 'New phones:',
		})

		const parent = service.update(id, { phones: [response.phones] }).toObject()
		console.log(
			chalk.green.underline.bold('\nParent phones updated successfully!'),
		)
		return console.log(inspect(parent, { depth: null, colors: true }))
	}

	async function updateEmail(id: string) {
		const response = await enquirer.prompt<{ emails: string }>({
			type: 'input',
			name: 'emails',
			message: 'New emails:',
			validate(value) {
				return ParentCreationSchema.shape.emails.safeParse(value).success
			},
		})

		const parent = service.update(id, { emails: [response.emails] }).toObject()
		console.log(
			chalk.green.underline.bold('\nParent emails updated successfully!'),
		)
		return console.log(inspect(parent, { depth: null, colors: true }))
	}

	async function updateAddress(id: string) {
		const response = await enquirer.prompt<{
			country: string
			city: string
			street: string
			zipCode: string
		}>([
			{
				type: 'input',
				name: 'country',
				message: 'New country:',
				validate(value) {
					return AddressSchema.shape.country.safeParse(value).success
				},
			},
			{
				type: 'input',
				name: 'city',
				message: 'New city:',
				validate(value) {
					return AddressSchema.shape.city.safeParse(value).success
				},
			},
			{
				type: 'input',
				name: 'street',
				message: 'New street:',
				validate(value) {
					return AddressSchema.shape.street.safeParse(value).success
				},
			},
			{
				type: 'input',
				name: 'zipCode',
				message: 'New zipCode:',
				validate(value) {
					return AddressSchema.shape.zipCode.safeParse(value).success
				},
			},
		])

		const parent = service
			.update(id, {
				address: [
					{
						country: response.country,
						city: response.city,
						street: response.street,
						zipCode: response.zipCode,
					},
				],
			})
			.toObject()
		console.log(
			chalk.green.underline.bold('\nParent address updated successfully!'),
		)
		return console.log(inspect(parent, { depth: null, colors: true }))
	}

	switch (response.field) {
		case 'phones':
			updatePhone(ParentId)
			break
		case 'emails':
			updateEmail(ParentId)
			break
		case 'address':
			updateAddress(ParentId)
			break
		default: {
			const updated = await enquirer.prompt<ParentUpdateType>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			try {
				const parent = service.update(ParentId, updated).toObject()
				console.log(
					chalk.green.underline.bold(
						`\nParent ${response.field} updated successfully!`,
					),
				)
				console.log(inspect(parent, { depth: null, colors: true }))
			} catch (err) {
				if (err instanceof ZodError) {
					console.error(err.message)
				}
			}
		}
	}
}
