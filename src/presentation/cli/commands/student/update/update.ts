import { inspect } from 'node:util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { StudentCreationSchema, StudentCreationType, StudentUpdateType } from '../../../../../domain/student/types.js'
import { StudentService } from '../../../../../service/StudentService.js'
import { updateAllergies, updateMedications, updateStudentParentsHandler } from './prompt.js'

export async function updateStudentHandler(service: StudentService, id?: string) {
	let StudentId: Required<StudentCreationType['id']>
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

	const response = await inquirer.prompt<{ field: string }>({
		type: 'list',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [
			{ name: 'firstName' },
			{ name: 'surname' },
			{ name: 'birthDate' },
			{ name: 'parents' },
			{ name: 'allergies' },
			{ name: 'bloodType' },
			{ name: 'medications' },
			{ name: 'startDate' },
			{ name: 'document' },
			{ name: 'class' },
		],
	})

	switch (response.field) {
		case 'medications':
			await updateMedications(StudentId, service)
			break
		case 'parents':
			await updateStudentParentsHandler(StudentId, service)
			break
		case 'allergies':
			await updateAllergies(StudentId, service)
			break
		default: {
			const updated = await inquirer.prompt<StudentUpdateType>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			await oraPromise(service.update(StudentId, updated), {
				text: 'Updating student...',
				spinner: 'bouncingBar',
				failText: (err) => `Failed to update student ${chalk.underline(StudentId)}: ${err.message}`,
				successText: chalk.green.underline.bold(`\nStudent ${response.field} updated successfully!`),
			}).then((updated) => console.log(inspect(updated.toObject(), { depth: null, colors: true })))
		}
	}
}
