import { Studend } from "../../domain/student/Student";
import { Database } from "../Db";

export class StudentRepository extends Database<typeof Studend> {
	constructor() {
		super(Studend);
	}
}
