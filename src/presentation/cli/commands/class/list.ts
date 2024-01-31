import { inspect } from 'util'
import { ClassService } from '../../../../service/ClassService.js'

export async function listClassHandler(service: ClassService) {
	const Class = await service.listAll()
	console.log(inspect(Class, { depth: null, colors: true }))
}
