import { ServiceList } from '../../../../app.js'
import { createStudentHandler } from './create.js'
import { deleteStudentHandler } from './delete.js'
import { findStudentHandler } from './find.js'
import { listStudentHandler } from './list.js'

export function StudentSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { Id?: string },
) {
	const service = services

	switch (subcommand) {
		case 'create':
			createStudentHandler(service.student)
			break
		case 'delete':
			deleteStudentHandler(service.student, options?.Id)
			break
		case 'find':
			findStudentHandler(service.student, options?.Id)
			break
		case 'list':
			listStudentHandler(service.student)
			break
		default:
			return console.log('Subcommand not found')
	}
}
