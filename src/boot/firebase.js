import firebase from 'firebase/app'
import firestore from 'firebase/firestore'
import auth from 'firebase/auth'

const config = process.env.FIREBASE_CONFIG
const FIREBASE = firebase.initializeApp(config)
const AUTH = FIREBASE.auth();
const FIRESTORE = FIREBASE.firestore();

export default ({ store, Vue }) => {
  Vue.prototype.$auth = AUTH
  Vue.prototype.$firestore = FIRESTORE
}
