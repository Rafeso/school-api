import fastify, { FastifyError, FastifyReply } from "fastify"
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod"
import { FastifyReplyType } from "fastify/types/type-provider.js"
import { ZodError, z } from "zod"
import type { ServiceList } from "../../app.js"
import type { AppConfig } from "../../config.js"
import { loggerConfig } from "../../utils/logger-config.js"
import { classRouterFactory } from "./class.js"
import { errorHandler } from "./handlers/error-handler.js"
import { parentRouterFactory } from "./parent.js"
import { studentRouterFactory } from "./student.js"
import { teacherRouterFactory } from "./teacher.js"

export const onlyIdParam = {
	schema: { params: z.object({ id: z.string().uuid() }) },
}

export const StudentAndParentId = {
	schema: {
		params: z.object({
			id: z.string().uuid(),
			parentId: z.string().uuid(),
		}),
	},
}

const MAX_PAGE_SIZE = 100
export const queryPage = {
	schema: {
		querystring: z.object({
			page: z
				.string()
				.transform((value) => Number(value))
				.optional(),
			per_page: z
				.string()
				.transform((value) => Number(value))
				.refine((value) => value <= MAX_PAGE_SIZE)
				.optional(),
		}),
	},
}

export async function WebLayer(config: AppConfig, services: ServiceList) {
	const app = fastify({
		logger: loggerConfig[config.NODE_ENV] ?? true,
	})
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler(errorHandler)

	let server: typeof app

	app.register(classRouterFactory(services.class), {
		prefix: "/v1/classes",
	})
	app.register(parentRouterFactory(services.parent, services.student), {
		prefix: "/v1/parents",
	})
	app.register(
		teacherRouterFactory(services.teacher, services.class, services.student),
		{
			prefix: "/v1/teachers",
		},
	)
	app.register(studentRouterFactory(services.student), {
		prefix: "/v1/students",
	})

	app.get("/v1/ping", (_, res) => res.send("pong"))

	const start = async () => {
		server = app
		app.listen({ port: config.PORT, host: "0.0.0.0" }, (err, addr) => {
			if (err) return app.log.error(err)

			app.log.info(`Server listening on port ${addr}`)
		})
	}

	const stop = () => {
		app.log.debug("Stopping web layer")
		if (server) {
			server.close(() => {
				app.log.info("Web layer stopped")
				process.exit(0)
			})
		}
	}

	return {
		start,
		stop,
	}
}
