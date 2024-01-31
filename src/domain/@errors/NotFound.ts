import { SerializableStatic } from '../types.js'
import { BaseError } from './BaseError.js'

export class NotFoundError extends BaseError {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(locator: any, entity: SerializableStatic) {
		super(`${entity.name} with locator ${JSON.stringify(locator)} could not be found`, entity, {
			code: 'NOT_FOUND',
			status: 404,
		})
	}
}
