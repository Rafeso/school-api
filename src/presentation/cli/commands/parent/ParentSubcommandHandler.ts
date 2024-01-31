import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createParentHandler } from './create.js'
import { deleteParentHandler } from './delete.js'
import { findParentHandler } from './find.js'
import { listParentHandler } from './list.js'
import { updateParentHandler } from './update/update.js'

export function ParentSubcommandHandler(services: ServiceList, subcommand: string, options?: { id?: string }) {
	const service = services

	switch (subcommand) {
		case 'create':
			createParentHandler(service.parent)
			break
		case 'delete':
			deleteParentHandler(service.parent, service.student, options?.id)
			break
		case 'find':
			findParentHandler(service.parent, options?.id)
			break
		case 'list':
			listParentHandler(service.parent)
			break
		case 'update':
			updateParentHandler(service.parent, options?.id)
			break
		default:
			return console.log(chalk.red('Subcommand not found try to run "school parent --help" to list all subcommands'))
	}
}
