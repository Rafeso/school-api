import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	ClassCreationSchema,
	ClassCreationType,
	ClassUpdateType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'
export async function updateClassHandler(service: ClassService, id?: string) {
	let ClassId: NonNullable<ClassCreationType['id']>
	if (id) {
		ClassId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		ClassId = id
	}

	await oraPromise(service.findById(ClassId), {
		text: chalk.cyan('Finding class...'),
		spinner: 'bouncingBar',
		failText: (err) => chalk.red(`Failed to find class: ${err.message}\n`),
	})

	const response = await inquirer.prompt<{ field: string }>({
		type: 'list',
		name: 'field',
		message: chalk.cyan('What field do you want to update?'),
		choices: [{ name: 'code' }, { name: 'teacher' }],
	})

	const updated = await inquirer.prompt<ClassUpdateType>({
		type: 'input',
		name: response.field,
		message: `New ${response.field}:`,
	})

	await oraPromise(service.update(ClassId, updated), {
		text: chalk.cyan(`Updating ${response.field}...`),
		spinner: 'bouncingBar',
		failText: (err) => chalk.red(`Failed to update class: ${err.message}\n`),
		successText: chalk.magentaBright.bold(
			`Updated class ${response.field} successfully!\n`,
		),
	}).then((updated) =>
		console.log(inspect(updated.toObject(), { depth: null, colors: true })),
	)
}
