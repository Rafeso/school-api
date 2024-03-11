import chalk from 'chalk'

export const logger = {
	error(...args: unknown[]) {
		chalk.red(args)
	},
	succes(...args: unknown[]) {
		chalk.green(args)
	},
	warn(...args: unknown[]) {
		chalk.yellow(args)
	},
	info(...args: unknown[]) {
		chalk.cyan(args)
	},
}
