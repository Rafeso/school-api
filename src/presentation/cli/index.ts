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
			(await import('../../../package.json', { assert: { type: 'json' } }))
				.default.version,
			'-v, --version',
			'output the current version.',
		)
		.description('School CLI for managing a school api.')

	program
		.command('parent')
		.description('Parents commands for managing parents.')
		.argument(
			'subcommand',
			'the subcommand to be executed: find, create, delete, list.',
		)
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted.',
		)
		.option(
			'-p, --page [page]',
			'If subcommand is list, the page number to be returned.',
		)
		.option(
			'-l, --pageLength [pageLength]',
			'If subcommand is list, the max number of items to be returned in page.',
		)
		.addHelpText(
			'after',
			'\nExample call: \n $ school parent create \n $ school parent find -i <id> \n $ school parent list -p <page> -l <pageLength> \n $ school parent delete -i <id> \n $ school parent update -i <id>',
		)
		.action((subcommand, options) =>
			ParentSubcommandHandler(services, subcommand, options),
		)

	program
		.command('student')
		.description('Student commands for managing students.')
		.argument(
			'subcommand',
			'the subcommand to be executed: find, create, delete, list.',
		)
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted.',
		)
		.option(
			'-p, --page [page]',
			'If subcommand is list, the page number to be returned.',
		)
		.option(
			'-l, --pageLength [pageLength]',
			'If subcommand is list, the max number of items to be returned in page.',
		)
		.addHelpText(
			'after',
			'\nExample call: \n $ school student create \n $ school student find -i <id> \n $ school student list -p <page> -l <pageLength> \n $ school student delete -i <id> \n $ school student update -i <id>',
		)
		.action((subcommand, options) =>
			StudentSubcommandHandler(services, subcommand, options),
		)

	program
		.command('teacher')
		.description('Teacher commands for managing teachers.')
		.argument(
			'subcommand',
			'the subcommand to be executed: find, create, delete, list.',
		)
		.option(
			'-i,--id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted.',
		)
		.option(
			'-p, --page [page]',
			'If subcommand is list, the page number to be returned.',
		)
		.option(
			'-l, --pageLength [pageLength]',
			'If subcommand is list, the max number of items to be returned in page.',
		)
		.addHelpText(
			'after',
			'\nExample call: \n $ school teacher create \n $ school teacher find -i <id> \n $ school teacher list -p <page> -l <pageLength> \n $ school teacher delete -i <id> \n $ school teacher update -i <id>',
		)
		.action((subcommand, options) =>
			TeacherSubcommandHandler(services, subcommand, options),
		)

	program
		.command('class')
		.description('Class commands for managing classes.')
		.argument(
			'subcommand',
			'the subcommand to be executed: find, create, delete, list.',
		)
		.option(
			'-i, --id [id]',
			'If subcommand is find or delete, the id of the parent to be found or deleted.',
		)
		.option(
			'-p, --page [page]',
			'If subcommand is list, the page number to be returned.',
		)
		.option(
			'-l, --pageLength [pageLength]',
			'If subcommand is list, the max number of items to be returned in page.',
		)
		.addHelpText(
			'after',
			'\nExample call: \n $ school class create \n $ school class find -i <id> \n $ school class list -p <page> -l <pageLength> \n $ school class delete -i <id> \n $ school class update -i <id>',
		)
		.action((subcommand, options) =>
			ClassSubcommandHandler(services, subcommand, options),
		)

	const start = async () => {
		program.parse()
	}

	const stop = () => {
		process.exit(process.exitCode || 0)
	}

	return {
		start,
		stop,
	}
}
