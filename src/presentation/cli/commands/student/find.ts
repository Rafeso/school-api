import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import {
	StudentCreationSchema,
	StudentCreationType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function findStudentHandler(
	service: StudentService,
	id?: StudentCreationType['id'],
) {
	let StudentId: NonNullable<StudentCreationType['id']>
	if (id) {
		StudentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Student id:',
			validate(value) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	await oraPromise(service.findById(StudentId), {
		text: chalk.cyan('Finding student...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find student: ${err.message}\n`)
		},
		successText: chalk.green('Student found!\n'),
	}).then(async (student) => {
		const Parents = (await service.getParents(student.id)).map((p) =>
			p.toObject(),
		)
		console.log(
			inspect(
				{ student: student.toObject(), parents: Parents },
				{ depth: null, colors: true },
			),
		)
	})
}
