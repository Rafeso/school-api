import type { SerializableStatic } from "../types.js"
import { BaseError } from "./BaseError.js"

export class DependencyConflictError extends BaseError {
	constructor(
		entity: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		locator: any,
		dependecy: SerializableStatic,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		dependencyLocator?: any,
	) {
		super(
			`${entity.name} with locator ${JSON.stringify(
				locator,
			)} cannot be removed because it depends on ${dependecy.name}${
				dependencyLocator ? `: ${JSON.stringify(dependencyLocator)}` : ""
			}.`,
			entity,
			{
				code: "DEPENDENCY_LOCK",
				statusCode: 409,
			},
		)
	}
}
