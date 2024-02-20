import { inspect } from 'util'
import { StudentService } from '../../../../service/StudentService.js'

export async function listStudentHandler(
	service: StudentService,
	page?: number,
	pageLength?: number,
) {
	const students = await service.list(page, pageLength)
	console.log(
		inspect(
			students.map((s) => s.toObject()),
			{ depth: null, colors: true },
		),
	)
}
