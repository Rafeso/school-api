import { Serializable } from "../domain/types";
import { SerializableStatic } from "../domain/types";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname } from "path";
import { writeFileSync } from "node:fs";

export abstract class Database<
	S extends SerializableStatic,
	I extends Serializable = InstanceType<S>,
> {
	protected readonly dbPath: string;
	protected dbData: Map<string, I> = new Map();
	readonly dbEntity: S;

	constructor(entity: S) {
		const dbFileName = `${entity.name.toLowerCase()}.json`;
		const dbPath = path.join(__dirname, ".data", dbFileName);

		this.dbPath = dbPath;
		this.dbEntity = entity;
		this.#initialize();
	}

	#initialize() {
		if (!existsSync(dirname(this.dbPath))) {
			mkdirSync(dirname(this.dbPath), { recursive: true });
		}

		if (existsSync(this.dbPath)) {
			const data: [string, Record<string, unknown>][] = JSON.parse(
				readFileSync(this.dbPath, "utf-8"),
			);
			for (const [key, value] of data) {
				this.dbData.set(key, this.dbEntity.fromObject(value));
			}
			return;
		}
		this.#updateFile();
	}

	#updateFile() {
		const data = [...this.dbData.entries()].map(([key, value]) => [
			key,
			value.toObject(),
		]);
		writeFileSync(this.dbPath, JSON.stringify(data));

		return this;
	}

	findByiD(id: string) {
		return this.dbData.get(id);
	}

	listAll(): I[] {
		if (this.dbData.size === 0) return [];

		return [...this.dbData.values()];
	}

	listBy<L extends keyof I>(property: L, value: I[L]) {
		const allData = this.listAll();
		return allData.filter((data) => {
			let comparable = data[property] as unknown;
			let comparison = value as unknown;

			if (typeof comparable === "object")
				[comparable, comparison] = [
					JSON.stringify(comparable),
					JSON.stringify(comparison),
				];

			return comparable === comparison;
		});
	}

	remove(id: string) {
		this.dbData.delete(id);
		return this.#updateFile();
	}

	save(entity: I) {
		this.dbData.set(entity.id, entity);
		return this.#updateFile();
	}
}
