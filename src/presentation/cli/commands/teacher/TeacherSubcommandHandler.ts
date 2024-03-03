import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createTeacherHandler } from './create.js'
import { deleteTeacherHandler } from './delete.js'
import { findTeacherHandler } from './find.js'
import { listTeacherHandler } from './list.js'
import { updateTeacherHandler } from './update/update.js'

export function TeacherSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string; page?: number },
) {
	switch (subcommand) {
		case 'create':
			createTeacherHandler(services.teacher)
			break
		case 'delete':
			deleteTeacherHandler(services.teacher, options?.id)
			break
		case 'find':
			findTeacherHandler(services.teacher, services.class, options?.id)
			break
		case 'list':
			listTeacherHandler(services.teacher, options?.page)
			break
		case 'update':
			updateTeacherHandler(services.teacher, options?.id)
			break
		default:
			console.error(
				chalk.red(
					`Error: Subcommand "${chalk.underline(
						subcommand,
					)}" not found try to run "school teacher --help" to list all subcommands`,
				),
			)
			process.exit(1)
	}
}
