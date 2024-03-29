import chalk from 'chalk'
import inquirer from 'inquirer'
import { oraPromise } from 'ora'
import { DependencyConflictError } from '../../../../domain/@errors/DependencyConflict.js'
import { Parent } from '../../../../domain/parent/Parent.js'
import {
	ParentCreationSchema,
	ParentCreationType,
} from '../../../../domain/parent/types.js'
import { Student } from '../../../../domain/student/Student.js'
import { ParentService } from '../../../../service/ParentService.js'
import { StudentService } from '../../../../service/StudentService.js'
import { logger } from '../../../../utils/logger.js'

export async function deleteParentHandler(
	parentService: ParentService,
	studentService: StudentService,
	id?: string,
) {
	let parentId: NonNullable<ParentCreationType['id']>
	if (id) {
		parentId = id
	} else {
		const { id } = await inquirer.prompt<{ id: string }>({
			type: 'input',
			name: 'id',
			message: 'Parent id:',
			validate(value) {
				return ParentCreationSchema.shape.id.safeParse(value).success
			},
		})
		parentId = id
	}

	await oraPromise(parentService.findById(parentId), {
		text: chalk.cyan('Finding parent...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to find parent: ${err.message}\n`)
		},
	})

	const checkStudents = await studentService.listBy('parents', [parentId])
	if (checkStudents.length > 0) {
		process.exitCode = 1
		throw new DependencyConflictError(
			Parent,
			parentId,
			Student,
			checkStudents.map((s) => s.id),
		)
	}

	const { confirmDeletion } = await inquirer.prompt<{
		confirmDeletion: boolean
	}>({
		type: 'confirm',
		name: 'confirmDeletion',
		message: `Are you sure you want to delete parent: ${chalk.underline.bold.yellowBright(
			parentId,
		)} ?`,
	})

	if (!confirmDeletion) {
		logger.info('\nParent deletion aborted. exiting...')
		process.exit(0)
	}

	await oraPromise(parentService.remove(parentId), {
		text: chalk.cyan('Deleting parent...'),
		spinner: 'bouncingBar',
		failText: (err) => {
			process.exitCode = 1
			return chalk.red(`Failed to delete parent: ${err.message}\n`)
		},
		successText: chalk.green('Parent was deleted.'),
	})
}
