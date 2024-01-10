import { Teacher } from "../domain/Teacher";
import { Database } from "./Db";

export class TeacherRepository extends Database {
	constructor() {
		super(Teacher);
	}
}
