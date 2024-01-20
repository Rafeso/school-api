import { inspect } from 'util'
import { StudentService } from '../../../../service/StudentService.js'

export function listStudentHandler(service: StudentService) {
	const Students = service.listAll()
	console.log(inspect(Students, { depth: null, colors: true }))
}
