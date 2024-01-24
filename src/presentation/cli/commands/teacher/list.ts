import { inspect } from 'node:util'
import { TeacherService } from '../../../../service/TeacherService.js'

export function listTeacherHandler(service: TeacherService) {
	const teachers = service.listAll()
	console.log(inspect(teachers, { depth: null, colors: true }))
}
