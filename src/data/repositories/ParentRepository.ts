import { Db } from 'mongodb'
import { Parent } from '../../domain/parent/Parent.js'
import { Database } from '../Db.js'

export class ParentRepository extends Database<typeof Parent> {
	constructor(connection: Db) {
		super(connection, Parent)
	}
}
