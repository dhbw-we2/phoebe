/*
  dependencies
*/

const express = require('express')
const admin = require('firebase-admin')


/*
  config - express
*/

const app = express()


/*
  config firebase

  info: go to firebase => console => our project => settings => service account
        create your own ServiceAccountKey and put it in pheobe/backend/
*/

const serviceAccount = require("./serviceAccountKey.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

/*
  endpoint -posts
*/


app.get('/posts', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  let posts = [
  ]

  db.collection('posts').get().then(snapshot => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    res.send(posts)
  })
})
app.listen(3000)
