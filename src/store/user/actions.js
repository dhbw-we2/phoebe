import { firestoreAction } from 'vuexfire'
import { userRef } from 'src/services/firebase/db'

/** Get current user from the firestore collection user's
 * via firebase uid
 *
 * @param  {Object} payload.id - Firebase currentUser id
 */
export const getCurrentUser = firestoreAction(({ bindFirestoreRef }, id) => {
  return bindFirestoreRef('currentUser', userRef('users', id))
})

/**
 * @param  {Object} {state}
 * @param  {Object} payload
 */
export const updateUserData = async function ({ state }, payload) {
  return userRef('users', payload.id).update(payload)
}
