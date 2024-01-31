import { inspect } from 'util'
import { StudentService } from '../../../../service/StudentService.js'

export async function listStudentHandler(service: StudentService) {
	const students = await service.listAll()
	console.log(inspect(students, { depth: null, colors: true }))
}
