const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.newUser = functions.auth.user().onCreate((event) => {
  const user = event.data
  const data = Object.assign({},
    ...['email', 'displayName', 'photoURL', 'uid']
    .map((e) => ({ [`/users/${user.uid}/${e}`]: user[e] })),
    { [`/users/${user.uid}/isAllowed`]: false }
  )
  return admin.database().ref().update(data)
})