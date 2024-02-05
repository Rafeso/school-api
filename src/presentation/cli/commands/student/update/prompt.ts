import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { StudentCreationSchema } from '../../../../../domain/student/types.js'
import { StudentService } from '../../../../../service/StudentService.js'

export async function updateAllergies(id: string, service: StudentService) {
	const response = await inquirer.prompt<{ allergies: string }>({
		type: 'input',
		name: 'allergies',
		message: 'New allergies:',
		validate(value) {
			return StudentCreationSchema.shape.allergies.safeParse([value]).success
		},
	})

	await oraPromise(service.updateAllergies(id, [response.allergies]), {
		text: 'Updating student allergies...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to update student allergies: ${err.message}`,
		successText: chalk.green.underline.bold('Student allergies updated successfully!'),
	}).then((student) => console.log(inspect(student.toObject(), { depth: null, colors: true })))
}

export async function updateMedications(id: string, service: StudentService) {
	const response = await inquirer.prompt<{ medications: string }>({
		type: 'input',
		name: 'medications',
		message: 'New medications:',
		validate(value) {
			return StudentCreationSchema.shape.medications.safeParse([value]).success
		},
	})

	await oraPromise(service.updateMedications(id, [response.medications]), {
		text: 'Updating student medications...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to update student medications: ${err.message}`,
		successText: chalk.green.underline.bold('Student medications updated successfully!'),
	}).then((student) => console.log(inspect(student.toObject(), { depth: null, colors: true })))
}

export async function linkParent(service: StudentService, studentId: string) {
	const response = await inquirer.prompt<{ parents: string }>({
		type: 'input',
		name: 'parents',
		message: 'Id of parent to add:',
		validate(value) {
			return StudentCreationSchema.shape.parents.safeParse([value]).success
		},
	})

	await oraPromise(service.linkParents(studentId, [response.parents]), {
		text: 'Linking parents...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to link parents: ${err.message}`,
		successText: chalk.green.underline.bold('Student parents updated successfully!'),
	}).then((student) => console.log(inspect(student.toObject(), { depth: null, colors: true })))
}

export async function unlinkParent(service: StudentService, studentId: string) {
	const response = await inquirer.prompt<{ parents: string }>({
		type: 'input',
		name: 'parents',
		message: 'Id of parent to remove:',
		validate(value) {
			return StudentCreationSchema.shape.parents.safeParse([value]).success
		},
	})

	await oraPromise(service.unlinkParent(studentId, [response.parents]), {
		text: 'Unlinking parents...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to unlink parents: ${err.message}`,
		successText: chalk.green.underline.bold('Student parents updated successfully!'),
	}).then((student) => console.log(inspect(student.toObject(), { depth: null, colors: true })))
}

export async function updateStudentParentsHandler(StudentId: string, service: StudentService) {
	const response = await inquirer.prompt<{ field: string }>({
		type: 'list',
		name: 'field',
		message: 'What action do you want to perform?',
		choices: [{ name: 'Add new parent' }, { name: 'Remove parent' }],
	})

	switch (response.field) {
		case 'Add new parent':
			await linkParent(service, StudentId)
			break
		case 'Remove parent':
			await unlinkParent(service, StudentId)
			break
	}
}
