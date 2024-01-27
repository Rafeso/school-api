import { Db } from 'mongodb'
import { Class } from '../../domain/class/Class.js'
import { Database } from '../Db.js'

export class ClassRepository extends Database<typeof Class> {
	constructor(connection: Db) {
		super(connection, Class)
	}
}
