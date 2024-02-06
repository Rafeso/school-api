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
		.usage('command <subcommand> [flags]')
		.version(
			(await import('../../../package.json', { assert: { type: 'json' } })).default.version,
			'-v, --version',
			'output the current version',
		)
		.description('School CLI for managing a school api')

	program
		.command('parent')
		.description('Perform queries in the parent table')
		.argument('command', 'the command to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.option('-p, --page [page]', 'If subcommand is list, the page number to be returned')
		.option(
			'-l, --perPage [perPage]',
			'If subcommand is list, the max number of items to be returned per page',
		)
		.action((subcommand, options) => ParentSubcommandHandler(services, subcommand, options))

	program
		.command('student')
		.description('Perform queries in the student table')
		.argument('command', 'the command to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.option('-p, --page [page]', 'If subcommand is list, the page number to be returned')
		.option(
			'-l, --perPage [perPage]',
			'If subcommand is list, the max number of items to be returned per page',
		)
		.action((subcommand, options) => StudentSubcommandHandler(services, subcommand, options))

	program
		.command('teacher')
		.description('Perform queries in the teacher table')
		.argument('command', 'the command to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.option('-p, --page [page]', 'If subcommand is list, the page number to be returned')
		.option(
			'-l, --perPage [perPage]',
			'If subcommand is list, the max number of items to be returned per page',
		)
		.action((subcommand, options) => TeacherSubcommandHandler(services, subcommand, options))

	program
		.command('class')
		.description('Perform queries in the class table')
		.argument('command', 'the command to be executed: find, create, delete, list')
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted',
		)
		.option('-p, --page [page]', 'If subcommand is list, the page number to be returned')
		.option(
			'-l, --perPage [perPage]',
			'If subcommand is list, the max number of items to be returned per page',
		)
		.action((subcommand, options) => ClassSubcommandHandler(services, subcommand, options))

	const start = async () => {
		program.parse()
	}

	const stop = () => {
		process.exit(0)
	}

	return {
		start,
		stop,
	}
}
