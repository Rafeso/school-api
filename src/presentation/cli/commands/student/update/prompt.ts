import { inspect } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { StudentCreationSchema } from '../../../../../domain/student/types.js'
import { StudentService } from '../../../../../service/StudentService.js'

export async function updateMedications(id: string, service: StudentService) {
	const { medications } = await inquirer.prompt<{ medications: string }>({
		type: 'input',
		name: 'medications',
		message: 'New medications:',
		validate(value) {
			return StudentCreationSchema.shape.medications.safeParse([value]).success
		},
	})

	await oraPromise(service.updateMedications(id, [medications]), {
		text: 'Updating student medications...',
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.bold.red(
				`Failed to update student medications: ${err.message}\n`,
			)
		},
		successText: chalk.magentaBright.bold(
			'Student medications updated successfully!\n',
		),
	}).then((student) =>
		console.log(inspect(student.toObject(), { depth: null, colors: true })),
	)
}

export async function updateStudentParentsHandler(
	studentId: string,
	service: StudentService,
) {
	const { choice } = await inquirer.prompt<{ choice: string }>({
		type: 'list',
		name: 'choice',
		message: 'What action do you want to perform?',
		choices: [{ name: 'Add new parent' }, { name: 'Remove parent' }],
	})

	switch (choice) {
		case 'Add new parent':
			await linkParent(service, studentId)
			break
		case 'Remove parent':
			await unlinkParent(service, studentId)
			break
	}

	async function linkParent(service: StudentService, studentId: string) {
		const { parent } = await inquirer.prompt<{ parent: string }>({
			type: 'input',
			name: 'parent',
			message: 'Id of parent to add:',
			validate(value) {
				return StudentCreationSchema.shape.parents.safeParse([value]).success
			},
		})

		await oraPromise(service.linkParents(studentId, [parent]), {
			text: 'Linking parents...',
			spinner: 'bouncingBar',
			failText: (err) => {
				process.exitCode = 1
				return chalk.bold.red(`Failed to link parent: ${err.message}\n`)
			},
			successText: chalk.magentaBright.bold(
				'Student parents updated successfully!\n',
			),
		}).then((student) =>
			console.log(inspect(student.toObject(), { depth: null, colors: true })),
		)
	}

	async function unlinkParent(service: StudentService, studentId: string) {
		const { parent } = await inquirer.prompt<{ parent: string }>({
			type: 'input',
			name: 'parent',
			message: 'Id of parent to remove:',
			validate(value) {
				return StudentCreationSchema.shape.parents.safeParse([value]).success
			},
		})

		const response = await inquirer.prompt<{ choice: boolean }>({
			type: 'confirm',
			name: 'choice',
			message: `Are you sure you want to unlink parent: ${chalk.underline.bold.yellowBright(
				parent,
			)} ?`,
		})

		if (response.choice === false) {
			process.exitCode = 0
			console.info(
				chalk.yellowBright(
					'\nParent unlink proccess aborted you can exit safely now!',
				),
			)
			return
		}

		await oraPromise(service.unlinkParent(studentId, [parent]), {
			text: 'Unlinking parents...',
			spinner: 'bouncingBar',
			failText: (err) => {
				process.exitCode = 1
				return chalk.bold.red(`Failed to unlink parents: ${err.message}\n`)
			},
			successText: chalk.magentaBright.bold(
				'Student parent removed successfully!',
			),
		})
	}
}
