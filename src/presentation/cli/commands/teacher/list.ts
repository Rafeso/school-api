import { inspect } from 'node:util'
import { TeacherService } from '../../../../service/TeacherService.js'

export async function listTeacherHandler(
	service: TeacherService,
	page?: number,
) {
	const teachers = await service.list({ page: page })
	console.log(
		inspect(
			teachers.map((t) => t.toObject()),
			{ depth: null, colors: true },
		),
	)
}
