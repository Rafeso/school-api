import { ClassRepository } from '@data/repositories/ClassRepository.js'
import { ParentRepository } from '@data/repositories/ParentRepository.js'
import { StudentRepository } from '@data/repositories/StudentRepository.js'
import { TeacherRepository } from '@data/repositories/TeacherRepository.js'
import { WebLayer } from '@presentation/rest/index.js'
import { ClassService } from '@service/ClassService.js'
import { ParentService } from '@service/ParentService.js'
import { StudentService } from '@service/StudentService.js'
import { TeacherService } from '@service/TeacherService.js'
import { AppConfig, appConfig } from 'config.js'

export type ServiceList = ReturnType<typeof initDependencies>['services']

export type Application = (
	config: AppConfig,
	services: ServiceList,
) => Promise<{
	stop: () => void
	start: () => Promise<void>
}>

function initDependencies() {
	const repositories = {
		class: new ClassRepository(),
		student: new StudentRepository(),
		parent: new ParentRepository(),
		teacher: new TeacherRepository(),
	}

	const teacherService = new TeacherService(repositories.teacher)
	const parentService = new ParentService(repositories.parent)
	const studentService = new StudentService(repositories.student, parentService)
	const classService = new ClassService(
		repositories.class,
		teacherService,
		studentService,
	)

	return {
		repositories,
		services: {
			teacher: teacherService,
			parent: parentService,
			student: studentService,
			class: classService,
		},
	}
}

async function main(app: Application, config: AppConfig) {
	const { services } = initDependencies()
	const { start, stop } = await app(config, services)

	process.on('SIGINT', () => {
		console.info('SIGINT signal received.')
		stop()
	})
	process.on('SIGTERM', () => {
		console.info('SIGTERM signal received.')
		stop()
	})
	process.on('unhandledRejection', (reason) => {
		console.error('Unhandled rejection', reason)
	})
	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception', error)
		stop()
	})
	return start()
}

await main(WebLayer, appConfig)
