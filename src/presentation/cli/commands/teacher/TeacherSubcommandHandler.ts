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
	options?: { id?: string; page?: number; pageLength?: number },
) {
	const teacherService = services.teacher

	switch (subcommand) {
		case 'create':
			createTeacherHandler(teacherService)
			break
		case 'delete':
			deleteTeacherHandler(teacherService, options?.id)
			break
		case 'find':
			findTeacherHandler(teacherService, options?.id)
			break
		case 'list':
			listTeacherHandler(teacherService, options?.page, options?.pageLength)
			break
		case 'update':
			updateTeacherHandler(teacherService, options?.id)
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
