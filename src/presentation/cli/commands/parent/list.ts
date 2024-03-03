import { inspect } from 'util'
import { ParentService } from '../../../../service/ParentService.js'

export async function listParentHandler(service: ParentService, page?: number) {
	const parents = await service.list({ page: page })
	console.log(
		inspect(
			parents.map((p) => p.toObject()),
			{ depth: null, colors: true },
		),
	)
}
