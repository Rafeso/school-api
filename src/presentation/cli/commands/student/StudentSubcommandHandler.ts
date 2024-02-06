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
			listStudentHandler(studentService, options?.page)
			break
		case 'update':
			updateStudentHandler(studentService, options?.id)
			break
		default:
			return console.log(
				chalk.red(
					'Subcommand not found try to run "school student --help" to list all subcommands',
				),
			)
	}
}
