import chalk from 'chalk'
import enquirer from 'enquirer'
import {
	ParentCreationSchema,
	ParentCreationType,
} from '../../../../domain/parent/types.js'
import { ParentService } from '../../../../service/ParentService.js'

export async function deleteParentHandler(
	service: ParentService,
	id?: ParentCreationType['id'],
) {
	let parentId: Required<ParentCreationType['id']>
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

	service.remove(parentId)
	console.log(chalk.yellow(`Parent ${chalk.underline(parentId)} deleted`))
}
