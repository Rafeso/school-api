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
		.usage('school [command] <query> [options]')
		.version('0.0.1', '-v, --version', 'output the current version')
		.description('School CLI for managing a school api')

	program
		.command('parent')
		.argument('query')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.action((subcommand, options) =>
			ParentSubcommandHandler(services, subcommand, options),
		)

	program
		.command('student')
		.argument(
			'-i, --id [id]',
			'If subcommand is find or delete, the id of the student to be found or deleted',
		)
		.action((subcommand, options) =>
			StudentSubcommandHandler(services, subcommand, options),
		)
	program
		.command('teacher')
		.argument(
			'-i, --id [id]',
			'If subcommand is find or delete, the id of the teacher to be found or deleted',
		)
		.action((subcommand, options) =>
			TeacherSubcommandHandler(services, subcommand, options),
		)
	program
		.command('class')
		.argument('query')
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
