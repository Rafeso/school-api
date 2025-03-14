import { randomUUID } from 'node:crypto'
import type { TestContext } from 'node:test'
import type { Database } from '../../data/Db.js'
import { Class } from '../../domain/class/Class.js'
import type { ClassCreationType } from '../../domain/class/types.js'
import { Student } from '../../domain/student/Student.js'
import type { StudentCreationType } from '../../domain/student/types.js'
import { Teacher } from '../../domain/teacher/Teacher.js'
import type { TeacherCreationType } from '../../domain/teacher/types.js'
import type { Serializable, SerializableStatic } from '../../domain/types.js'

export const teacherId = 'a737e4b7-c061-40ca-b573-11d3690901a6'
export const classId = 'e7409eb1-3f42-4eb1-a723-afc35e2eac3f'
export const studentId = 'cea0eac7-055a-41ae-bd6d-c1177d8cf412'

export const dummyClass = (creationData?: Partial<ClassCreationType>) =>
	new Class({
		id: creationData?.id || classId,
		code: creationData?.code ?? '1B-M',
		teacher: creationData?.teacher === undefined ? teacherId : creationData.teacher,
	})

export const dummyStudent = (creationData?: Partial<StudentCreationType>) =>
	new Student({
		id: creationData?.id ?? studentId,
		birthDate: creationData?.birthDate ?? new Date('2010-10-10').toISOString(),
		class: creationData?.class ?? classId,
		document: creationData?.document ?? '12345678900',
		allergies: creationData?.allergies ?? ['Laranja'],
		medications: creationData?.medications ?? ['Dipirona'],
		bloodType: creationData?.bloodType ?? 'A+',
		firstName: creationData?.firstName ?? 'John',
		surname: creationData?.surname ?? 'Doe',
		startDate: creationData?.startDate ?? new Date('2010-10-10').toISOString(),
		parents: creationData?.parents ?? [randomUUID(), randomUUID()],
	})

export const dummyTeacher = (creationData?: Partial<TeacherCreationType>) =>
	new Teacher({
		id: creationData?.id ?? teacherId,
		firstName: creationData?.firstName ?? 'John',
		surname: creationData?.surname ?? 'Doe',
		document: creationData?.document ?? '12345678900',
		email: creationData?.email ?? 'foo@gmail.com',
		hiringDate: creationData?.hiringDate ?? new Date('2010-10-10').toISOString(),
		major: creationData?.major ?? 'Math',
		phone: creationData?.phone ?? '12345678900',
		salary: creationData?.salary ?? 1000,
	})

//@ts-ignore
export const dummyDatabase = <
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
>(
	t: TestContext,
	// biome-ignore lint/suspicious/noExplicitAny: Como se trata de testes usar any é mais fácil e conveniente,
	entityFactory: (...args: any) => I,
	// Esses tipos asseguram que 'methodReturns' contenha apenas métodos (funções) exlcuindo o 'db'
	// e 'dbEntity' evitando que 'Collection<Document>' cause erros
	methodReturns: {
		[DBkey in keyof Omit<Database<S, I>, 'dbEntity'>]?: ReturnType<
			// biome-ignore lint/suspicious/noExplicitAny: Como se trata de testes usar any é mais fácil e conveniente,
			Database<S, I>[DBkey] extends (...args: any) => any
				? ReturnType<Database<S, I>[DBkey]>
				: never
		>
	} = {},
) => ({
	findById: t.mock.fn(async (id: string) => methodReturns.findById ?? entityFactory({ id })),
	// biome-ignore lint/suspicious/noExplicitAny: Como se trata de testes usar any é mais fácil e conveniente,
	db: {} as any, // Mock do MongoDB (pode ser um stub real se necessário)
	list: t.mock.fn(async () => methodReturns.list ?? [entityFactory()]),
	listBy: t.mock.fn(
		async <L extends keyof I>(_prop: L, _value: I[L]) =>
			methodReturns.listBy ?? [entityFactory({ id: classId, [_prop]: _value })],
	),
	remove: t.mock.fn(async (_id: string) => methodReturns.remove ?? t.mock.fn()),
	save: t.mock.fn(
		async (_entity: ReturnType<typeof entityFactory>) =>
			methodReturns.save ?? dummyDatabase(t, entityFactory, methodReturns),
	),
	dbEntity: {
		collection: 'dummyEntity',
		// biome-ignore lint/suspicious/noExplicitAny: Como se trata de testes usar any é mais fácil e conveniente,
		fromObject: (obj: any) => entityFactory(obj),
	} as S,
})
