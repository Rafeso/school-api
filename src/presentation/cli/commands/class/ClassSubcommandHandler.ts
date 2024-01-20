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
	const service = services

	switch (subcommand) {
		case 'create':
			createClassHandler(service.class)
			break
		case 'delete':
			deleteClassHandler(service.class, options?.Id)
			break
		case 'find':
			findClassHandler(service.class, options?.Id)
			break
		case 'list':
			listClassHandler(service.class)
			break
		default:
			return console.log('Subcommand not found')
	}
}
