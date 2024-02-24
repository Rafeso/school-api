import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	TeacherCreationSchema,
	TeacherCreationType,
	TeacherUpdateType,
} from '../../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../../service/TeacherService.js'
import { updateSalaryHandler } from './prompt.js'
export async function updateTeacherHandler(
	service: TeacherService,
	id?: string,
) {
	let TeacherId: Required<TeacherCreationType['id']>
	if (id) {
		TeacherId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value: string) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		TeacherId = id
	}

	const response = await inquirer.prompt<{ field: string }>({
		type: 'list',
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

	switch (response.field) {
		case 'salary':
			updateSalaryHandler(TeacherId, service)
			break
		default: {
			const updated = await inquirer.prompt<Omit<TeacherUpdateType, 'salary'>>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			await oraPromise(service.update(TeacherId, updated), {
				text: chalk.cyan('Updating teacher...'),
				spinner: 'bouncingBar',
				failText: (err) => {
					process.exitCode = 1
					return chalk.red(`Failed to update teacher: ${err.message}\n`)
				},
				successText: chalk.green(
					`Teacher ${response.field} updated successfully!\n`,
				),
			}).then((teacher) =>
				console.log(inspect(teacher.toObject(), { depth: null, colors: true })),
			)
		}
	}
}
