import { SerializableStatic } from '../types.js'
import { BaseDomainError } from './BaseDomainError.js'

export class MissingDependecyError extends BaseDomainError {
	constructor(
		searched: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		dependent: SerializableStatic,
	) {
		super(
			`${searched.name} could not be found in ${dependent.name} with locator ${locator}`,
			searched,
			{
				code: 'DEPENDENCY_LOCK',
				status: 404,
			},
		)
	}
}
