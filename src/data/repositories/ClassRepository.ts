import { Class } from "../../domain/Class"
import { Database } from "../Db"

export class ClassRepository extends Database<typeof Class> {
	constructor() {
		super(Class)
	}
}
