import { Class } from "../../domain/class/Class"
import { Database } from "../Db"

export class ClassRepository extends Database<typeof Class> {
	constructor() {
		super(Class)
	}
}
