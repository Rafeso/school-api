import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	ClassCreationSchema,
	ClassCreationType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function deleteClassHandler(
	service: ClassService,
	id?: ClassCreationType['id'],
) {
	let classId: NonNullable<ClassCreationType['id']>
	if (id) {
		classId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		classId = id
	}

	const response = await inquirer.prompt<{ confirm: boolean }>({
		type: 'confirm',
		name: 'confirm',
		message: `Are you sure you want to delete class: ${chalk.underline.bold.yellowBright(
			classId,
		)} ?`,
	})

	if (response.confirm === false) {
		console.log(
			chalk.yellow('\nClass deletion aborted, you can exit safely now.'),
		)
		return
	}

	await oraPromise(service.remove(classId), {
		text: chalk.cyan('Deleting class...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(
				`Failed to delete class ${chalk.underline(classId)}: ${err.message}\n`,
			)
		},
		successText: chalk.magentaBright.bold(
			`Class ${chalk.underline(classId)} was deleted.`,
		),
	})
}
