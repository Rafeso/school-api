import type { Serializable } from "./types.js"

export abstract class BaseDomain implements Omit<Serializable, "id"> {
	toJSON() {
		return JSON.stringify(this.toObject())
	}
	abstract toObject(): Record<string, unknown>
}
