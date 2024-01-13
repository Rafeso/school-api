import { appConfig } from './config.js'

function helloworld() {
	return console.log(appConfig.PORT)
}

helloworld()
