import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ClassCreationSchema, ClassCreationType } from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function deleteClassHandler(service: ClassService, id?: ClassCreationType['id']) {
	let classId: Required<ClassCreationType['id']>
	if (id) {
		classId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		classId = id
	}

	const response = await enquirer.prompt<{ confirm: boolean }>({
		type: 'confirm',
		name: 'confirm',
		message: `Are you sure you want to delete class: ${chalk.underline.bold.yellowBright(classId)} ?`,
	})

	if (response.confirm === false) {
		console.log(chalk.yellow('\nClass deletion aborted!'))
		return
	}

	await oraPromise(service.remove(classId), {
		text: 'Deleting class...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to delete class ${chalk.underline(classId)}: ${err.message}`,
		successText: chalk.green(`Class ${chalk.underline(classId)} deleted`),
	})
}
