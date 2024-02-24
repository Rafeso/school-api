import { SerializableStatic } from '../types.js'
import { BaseError } from './BaseError.js'

export class BadRequestError extends BaseError {
	constructor(entity: SerializableStatic, message?: string) {
		super(message ? message : 'Bad Request', entity, {
			code: 'BAD_REQUEST',
			status: 400,
		})
	}
}
