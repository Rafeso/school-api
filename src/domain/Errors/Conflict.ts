import { SerializableStatic } from '../types.js'
import { BaseDomainError } from './BaseDomainError.js'

export class ConflictError extends BaseDomainError {
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
