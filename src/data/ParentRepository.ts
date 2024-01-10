import { Parent } from "../domain/Parent";
import { Database } from "./Db";

export class ParentRepository extends Database {
	constructor() {
		super(Parent);
	}
}
