import chalk from 'chalk'
import { ServiceList } from '../../../../app.js'
import { createStudentHandler } from './create.js'
import { deleteStudentHandler } from './delete.js'
import { findStudentHandler } from './find.js'
import { listStudentHandler } from './list.js'
import { updateStudentHandler } from './update.js'

export function StudentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { Id?: string },
) {
	const studentService = services.student

	switch (subcommand) {
		case 'create':
			createStudentHandler(studentService)
			break
		case 'delete':
			deleteStudentHandler(studentService, options?.Id)
			break
		case 'find':
			findStudentHandler(studentService, options?.Id)
			break
		case 'list':
			listStudentHandler(studentService)
			break
		case 'update':
			updateStudentHandler(studentService, options?.Id)
			break
		default:
			return console.log(chalk.red('Subcommand not found'))
	}
}
