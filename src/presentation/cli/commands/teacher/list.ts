import { inspect } from 'node:util'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function listTeacherHandler(service: TeacherService) {
	const teachers = await service.listAll()
	console.log(
		inspect(
			teachers.map((t) => t.toObject()),
			{ depth: null, colors: true },
		),
	)
}
