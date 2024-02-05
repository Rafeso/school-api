import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { StudentCreationSchema, StudentCreationType } from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function findStudentHandler(service: StudentService, id?: string) {
	let StudentId: StudentCreationType['id']
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
		text: 'Finding student...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to find student ${StudentId}: ${err.message}`,
		successText: chalk.green('Student found!'),
	}).then((student) => {
		console.log(inspect(student.toObject(), { depth: null, colors: true }))
	})
}
