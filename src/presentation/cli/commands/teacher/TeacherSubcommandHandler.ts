import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createTeacherHandler } from './create.js'
import { deleteTeacherHandler } from './delete.js'
import { findTeacherHandler } from './find.js'
import { listTeacherHandler } from './list.js'
import { updateTeacherHandler } from './update.js'

export function TeacherSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { id?: string; page?: number; perPage?: number },
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
			listTeacherHandler(teacherService, options?.page, options?.perPage)
			break
		case 'update':
			updateTeacherHandler(teacherService, options?.id)
			break
		default:
			return console.log(
				chalk.red(
					'Subcommand not found try to run "school teacher --help" to list all subcommands',
				),
			)
	}
}
