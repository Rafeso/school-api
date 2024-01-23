import { ServiceList } from '../../../../app.js'
import { createClassHandler } from './create.js'
import { deleteClassHandler } from './delete.js'
import { findClassHandler } from './find.js'
import { listClassHandler } from './list.js'

export function ClassSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { Id?: string },
) {
	const classService = services.class

	switch (subcommand) {
		case 'create':
			createClassHandler(classService)
			break
		case 'delete':
			deleteClassHandler(classService, options?.Id)
			break
		case 'find':
			findClassHandler(classService, options?.Id)
			break
		case 'list':
			listClassHandler(classService)
			break
		default:
			return console.log('Subcommand not found')
	}
}
