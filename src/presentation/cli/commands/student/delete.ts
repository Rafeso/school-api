import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { StudentCreationSchema, StudentCreationType } from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function deleteStudentHandler(service: StudentService, id?: StudentCreationType['id']) {
	let StudentId: Required<StudentCreationType['id']>
	if (id) {
		StudentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Student id:',
			validate(value) {
				return StudentCreationSchema.shape.id.safeParse(value).success
			},
		})
		StudentId = id
	}

	const response = await enquirer.prompt<{ confirm: boolean }>({
		type: 'confirm',
		name: 'confirm',
		message: `Are you sure you want to delete student: ${chalk.underline.bold.yellowBright(StudentId)} ?`,
	})

	if (response.confirm === false) {
		console.log(chalk.yellow('\nStudent deletion aborted!'))
		return
	}

	await oraPromise(service.remove(StudentId), {
		text: 'Deleting student...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to delete student ${chalk.underline(StudentId)}: ${err.message}`,
		successText: `Student ${chalk.underline(StudentId)} was deleted!`,
	})
}
