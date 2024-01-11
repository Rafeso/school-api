import { Parent } from "../../domain/parent/Parent"
import { Database } from "../Db"

export class ParentRepository extends Database<typeof Parent> {
	constructor() {
		super(Parent)
	}
}
