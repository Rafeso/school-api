import type { Serializable } from './sharedTypes.js'

export abstract class BaseDomain implements Omit<Serializable, 'id'> {
	toJSON() {
		return JSON.stringify(this.toObject())
	}
	abstract toObject(): Record<string, unknown>
}
