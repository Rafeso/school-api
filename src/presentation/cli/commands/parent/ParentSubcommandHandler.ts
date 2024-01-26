import { ServiceList } from '../../../../app.js'
import { createParentHandler } from './create.js'
import { deleteParentHandler } from './delete.js'
import { findParentHandler } from './find.js'
import { listParentHandler } from './list.js'
import { updateParentHandler } from './update.js'

export function ParentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string },
) {
	const parentService = services.parent

	switch (subcommand) {
		case 'create':
			createParentHandler(parentService)
			break
		case 'delete':
			deleteParentHandler(parentService, options?.id)
			break
		case 'find':
			findParentHandler(parentService, options?.id)
			break
		case 'list':
			listParentHandler(parentService)
			break
		case 'update':
			updateParentHandler(parentService, options?.id)
			break
		default:
			return console.log('Subcommand not found')
	}
}
