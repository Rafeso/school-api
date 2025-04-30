import { setTimeout } from "node:timers/promises"
import { MongoClient, ServerApiVersion } from "mongodb"
import type { AppConfig } from "./../config.js"
export async function connectToDatabase(config: AppConfig) {
	return tryConnect(config)
}

async function tryConnect(config: AppConfig, retries = 3) {
	try {
		const db_uri = `mongodb://${config.NODE_ENV === "production" ? encodeURIComponent(config.MONGODB_URL) : "localhost"}:27017/${encodeURIComponent(config.MONGODB_DATABASE)}`
		const client = await new MongoClient(db_uri, {
			retryReads: true,
			retryWrites: true,
			socketTimeoutMS: 0,
			connectTimeoutMS: 0,
			monitorCommands: true,
			heartbeatFrequencyMS: 1000,
			localThresholdMS: 1000,
			maxPoolSize: 100,
			auth: {
				username: config.MONGODB_USERNAME,
				password: config.MONGODB_PASSWORD,
			},
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		}).connect()
		const db = client.db(config.MONGODB_DATABASE)
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
