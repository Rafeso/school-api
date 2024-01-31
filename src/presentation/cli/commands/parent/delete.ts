import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ParentCreationSchema, ParentCreationType } from '../../../../domain/parent/types.js'
import { ParentService } from '../../../../service/ParentService.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function deleteParentHandler(
	parentService: ParentService,
	studentService: StudentService,

	id?: ParentCreationType['id'],
) {
	let parentId: Required<ParentCreationType['id']>
	if (id) {
		parentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		parentId = id
	}

	const students = await studentService.listBy('parents', [parentId])

	if (students.length > 1) {
		console.log(chalk.red(`Cannot delete parent with id ${chalk.underline(parentId)} because it has students assigned`))
		return
	}

	const response = await enquirer.prompt<{ confirm: boolean }>({
		type: 'confirm',
		name: 'confirm',
		message: `Are you sure you want to delete parent: ${chalk.underline.bold.yellowBright(parentId)} ?`,
	})

	if (response.confirm === false) {
		console.log(chalk.yellow('\nParent deletion aborted!'))
		return
	}

	await oraPromise(parentService.remove(parentId), {
		text: 'Deleting parent...',
		spinner: 'bouncingBar',
		failText(err) {
			return `Failed to delete parent ${chalk.underline(parentId)}: ${err.message}`
		},
		successText() {
			return `Parent ${chalk.underline(parentId)} was deleted!`
		},
	})
}
