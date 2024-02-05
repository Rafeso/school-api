import { inspect } from 'util'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { ParentCreationSchema, ParentCreationType } from '../../../../domain/parent/types.js'
import { ParentService } from '../../../../service/ParentService.js'

export async function findParentHandler(service: ParentService, id?: string) {
	let parentId: ParentCreationType['id']
	if (id) {
		parentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		parentId = id
	}

	await oraPromise(service.findById(parentId), {
		text: 'Finding parent...',
		spinner: 'bouncingBar',
		failText: (err) => `Failed to find parent ${parentId}: ${err.message}`,
		successText: 'Parent found!',
	}).then((parent) => {
		console.log(inspect(parent.toObject(), { depth: null, colors: true }))
	})
}
