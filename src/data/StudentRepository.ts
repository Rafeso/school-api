import { Studend } from "../domain/Student";
import { Database } from "./Db";

export class StudentRepository extends Database {
	constructor() {
		super(Studend);
	}
}
