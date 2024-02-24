import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createStudentHandler } from './create.js'
import { deleteStudentHandler } from './delete.js'
import { findStudentHandler } from './find.js'
import { listStudentHandler } from './list.js'
import { updateStudentHandler } from './update/update.js'

export function StudentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string; page?: number; perPage?: number },
) {
	switch (subcommand) {
		case 'create':
			createStudentHandler(services.student)
			break
		case 'delete':
			deleteStudentHandler(services.student, options?.id)
			break
		case 'find':
			findStudentHandler(services.student, options?.id)
			break
		case 'list':
			listStudentHandler(services.student, options?.page, options?.perPage)
			break
		case 'update':
			updateStudentHandler(services.student, options?.id)
			break
		default:
			console.error(
				chalk.red(
					`Error: Subcommand "${chalk.underline(
						subcommand,
					)}" not found try to run "school student --help" to list all subcommands`,
				),
			)
			process.exit(1)
	}
}
