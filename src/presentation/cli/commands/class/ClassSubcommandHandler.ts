import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createClassHandler } from './create.js'
import { deleteClassHandler } from './delete.js'
import { findClassHandler } from './find.js'
import { listClassHandler } from './list.js'

export function ClassSubcommandHandler(services: ServiceList, subcommand: string, options?: { id?: string }) {
	const classService = services.class

	switch (subcommand) {
		case 'create':
			createClassHandler(classService)
			break
		case 'delete':
			deleteClassHandler(classService, options?.id)
			break
		case 'find':
			findClassHandler(classService, options?.id)
			break
		case 'list':
			listClassHandler(classService)
			break
		default:
			return console.log(chalk.red('Subcommand not found try to run "school class --help" to list all subcommands'))
	}
}
