import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { Student } from '../../../../domain/student/Student.js'
import { StudentCreationSchema } from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'

export async function createStudentHandler(service: StudentService) {
	const response = await enquirer.prompt<{
		firstName: string
		surname: string
		birthDate: string
		parents: string
		allergies: string
		bloodType: string
		medications: string
		startDate: string
		document: string
		class: string
	}>([
		{
			type: 'input',
			name: 'firstName',
			message: 'First name:',
			validate(value) {
				return StudentCreationSchema.shape.firstName.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'surname',
			message: 'Last name:',
			validate(value) {
				return StudentCreationSchema.shape.surname.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'birthDate',
			message: 'Birth date:',
			validate(value) {
				return StudentCreationSchema.shape.birthDate.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'parents',
			message: 'Parents:',
			validate(value) {
				return StudentCreationSchema.shape.parents.safeParse([value]).success
			},
		},
		{
			type: 'input',
			name: 'allergies',
			message: 'Allergies:',
			validate(value) {
				return StudentCreationSchema.shape.allergies.safeParse([value]).success
			},
		},
		{
			type: 'input',
			name: 'bloodType',
			message: 'Blood type:',
			validate(value) {
				return StudentCreationSchema.shape.bloodType.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'medications',
			message: 'Medications:',
			validate(value) {
				return StudentCreationSchema.shape.medications.safeParse([value]).success
			},
		},
		{
			type: 'input',
			name: 'startDate',
			message: 'Start date:',
			validate(value) {
				return StudentCreationSchema.shape.startDate.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'document',
			message: 'Document:',
			validate(value) {
				return StudentCreationSchema.shape.document.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'class',
			message: 'Class:',
			validate(value) {
				return StudentCreationSchema.shape.class.safeParse(value).success
			},
		},
	])

	const student = new Student({
		firstName: response.firstName,
		surname: response.surname,
		birthDate: response.birthDate,
		parents: [response.parents],
		allergies: [response.allergies],
		bloodType: response.bloodType,
		medications: [response.medications],
		startDate: response.startDate,
		document: response.document,
		class: response.class,
	})

	await oraPromise(service.create(student.toObject()), {
		text: 'Creating student...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to create student: ${err.message}`,
		successText: 'Student created!',
	}).then((student) => console.log(inspect(student.toObject(), { depth: null, colors: true })))
}
