import { Student } from '../../domain/student/Student.js'
import { Database } from '../Db.js'

export class StudentRepository extends Database<typeof Student> {
	constructor() {
		super(Student)
	}
}
