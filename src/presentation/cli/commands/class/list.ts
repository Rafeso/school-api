import { inspect } from 'util'
import { ClassService } from '../../../../service/ClassService.js'

export async function listClassHandler(
	service: ClassService,
	page?: number,
	pageLength?: number,
) {
	const Class = await service.list(page, pageLength)
	console.log(
		inspect(
			Class.map((c) => c.toObject()),
			{ depth: null, colors: true },
		),
	)
}
