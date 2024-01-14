import { SerializableStatic } from '../sharedTypes.js'

interface DomainErrosOptions extends ErrorOptions {
	code?: string
	status?: number
}

export abstract class BaseError extends Error {
	readonly code: string
	readonly status: number
	constructor(
		message: string,
		entity: SerializableStatic,
		options?: DomainErrosOptions,
	) {
		super(message, options)
		this.name = `${entity.name}Error`
		this.code = options?.code ?? 'DOMAIN ERROR'
		this.status = options?.status ?? 500
	}
}
