#!/usr/bin/env node

import { AppConfig, appConfig } from './config.js'
import { connectToDatabase } from './data/connection.js'
import { ClassRepository } from './data/repositories/ClassRepository.js'
import { ParentRepository } from './data/repositories/ParentRepository.js'
import { StudentRepository } from './data/repositories/StudentRepository.js'
import { TeacherRepository } from './data/repositories/TeacherRepository.js'
import { CLILayer } from './presentation/cli/index.js'
import { WebLayer } from './presentation/rest/index.js'
import { ClassService } from './service/ClassService.js'
import { ParentService } from './service/ParentService.js'
import { StudentService } from './service/StudentService.js'
import { TeacherService } from './service/TeacherService.js'

export type ServiceList = Awaited<ReturnType<typeof initDependencies>>['services']

export type Application = (
	config: AppConfig,
	services: ServiceList,
) => Promise<{
	stop: () => void
	start: () => Promise<void>
}>

async function initDependencies(config: AppConfig) {
	const { db, close } = await connectToDatabase(config)
	const repositories = {
		class: new ClassRepository(db),
		student: new StudentRepository(db),
		parent: new ParentRepository(db),
		teacher: new TeacherRepository(db),
	}

	const teacherService = new TeacherService(repositories.teacher)
	const parentService = new ParentService(repositories.parent)
	const studentService = new StudentService(repositories.student, parentService)
	const classService = new ClassService(repositories.class, teacherService, studentService)

	return {
		repositories,
		services: {
			teacher: teacherService,
			parent: parentService,
			student: studentService,
			class: classService,
		},
		dispose: async () => close(),
	}
}

async function main(app: Application, config: AppConfig) {
	const { services, dispose } = await initDependencies(config)
	const { start, stop } = await app(config, services)

	process.on('SIGINT', async () => {
		console.info('SIGINT signal received.')
		stop()
		await dispose()
	})
	process.on('SIGTERM', async () => {
		console.info('SIGTERM signal received.')
		stop()
		await dispose()
	})
	process.on('unhandledRejection', (reason) => {
		console.error('Unhandled rejection', reason)
	})
	process.on('uncaughtException', async (error) => {
		console.error('Uncaught exception', error)
		stop()
		await dispose()
	})
	return start()
}

if (process.env.IS_WEB) {
	await main(WebLayer, appConfig)
} else {
	await main(CLILayer, appConfig)
}
