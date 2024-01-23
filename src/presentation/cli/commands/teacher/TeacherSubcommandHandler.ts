import { ServiceList } from '../../../../app.js'
import { createTeacherHandler } from './create.js'
import { deleteTeacherHandler } from './delete.js'
import { findTeacherHandler } from './find.js'
import { listTeacherHandler } from './list.js'

export function TeacherSubcommandHandler(
	services: ServiceList,
	subcommand: string,
	options?: { Id?: string },
) {
	const service = services.teacher

	switch (subcommand) {
		case 'create':
			createTeacherHandler(service)
			break
		case 'delete':
			deleteTeacherHandler(service, options?.Id)
			break
		case 'find':
			findTeacherHandler(service, options?.Id)
			break
		case 'list':
			listTeacherHandler(service)
			break
		default:
			return console.log('Subcommand not found')
	}
}
