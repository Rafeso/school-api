import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { logger } from '../../../../utils/logger.js'
import { createClassHandler } from './create.js'
import { deleteClassHandler } from './delete.js'
import { findClassHandler } from './find.js'
import { listClassHandler } from './list.js'

export function ClassSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string; page?: number },
) {
	switch (subcommand) {
		case 'create':
			createClassHandler(services.class)
			break
		case 'delete':
			deleteClassHandler(services.class, options?.id)
			break
		case 'find':
			findClassHandler(services.class, services.teacher, options?.id)
			break
		case 'list':
			listClassHandler(services.class, options?.page)
			break
		default:
			logger.error(
				`Error: Subcommand "${chalk.underline(
					subcommand,
				)}" not found try to run "school class --help" to list all subcommands`,
			)

			process.exit(1)
	}
}
