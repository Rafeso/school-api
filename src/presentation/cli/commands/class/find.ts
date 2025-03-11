import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	ClassCreationSchema,
	ClassCreationType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function findClassHandler(
	service: ClassService,
	teacherService: TeacherService,
	id?: string,
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

	await oraPromise(service.findById(classId), {
		text: 'Finding class...',
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find class ${classId}: ${err.message}\n`)
		},
		successText: chalk.green('Class was found.\n'),
	}).then(async (Class) => {
		console.log(
			inspect({ class: Class.toObject() }, { depth: null, colors: true }),
		)
	})
}
