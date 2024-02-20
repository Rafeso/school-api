import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { TeacherCreationSchema, TeacherUpdateType } from '../../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../../service/TeacherService.js'

export async function updateSalaryHandler(id: string, service: TeacherService) {
	const response = await inquirer.prompt<{ salary: number }>({
		type: 'number',
		name: 'salary',
		message: 'New salary:',
		validate(value: number) {
			return TeacherCreationSchema.shape.salary.safeParse(value).success
		},
	})

	await oraPromise(
		service.update(id, {
			salary: response.salary,
		}),
		{
			failText: (err) => {
				process.exitCode = 1
				return chalk.red(`Failed to update teacher: ${err.message}`)
			},
			successText: chalk.magentaBright.bold('Teacher salary updated successfully!'),
		},
	).then((teacher) => console.log(inspect(teacher.toObject(), { depth: null, colors: true })))
}
