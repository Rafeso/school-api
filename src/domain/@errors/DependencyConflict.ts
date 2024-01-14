import { SerializableStatic } from '../sharedTypes.js'
import { BaseError } from './BaseError.js'

export class DependencyConflictError extends BaseError {
	constructor(
		entity: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		dependecy: SerializableStatic,
	) {
		super(
			`${entity.name} with locator ${JSON.stringify(
				locator,
			)} cannot be removed because it depends on ${dependecy.name}`,
			entity,
			{
				code: 'DEPENDENCY_LOCK',
				status: 404,
			},
		)
	}
}
