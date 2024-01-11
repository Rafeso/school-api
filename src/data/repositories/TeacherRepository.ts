import { Teacher } from "../../domain/teacher/Teacher";
import { Database } from "../Db";

export class TeacherRepository extends Database<typeof Teacher> {
	constructor() {
		super(Teacher);
	}
}
