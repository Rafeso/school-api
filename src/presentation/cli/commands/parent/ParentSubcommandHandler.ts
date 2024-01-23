import { ServiceList } from '../../../../app.js'
import { createParentHandler } from './create.js'
import { deleteParentHandler } from './delete.js'
import { findParentHandler } from './find.js'
import { listParentHandler } from './list.js'

export function ParentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { Id?: string },
) {
	const parentService = services.parent

	switch (subcommand) {
		case 'create':
			createParentHandler(parentService)
			break
		case 'delete':
			deleteParentHandler(parentService, options?.Id)
			break
		case 'find':
			findParentHandler(parentService, options?.Id)
			break
		case 'list':
			listParentHandler(parentService)
			break
		default:
			return console.log('Subcommand not found')
	}
}
