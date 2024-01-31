import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ZodError } from 'zod'
import { TeacherCreationSchema, TeacherCreationType, TeacherUpdateType } from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'
export async function updateTeacherHandler(service: TeacherService, id?: string) {
	let TeacherId: Required<TeacherCreationType['id']>
	if (id) {
		TeacherId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		TeacherId = id
	}

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
		name: 'field',
		message: chalk.cyanBright('What field do you want to update?'),
		choices: [
			{ name: 'firstName' },
			{ name: 'surname' },
			{ name: 'document' },
			{ name: 'phone' },
			{ name: 'email' },
			{ name: 'hiringDate' },
			{ name: 'salary' },
			{ name: 'major' },
		],
	})

	async function updateSalary(id: string) {
		const response = await enquirer.prompt<{ salary: number }>({
			type: 'numeral',
			name: 'salary',
			message: 'New salary:',
			validate(value) {
				return TeacherCreationSchema.shape.salary.safeParse(value).success
			},
		})

		const teacher = (
			await service.update(id, {
				salary: response.salary,
			})
		).toObject()
		console.log(chalk.green.underline.bold('\nTeacher salary updated successfully!'))
		console.log(inspect(teacher, { depth: null, colors: true }))
	}

	switch (response.field) {
		case 'salary':
			updateSalary(TeacherId)
			break
		default: {
			const updated = await enquirer.prompt<TeacherUpdateType>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			await oraPromise(service.update(TeacherId, updated), {
				text: 'Updating teacher...',
				spinner: 'bouncingBar',
				failText: (err) => chalk.red.underline.bold(err.message),
				successText: chalk.green.underline.bold(`Teacher ${response.field} updated successfully!`),
			}).then((teacher) => console.log(inspect(teacher.toObject(), { depth: null, colors: true })))
		}
	}
}
