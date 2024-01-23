import { Command } from 'commander'
import { ServiceList } from '../../app.js'
import { AppConfig } from '../../config.js'
import { ClassSubcommandHandler } from './commands/class/ClassSubcommandHandler.js'
import { ParentSubcommandHandler } from './commands/parent/ParentSubcommandHandler.js'
import { StudentSubcommandHandler } from './commands/student/StudentSubcommandHandler.js'
import { TeacherSubcommandHandler } from './commands/teacher/TeacherSubcommandHandler.js'

export async function CLILayer(_config: AppConfig, services: ServiceList) {
	const program = new Command()

	program
		.name('school')
		.usage('[table] <query> [options]')
		.version('0.0.1', '-v, --version', 'output the current version')
		.description('School CLI for managing a school api')

	program
		.command('parent')
		.description('Perform queries in the parent table')
		.argument('query', 'the query to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.action((subcommand, options) =>
			ParentSubcommandHandler(services, subcommand, options),
		)

	program
		.command('student')
		.description('Perform queries in the student table')
		.argument('query', 'the query to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.action((subcommand, options) =>
			StudentSubcommandHandler(services, subcommand, options),
		)
	program
		.command('teacher')
		.description('Perform queries in the teacher table')
		.argument('query', 'the query to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.action((subcommand, options) =>
			TeacherSubcommandHandler(services, subcommand, options),
		)
	program
		.command('class')
		.description('Perform queries in the class table')
		.argument('query', 'the query to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.action((subcommand, options) =>
			ClassSubcommandHandler(services, subcommand, options),
		)

	return {
		async start() {
			program.parse()
		},
		stop() {
			return
		},
	}
}
