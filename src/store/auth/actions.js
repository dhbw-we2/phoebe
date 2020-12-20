// Remember, we have access to our Vue instance not using
// an arrow function in our actions file. This allows us
// to create a scoped reference to our firebaseService - $fb
// That was assigned to the Vue instance earlier in our serviceConnection
// boot file.

import {firestoreAction} from 'vuexfire'
import User from 'src/models/User'

/**
 * Adds new user to firebase user collection
 * @param state
 * @param userRef
 * @returns {Promise<*>}
 */
export const addUserToUsersCollection = async function (state, userRef) {
  const
    {email, username, uid} = state,
    user = new User({email, username, uid})
  return userRef.set(user)
}

/**
 * Creates new firebase user with email and calls addUserToUsersCollection()
 * Implements "createUserWithEmail()" from firebase
 * @param $root
 * @param data
 * @returns {Promise<*>}
 */
export const createNewUser = async function ($root, data) {
  const $fb = this.$fb
  const {email, password, username} = data
  const fbAuthResponse = await $fb.createUserWithEmail(email, password)
  const uid = fbAuthResponse.user.uid
  const userRef = $fb.userRef(uid)
  return addUserToUsersCollection({email, username, uid}, userRef)
}

/**
 * Login function
 * Implements "loginWithEmail()" from firebase
 * @param $root
 * @param payload
 * @returns {Promise<*>}
 */
export const loginUser = async function ($root, payload) {
  const $fb = this.$fb
  const {email, password} = payload
  return await $fb.loginWithEmail(email, password)
}

/**
 * Logout function
 * Implements "logoutUser()" from firebase
 * @returns {Promise<void>}
 */
export const logoutUser = async function () {
  await firestoreAction(({unbindFirestoreRef}) => {
    unbindFirestoreRef('currentUser')
  })
  this.$fb.logoutUser()
}

/**
 * Redirects to the home page
 */
export function routeUserToHome() {
  this.$router.push({
    path: '/'
  }).catch(() => {})
}
