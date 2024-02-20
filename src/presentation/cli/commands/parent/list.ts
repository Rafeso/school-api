import { inspect } from 'util'
import { ParentService } from '../../../../service/ParentService.js'

export async function listParentHandler(
	service: ParentService,
	page?: number,
	pageLength?: number,
) {
	const parents = await service.list(page, pageLength)
	console.log(
		inspect(
			parents.map((p) => p.toObject()),
			{ depth: null, colors: true },
		),
	)
}
