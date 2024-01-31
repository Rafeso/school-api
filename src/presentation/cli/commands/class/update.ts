import { inspect } from 'node:util'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { oraPromise } from 'ora'
import { ClassCreationSchema, ClassCreationType, ClassUpdateType } from '../../../../domain/class/types.js'
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

	await oraPromise(service.update(ClassId, updated), {
		text: `Updating ${response.field}...`,
		failText: (err) => `Failed to update ${response.field}: ${err.message}`,
		spinner: 'bouncingBar',
		successText: `Updated class ${response.field} successfully!`,
	}).then((updated) => console.log(inspect(updated, { depth: null, colors: true })))
}
