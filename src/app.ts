import { appConfig } from './config'

function helloworld() {
	return console.log(appConfig.PORT)
}

helloworld()
