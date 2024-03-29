import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	ParentCreationSchema,
	ParentCreationType,
} from '../../../../domain/parent/types.js'
import { ParentService } from '../../../../service/ParentService.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function findParentHandler(
	service: ParentService,
	studentService: StudentService,
	id?: string,
) {
	let parentId: NonNullable<ParentCreationType['id']>
	if (id) {
		parentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		parentId = id
	}

	await oraPromise(service.findById(parentId), {
		text: chalk.cyan('Finding parent...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find parent: ${err.message}\n`)
		},
		successText: chalk.green('Parent was found.\n'),
	}).then(async (parent) => {
		const Student = (await studentService.listBy('parents', [parent.id])).map(
			(s) => s.toObject(),
		)
		console.log(
			inspect(
				{ parent: parent.toObject(), student: Student },
				{ depth: null, colors: true },
			),
		)
	})
}
