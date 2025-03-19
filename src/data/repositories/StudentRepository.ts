import type { Db } from 'mongodb'
import { Student } from '../../domain/student/Student.js'
import { Database } from '../Db.js'

export class StudentRepository extends Database<typeof Student> {
	constructor(connection: Db) {
		super(connection, Student)
	}
}
