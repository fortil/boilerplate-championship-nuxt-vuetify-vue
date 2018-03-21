import * as fire from 'firebase'
import config from '../firebase.config.json'

if (process.browser) {
  fire.initializeApp(config)
}

export const firebase = fire
export const db = firebase.database
export const auth = firebase.auth
export const store = firebase.storage
export const messaging = firebase.messaging
