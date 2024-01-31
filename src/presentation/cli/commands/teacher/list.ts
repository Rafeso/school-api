import { inspect } from 'node:util'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function listTeacherHandler(service: TeacherService) {
	const teachers = await service.listAll()
	console.log(inspect(teachers, { depth: null, colors: true }))
}
