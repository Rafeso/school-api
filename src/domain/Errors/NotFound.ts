import { SerializableStatic } from '../types.js'
import { BaseDomainError } from './BaseDomainError.js'

export class NotFoundError extends BaseDomainError {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(locator: any, entity: SerializableStatic) {
		super(
			`${entity.name} with locator ${JSON.stringify(
				locator,
			)} could not be found`,
			entity,
			{
				code: 'NOT_FOUND',
				status: 404,
			},
		)
	}
}
