import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { ZodError } from 'zod'
import {
	ClassCreationSchema,
	ClassCreationType,
	ClassUpdateType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'
export async function updateClassHandler(service: ClassService, id?: string) {
	let ClassId: Required<ClassCreationType['id']>
	if (id) {
		ClassId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		ClassId = id
	}

	const response = await enquirer.prompt<{ field: string }>({
		type: 'select',
		name: 'field',
		message: 'What field do you want to update?',
		choices: [{ name: 'code' }, { name: 'teacher' }],
	})

	const updated = await enquirer.prompt<ClassUpdateType>({
		type: 'input',
		name: response.field,
		message: `New ${response.field}:`,
	})

	try {
		const Class = service.update(ClassId, updated).toObject()
		console.log(chalk.green.underline.bold('\nClass updated successfully!'))
		console.log(inspect(Class, { depth: null, colors: true }))
	} catch (err) {
		if (err instanceof ZodError) {
			console.error(err.message)
		}
	}
}
