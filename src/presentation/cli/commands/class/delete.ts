import enquirer from 'enquirer'
import {
	ClassCreationSchema,
	ClassCreationType,
} from '../../../../domain/class/types.js'
import { ClassService } from '../../../../service/ClassService.js'

export async function deleteClassHandler(
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
		service.remove(classId)
		console.log(`Class ${classId} deleted`)
	} catch (err) {
		console.error((err as Error).message)
	}
}
