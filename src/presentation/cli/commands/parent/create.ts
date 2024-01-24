import enquirer from 'enquirer'
import { Parent } from '../../../../domain/parent/Parent.js'
import { ParentCreationSchema } from '../../../../domain/parent/types.js'
import { AddressSchema } from '../../../../domain/types.js'
import { ParentService } from '../../../../service/ParentService.js'
import chalk from 'chalk'

export async function createParentHandler(service: ParentService) {
	const responses = await enquirer.prompt<{
		firstName: string
		surname: string
		phone: string
		email: string
		country: string
		city: string
		street: string
		zipCode: string
		document: string
	}>([
		{
			name: 'firstName',
			type: 'input',
			message: 'First name:',
			validate(value) {
				return ParentCreationSchema.shape.firstName.safeParse(value).success
			},
		},
		{
			name: 'surname',
			type: 'input',
			message: 'Last name:',
			validate(value) {
				return ParentCreationSchema.shape.surname.safeParse(value).success
			},
		},
		{
			name: 'phone',
			type: 'input',
			message: 'Phone:',
			validate(value) {
				return ParentCreationSchema.shape.phones.safeParse([value]).success
			},
		},
		{
			name: 'email',
			type: 'input',
			message: 'Email:',
			validate(value) {
				return ParentCreationSchema.shape.emails.safeParse([value]).success
			},
		},
		{
			name: 'country',
			type: 'input',
			message: 'Address Country:',
			validate(value) {
				return AddressSchema.shape.country.safeParse(value).success
			},
		},
		{
			name: 'city',
			type: 'input',
			message: 'Address City:',
			validate(value) {
				return AddressSchema.shape.city.safeParse(value).success
			},
		},
		{
			name: 'street',
			type: 'input',
			message: 'Address Street:',
			validate(value) {
				return AddressSchema.shape.street.safeParse(value).success
			},
		},
		{
			name: 'zipCode',
			type: 'input',
			message: 'Address ZipCode:',
			validate(value) {
				return AddressSchema.shape.zipCode.safeParse(value).success
			},
		},
		{
			name: 'document',
			type: 'input',
			message: 'Document:',
			validate(value) {
				return ParentCreationSchema.shape.document.safeParse(value).success
			},
		},
	])

	const parent = new Parent({
		firstName: responses.firstName,
		surname: responses.surname,
		phones: [responses.phone],
		emails: [responses.email],
		address: [
			{
				country: responses.country,
				city: responses.city,
				street: responses.street,
				zipCode: responses.zipCode,
			},
		],
		document: responses.document,
	})

	service.create(parent)
	console.log(
		chalk.green(`Created parent with id: ${chalk.underline(parent.id)}`),
	)
}
