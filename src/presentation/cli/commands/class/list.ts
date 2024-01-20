import { inspect } from 'util'
import { ClassService } from '../../../../service/ClassService.js'

export function listClassHandler(service: ClassService) {
	const Class = service.listAll()
	console.log(inspect(Class, { depth: null, colors: true }))
}
