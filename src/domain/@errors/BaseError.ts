import type { SerializableStatic } from '../types.js'

interface DomainErrosOptions extends ErrorOptions {
	code?: string
	statusCode?: number
}

export abstract class BaseError extends Error {
	readonly code: string
	readonly statusCode: number
	constructor(message: string, entity: SerializableStatic, options?: DomainErrosOptions) {
		super(message, options)
		this.name = `${entity.name}Error`
		this.code = options?.code ?? 'UNKNOWN_ERROR'
		this.statusCode = options?.statusCode ?? 500
	}
}
