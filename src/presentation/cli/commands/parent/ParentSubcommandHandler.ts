import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createParentHandler } from './create.js'
import { deleteParentHandler } from './delete.js'
import { findParentHandler } from './find.js'
import { listParentHandler } from './list.js'
import { updateParentHandler } from './update/update.js'

export function ParentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string; page?: number },
) {
	switch (subcommand) {
		case 'create':
			createParentHandler(services.parent)
			break
		case 'delete':
			deleteParentHandler(services.parent, services.student, options?.id)
			break
		case 'find':
			findParentHandler(services.parent, services.student, options?.id)
			break
		case 'list':
			listParentHandler(services.parent, options?.page)
			break
		case 'update':
			updateParentHandler(services.parent, options?.id)
			break
		default:
			console.error(
				chalk.red(
					`Error: Subcommand "${chalk.underline(
						subcommand,
					)}" not found try to run "school parent --help" to list all subcommands`,
				),
			)
			process.exit(1)
	}
}
