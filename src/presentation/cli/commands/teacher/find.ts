import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	TeacherCreationSchema,
	TeacherCreationType,
} from '../../../../domain/teacher/types.js'
import { ClassService } from '../../../../service/ClassService.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function findTeacherHandler(
	service: TeacherService,
	classService: ClassService,
	id?: string,
) {
	let TeacherId: TeacherCreationType['id']
	if (id) {
		TeacherId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Teacher id:',
			validate(value) {
				return TeacherCreationSchema.shape.id.safeParse(value).success
			},
		})
		TeacherId = id
	}

	await oraPromise(service.findById(TeacherId), {
		text: chalk.cyan('Finding teacher...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find teacher ${TeacherId}: ${err.message}\n`)
		},
		successText: chalk.green('Teacher was found!\n'),
	}).then(async (teacher) => {
		const Class = (await classService.listBy('teacher', teacher.id)).map((c) =>
			c.toObject(),
		)
		console.log(
			inspect(
				{ teacher: teacher.toObject(), classes: Class },
				{ depth: null, colors: true },
			),
		)
	})
}
