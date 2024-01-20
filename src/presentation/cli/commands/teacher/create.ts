import enquirer from 'enquirer'
import { Teacher } from '../../../../domain/teacher/Teacher.js'
import { TeacherCreationSchema } from '../../../../domain/teacher/types.js'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function createTeacherHandler(service: TeacherService) {
	const response = await enquirer.prompt<{
		firstName: string
		surname: string
		document: string
		phone: string
		email: string
		hiringDate: string
		salary: number
		major: string
	}>([
		{
			type: 'input',
			name: 'firstName',
			message: 'First name:',
			validate(value) {
				return TeacherCreationSchema.shape.firstName.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'surname',
			message: 'Last name:',
			validate(value) {
				return TeacherCreationSchema.shape.surname.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'document',
			message: 'Document:',
			validate(value) {
				return TeacherCreationSchema.shape.document.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'phone',
			message: 'Phone:',
			validate(value) {
				return TeacherCreationSchema.shape.phone.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'email',
			message: 'Email:',
			validate(value) {
				return TeacherCreationSchema.shape.email.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'hiringDate',
			message: 'Hiring date:',
			validate(value) {
				return TeacherCreationSchema.shape.hiringDate.safeParse(value).success
			},
		},
		{
			type: 'numeral',
			name: 'salary',
			message: 'Salary:',
			validate(value) {
				return TeacherCreationSchema.shape.salary.safeParse(value).success
			},
		},
		{
			type: 'input',
			name: 'major',
			message: 'Major:',
			validate(value) {
				return TeacherCreationSchema.shape.major.safeParse(value).success
			},
		},
	])

	const teacher = new Teacher({
		firstName: response.firstName,
		surname: response.surname,
		document: response.document,
		phone: response.phone,
		email: response.email,
		hiringDate: response.hiringDate,
		salary: response.salary,
		major: response.major,
	})

	service.create(teacher.toObject())
	console.log(`Teacher ${teacher.id} created`)
}
