import { BaseError } from '../../@errors/BaseError.js'
import { SerializableStatic } from '../../types.js'

export class StudentMustHaveAtLeastOneParentError extends BaseError {
	constructor(
		studentEntity: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		parentEntity: SerializableStatic,
	) {
		super(
			`${parentEntity.name} with locator ${JSON.stringify(locator)} could not be removed from ${
				studentEntity.name
			} because students must have at least one parent.`,
			studentEntity,
			{
				code: 'STUDENT_MUST_HAVE_AT_LEAST_ONE_PARENT',
				status: 409,
			},
		)
	}
}
