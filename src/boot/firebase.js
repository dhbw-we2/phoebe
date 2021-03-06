import firebaseService from '../services/firebase'

export default ({store, Vue}) => {
  const config = process.env.FIREBASE_CONFIG
  firebaseService.fBInit(config)

  // Tell the application what to do when the
  // authentication state has changed
  firebaseService.auth().onAuthStateChanged((currentUser) => {
    firebaseService.handleOnAuthStateChanged(store, currentUser)
  }, (error) => {
    console.error(error)
  })

  Vue.prototype.$fb = firebaseService
  Vue.prototype.$firestore = firebaseService.firestore()
  store.$fb = firebaseService
}
