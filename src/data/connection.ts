import { setTimeout } from 'node:timers/promises'
import { MongoClient } from 'mongodb'
import type { AppConfig } from './../config.js'
export async function connectToDatabase(config: AppConfig) {
	return tryConnect(config)
}

async function tryConnect(config: AppConfig, retries = 3) {
	try {
		const client = await new MongoClient(config.DB_HOST).connect()
		const db = client.db(config.DB_NAME)
		return {
			db,
			close: client.close,
		}
	} catch (err) {
		if (retries > 0) {
			await setTimeout(1000 * retries)
			return tryConnect(config, retries - 1)
		}
		throw err
	}
}
