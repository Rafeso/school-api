import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { Teacher } from '../../../../domain/teacher/Teacher.js'
import { TeacherCreationSchema } from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function createTeacherHandler(service: TeacherService) {
	const response = await inquirer.prompt<{
		firstName: string
		surname: string
		document: string
		phone: string
		email: string
		hiringDate: string
		salary: number
		major: string
	}>([
		{
			type: 'input',
			name: 'firstName',
			message: 'First name:',
			validate(value) {
				return TeacherCreationSchema.shape.firstName.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'surname',
			message: 'Last name:',
			validate(value) {
				return TeacherCreationSchema.shape.surname.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'document',
			message: 'Document:',
			validate(value) {
				return TeacherCreationSchema.shape.document.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'phone',
			message: 'Phone:',
			validate(value) {
				return TeacherCreationSchema.shape.phone.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'email',
			message: 'Email:',
			validate(value) {
				return TeacherCreationSchema.shape.email.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'hiringDate',
			message: 'Hiring date:',
			validate(value) {
				return TeacherCreationSchema.shape.hiringDate.safeParse(value).success
			},
		},
		{
			type: 'number',
			name: 'salary',
			message: 'Salary:',
			validate(value) {
				return TeacherCreationSchema.shape.salary.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'major',
			message: 'Major:',
			validate(value) {
				return TeacherCreationSchema.shape.major.safeParse(value).success
			},
		},
	])

	const teacher = new Teacher({
		firstName: response.firstName,
		surname: response.surname,
		document: response.document,
		phone: response.phone,
		email: response.email,
		hiringDate: response.hiringDate,
		salary: response.salary,
		major: response.major,
	})

	await oraPromise(service.create(teacher.toObject()), {
		text: chalk.cyan('Creating teacher...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to create teacher: ${err.message}\n`)
		},
		successText: chalk.green('Teacher created successfully!\n'),
	}).then((teacher) =>
		console.log(inspect(teacher.toObject(), { depth: null, colors: true })),
	)
}
