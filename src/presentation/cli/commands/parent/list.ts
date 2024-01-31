import { inspect } from 'util'
import { ParentService } from '../../../../service/ParentService.js'

export async function listParentHandler(service: ParentService) {
	const parents = await service.listAll()
	console.log(inspect(parents, { depth: null, colors: true }))
}
