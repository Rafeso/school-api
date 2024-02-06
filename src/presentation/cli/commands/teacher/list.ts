import { inspect } from 'node:util'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function listTeacherHandler(service: TeacherService, page?: number, perPage?: number) {
	const teachers = await service.list(page, perPage)
	console.log(
		inspect(
			teachers.map((t) => t.toObject()),
			{ depth: null, colors: true },
		),
	)
}
