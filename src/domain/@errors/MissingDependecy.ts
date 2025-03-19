import type { SerializableStatic } from '../types.js'
import { BaseError } from './BaseError.js'

export class MissingDependecyError extends BaseError {
	constructor(
		searched: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		dependent: SerializableStatic,
	) {
		super(
			`${searched.name} could not be found in ${dependent.name} with locator ${JSON.stringify(locator)}.`,
			searched,
			{
				code: 'MISSING_DEPENDENCY',
				status: 404,
			},
		)
	}
}
