import { inspect } from 'util'
import enquirer from 'enquirer'
import {
	ParentCreationSchema,
	ParentCreationType,
} from '../../../../domain/parent/types.js'
import { ParentService } from '../../../../service/ParentService.js'

export async function findParentHandler(service: ParentService, id?: string) {
	let parentId: ParentCreationType['id']
	if (id) {
		parentId = id
	} else {
		const { id } = await enquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		parentId = id
	}

	try {
		const parent = service.findById(parentId)
		console.log(inspect(parent, { depth: null, colors: true }))
	} catch (err) {
		console.error((err as Error).message)
	}
}
