import { inspect } from 'util'
import { ParentService } from '../../../../service/ParentService.js'

export function listParentHandler(service: ParentService) {
	const parents = service.listAll()
	console.log(inspect(parents, { depth: null, colors: true }))
}
