import { inspect } from 'util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ParentCreationSchema } from '../../../../../domain/parent/types.js'
import { AddressSchema } from '../../../../../domain/types.js'
import { ParentService } from '../../../../../service/ParentService.js'

export async function updatePhone(service: ParentService, id: string) {
	const response = await enquirer.prompt<{ phones: string }>({
		type: 'input',
		name: 'phones',
		message: 'New phones:',
	})

	await oraPromise(service.updatePhone(id, [response.phones]), {
		text: 'Updating parent phones...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to update parent phones: ${err.message}`,
		successText: chalk.green.underline.bold('\nParent phones updated successfully!'),
	}).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
}

export async function updateEmail(service: ParentService, id: string) {
	const response = await enquirer.prompt<{ emails: string }>({
		type: 'input',
		name: 'emails',
		message: 'New emails:',
		validate(value) {
			return ParentCreationSchema.shape.emails.safeParse(value).success
		},
	})

	await oraPromise(service.updateEmail(id, [response.emails]), {
		text: 'Updating parent emails...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to update parent emails: ${err.message}`,
		successText: chalk.green.underline.bold('\nParent emails updated successfully!'),
	}).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
}

export async function updateAddress(service: ParentService, id: string) {
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

	await oraPromise(
		service.updateAddress(id, [
			{
				country: response.country,
				city: response.city,
				street: response.street,
				zipCode: response.zipCode,
			},
		]),
		{
			text: 'Updating parent address...',
			spinner: 'bouncingBar',
			failText: (err) => `Failed to update parent address: ${err.message}`,
			successText: chalk.green.underline.bold('\nParent address updated successfully!'),
		},
	).then((parent) => console.log(inspect(parent.toObject(), { depth: null, colors: true })))
}
