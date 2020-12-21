import {firestoreAction} from 'vuexfire'
import {spotifyAuthRef, userRef} from 'src/services/firebase/db'

/** Get current user from the firestore collection user's
 * via firebase uid
 *
 * @param  {Object} payload.id - Firebase currentUser id
 */
export const getCurrentUser = firestoreAction(({bindFirestoreRef}, id) => {
  return Promise.all([
    bindFirestoreRef('currentUser', userRef(id)),
    bindFirestoreRef('spotifyAuth', spotifyAuthRef(id))
  ])
})

export const clearCurrentUser = firestoreAction(({unbindFirestoreRef}) => {
  unbindFirestoreRef('currentUser')
  unbindFirestoreRef('spotifyAuth')
})

export const updateUserData = async function ({state}, payload) {
  return userRef(state.currentUser.uid).update(payload)
}

export const setSpotifyAuth = function ({state}, payload) {
  return spotifyAuthRef(state.currentUser.uid).set(payload)
}

export const unlinkSpotify = function ({state}) {
  return spotifyAuthRef(state.currentUser.uid).delete()
}
