import { env } from "node:process"
import { config } from "dotenv"
import { z } from "zod"

config()
export const AppConfigSchema = z.object({
	NODE_ENV: z.string().default("development"),
	PORT: z
		.string()
		.optional()
		.default("3000")
		.transform((value) => Number(value))
		.refine((port) => port >= 0 && port <= 65535, {
			message: "Port must be less than 65535",
		}),
	MONGODB_URL: z.string(),
	MONGODB_DATABASE: z.string(),
	MONGODB_USERNAME: z.string(),
	MONGODB_PASSWORD: z.string(),
})
export type AppConfig = z.infer<typeof AppConfigSchema>

export const appConfig: AppConfig = AppConfigSchema.parse(env)
