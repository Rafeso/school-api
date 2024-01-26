import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { ZodError } from 'zod'
import {
	StudentCreationSchema,
	StudentCreationType,
	StudentUpdateType,
} from '../../../../domain/student/types.js'
import { StudentService } from '../../../../service/StudentService.js'
export async function updateStudentHandler(
	service: StudentService,
	id?: string,
) {
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

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [
			{ name: 'firstName' },
			{ name: 'surname' },
			{ name: 'birthDate' },
			{ name: 'allergies' },
			{ name: 'bloodType' },
			{ name: 'medications' },
			{ name: 'startDate' },
			{ name: 'document' },
			{ name: 'class' },
		],
	})

	async function updateClass(id: string) {
		const response = await enquirer.prompt<{ class: string }>({
			type: 'input',
			name: 'class',
			message: 'New class:',
			validate(value) {
				return StudentCreationSchema.shape.class.safeParse(value).success
			},
		})
		const updated = service
			.update(id, {
				class: response.class,
			})
			.toObject()
		console.log(
			chalk.green.underline.bold('\nStudent class updated successfully!'),
		)
		return console.log(inspect(updated, { depth: null, colors: true }))
	}

	switch (response.field) {
		case 'class':
			return updateClass(StudentId)
		default: {
			const updated = await enquirer.prompt<StudentUpdateType>({
				type: 'input',
				name: response.field,
				message: `New ${response.field}:`,
			})

			try {
				const Student = service.update(StudentId, updated).toObject()
				console.log(
					chalk.green.underline.bold('\nStudent updated successfully!'),
				)
				console.log(inspect(Student, { depth: null, colors: true }))
			} catch (err) {
				if (err instanceof ZodError) {
					console.error(err.message)
				}
			}
		}
	}
}
