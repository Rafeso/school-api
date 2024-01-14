import { SerializableStatic } from '../types.js'
import { BaseDomainError } from './BaseDomainError.js'

export class DependencyConflictError extends BaseDomainError {
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
