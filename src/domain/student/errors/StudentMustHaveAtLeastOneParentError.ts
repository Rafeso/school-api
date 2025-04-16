import { BaseError } from "../../@errors/BaseError.js"
import type { SerializableStatic } from "../../types.js"

export class StudentMustHaveAtLeastOneParentError extends BaseError {
	constructor(
		studentEntity: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		parentEntity: SerializableStatic,
	) {
		super(
			`${parentEntity.name} with locator ${JSON.stringify(locator)} could not be removed from because ${
				studentEntity.name
			} must have at least one parent.`,
			studentEntity,
			{
				code: "CONFLICT",
				statusCode: 409,
			},
		)
	}
}
