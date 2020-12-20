import firebase from 'firebase/app'
import 'firebase/auth'

/**
 * Returns Firebase 's global namespace from which all Firebase services are accessed
 * https://firebase.google.com/docs/reference/js/firebase.auth.html#callable
 * @return {Object} Firebase Module
 */
export const self = () => {
  return firebase
}

/**
 * Returns Firebase 's auth service
 * https://firebase.google.com/docs/reference/js/firebase.auth.html#callable
 * @return {Object} currentUser object from firebase
 */
export const auth = () => {
  return firebase.auth()
}

/**
 * Async functions providing the application time to
 * wait for firebase to initialize and determine if a
 * user is authenticated or not with only a single observable
 *
 */
export const ensureAuthIsInitialized = (store) => {
  if (store.state.auth.isReady) return true
  // Create the observer only once on init
  return new Promise((resolve, reject) => {
    // Use a promise to make sure that the router will eventually show the route after the auth is initialized.
    const unsubscribe = firebase.auth().onAuthStateChanged(() => {
      resolve()
      unsubscribe()
    }, () => {
      reject(new Error('Looks like there is a problem with the firebase service. Please try again later'))
    })
  })
}


/**
 * Handles waiting for user data. Return true if it is ready
 * Rejects if timeout is triggered.
 *
 * @param store
 * @returns {Promise<unknown>|boolean}
 */
export const ensureUserDataIsInitialized = (store) => {
  if (store.state.user.isReady) return true
  // Create the observer only once on init
  return new Promise((resolve, reject) => {
    let unwatch = store.watch((state) => {
      return state.user.isReady
    }, (isReady) => {
      if (isReady) {
        resolve()
        unwatch()
      }
    })
    setTimeout(() => {
      reject("User Data Timeout")
    }, 5000)
  })
}

/** Convenience method to initialize firebase app
 * @param  {Object} config
 * @return {Object} App
 */
export const fBInit = (config) => {
  // Initialize App //
  const fb = firebase.initializeApp(config)

  // Enable Firestore Persistence //
  firebase.firestore().settings({
    // Set cache size to 100 MB //
    cacheSizeBytes: 100000000
  })
  firebase.firestore().enablePersistence({synchronizeTabs: true})
    .catch(err => {
      console.error(err)
    })

  return fb
}

/** Handle the auth state of the user and
 * set it in the auth store module
 * @param  {Object} store - Vuex Store
 * @param  {Object} currentUser - Firebase currentUser
 */
export const handleOnAuthStateChanged = async (store, currentUser) => {
  const initialAuthState = isAuthenticated(store)
  // Save to the store
  store.commit('auth/setAuthState', {
    isAuthenticated: currentUser !== null,
    isReady: true,
    uid: (currentUser ? currentUser.uid : '')
  })

  // Get & bind the current user (unbind on logout)
  if (store.state.auth.isAuthenticated) {
    await store.dispatch('user/getCurrentUser', currentUser.uid)
    await store.commit('user/setReady', true)
  }

  // If the user looses authentication route
  // them to the login page and clear currentUser state
  if (!currentUser && initialAuthState) {
    await store.dispatch('auth/routeUserToHome')
    await store.dispatch('user/clearCurrentUser')
    await store.commit('user/setReady', false)
  }
}

/**
 * Convenience method to know if a user is authenticated
 * @param  {Object} store - Vuex store
 */
export const isAuthenticated = (store) => {
  return store.state.auth.isAuthenticated
}

/**
 * remove firebase auth token
 */
export const logoutUser = () => {
  return auth().signOut()
}
