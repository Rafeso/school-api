import { SerializableStatic } from '../sharedTypes.js'
import { BaseError } from './BaseError.js'

export class ConflictError extends BaseError {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(entity: SerializableStatic, locator: any) {
		super(
			`${entity.name} with locator ${JSON.stringify(locator)} already exists`,
			entity,
			{
				code: 'CONFLICT',
				status: 409,
			},
		)
	}
}
