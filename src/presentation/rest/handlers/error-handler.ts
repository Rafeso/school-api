import type { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { ZodError } from "zod"

export const errorHandler = (
	error: FastifyError,
	_: FastifyRequest,
	reply: FastifyReply,
) => {
	if (error instanceof ZodError) {
		error.statusCode = 422
		return reply.status(422).send({
			code: "INVALID_PAYLOAD",
			message: "invalid payload",
			errors: error.issues,
		})
	}

	return reply.status(error.statusCode ?? 500).send({
		code: error.code ?? "UNKNOWN_ERROR",
		message: error.message,
		name: error.name,
	})
}
