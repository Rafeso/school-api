import { inspect } from 'util'
import enquirer from 'enquirer'
import {
	ClassCreationSchema,
	ClassCreationType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function findClassHandler(
	service: ClassService,
	id?: ClassCreationType['id'],
) {
	let classId: Required<ClassCreationType['id']>
	if (id) {
		classId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Class id:',
			validate(value) {
				return ClassCreationSchema.shape.id.safeParse(value).success
			},
		})
		classId = id
	}

	try {
		const Class = service.findById(classId)
		console.log(inspect(Class, { depth: null, colors: true }))
	} catch (err) {
		console.error((err as Error).message)
	}
}
