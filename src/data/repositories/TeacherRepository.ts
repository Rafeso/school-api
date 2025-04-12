import type { Db } from "mongodb"
import { Teacher } from "../../domain/teacher/Teacher.js"
import { Database } from "../Db.js"

export class TeacherRepository extends Database<typeof Teacher> {
	constructor(connection: Db) {
		super(connection, Teacher)
	}
}
