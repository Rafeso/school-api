import { inspect } from 'util'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { ClassCreationSchema, ClassCreationType } from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function findClassHandler(service: ClassService, id?: ClassCreationType['id']) {
	let classId: Required<ClassCreationType['id']>
	if (id) {
		classId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		classId = id
	}

	await oraPromise(service.findById(classId), {
		text: 'Finding class...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to find class ${classId}: ${err.message}`,
		successText: 'Class found!',
	}).then((classFound) => {
		console.log(inspect(classFound.toObject(), { depth: null, colors: true }))
	})
}
