import fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { ZodError, z } from 'zod'
import { ServiceList } from '../../app.js'
import { AppConfig } from '../../config.js'
import { classRouterFactory } from './class.js'
import { parentRouterFactory } from './parent.js'
import { studentRouterFactory } from './student.js'
import { teacherRouterFactory } from './teacher.js'

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

export const queryPage = {
	schema: {
		querystring: z.object({
			page: z.string().optional(),
			perPage: z.string().optional(),
		}),
	},
}

export async function WebLayer(config: AppConfig, services: ServiceList) {
	const app = fastify({ logger: true })
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)
	app.setErrorHandler((error, _, reply) => {
		if (error instanceof ZodError) {
			error.statusCode = 422
			return reply.status(422).send({
				code: 'INVALID_PAYLOAD',
				message: 'invalid payload',
				errors: error.issues,
			})
		}
		return reply.send(error)
	})

	let server: typeof app

	app.register(classRouterFactory(services.class, services.teacher), {
		prefix: '/v1/classes',
	})
	app.register(parentRouterFactory(services.parent, services.student), {
		prefix: '/v1/parents',
	})
	app.register(teacherRouterFactory(services.teacher, services.class, services.student), {
		prefix: '/v1/teachers',
	})
	app.register(studentRouterFactory(services.student, services.class), {
		prefix: '/v1/students',
	})

	const start = async () => {
		console.log('Starting web layer')
		server = app
		await app.listen({ port: config.PORT })
		console.info(`Listening on port ${config.PORT}`)
	}

	const stop = () => {
		console.debug('Stopping web layer')
		if (server) {
			server.close(() => {
				console.info('Web layer stopped')
				process.exit(0)
			})
		}
	}

	return {
		start,
		stop,
	}
}
