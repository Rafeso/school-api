import { Student } from "../../domain/Student"
import { Database } from "../Db"

export class StudentRepository extends Database<typeof Student> {
	constructor() {
		super(Student)
	}
}
