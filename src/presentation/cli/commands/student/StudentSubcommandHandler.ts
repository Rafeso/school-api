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
	options?: { id?: string; page?: number; pageLength?: number },
) {
	const studentService = services.student

	switch (subcommand) {
		case 'create':
			createStudentHandler(studentService)
			break
		case 'delete':
			deleteStudentHandler(studentService, options?.id)
			break
		case 'find':
			findStudentHandler(studentService, options?.id)
			break
		case 'list':
			listStudentHandler(studentService, options?.page, options?.pageLength)
			break
		case 'update':
			updateStudentHandler(studentService, options?.id)
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
