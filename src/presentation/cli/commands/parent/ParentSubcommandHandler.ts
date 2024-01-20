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
	const service = services

	switch (subcommand) {
		case 'create':
			createParentHandler(service.parent)
			break
		case 'delete':
			deleteParentHandler(service.parent, options?.Id)
			break
		case 'find':
			findParentHandler(service.parent, options?.Id)
			break
		case 'list':
			listParentHandler(service.parent)
			break
		default:
			return console.log('Subcommand not found')
	}
}
