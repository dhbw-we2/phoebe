import spotifyService from "src/services/spotify/index";
import firebaseServices from "src/services/firebase";
import {Notify} from "quasar";

const {ensureAuthIsInitialized, ensureUserDataIsInitialized, isAuthenticated} = firebaseServices
let refreshInterval

/**
 * Function ensures that the token is refreshed
 * Handles timeout error
 * @param store
 * @returns {Promise<boolean>}
 */
export const ensureTokenIsRefreshed = (store) => {
  if (store.state.spotify.tokenReady) return true
  // Create the observer only once on init
  return new Promise((resolve, reject) => {
    let unwatch = store.watch((state) => {
      return state.spotify.tokenReady
    }, (tokenReady) => {
      if (tokenReady) {
        resolve()
        unwatch()
      }
    })
    setTimeout(() => {
      reject("Spotify Timeout")
    }, 5000)
  })
}

/**
 * Refreshes spotify auth state
 * Displays a notification
 * @param store
 * @param currentUser
 * @returns {Promise<void>}
 */
export const handleOnAuthStateChanged = async (store, currentUser) => {
  if(currentUser) {
    const notif = Notify.create({
      spinner: true,
      message: 'Refreshing Spotify Access'
    })
    refreshAndSaveAccessToken(store).then(() => {
      notif()
    })
    refreshInterval = setInterval(() => {
      refreshAndSaveAccessToken(store)
    }, 3300000)
  } else {
    clearInterval(refreshInterval)
  }
}

/**
 *
 * @param store
 * @returns {Promise<void>}
 */
const refreshAndSaveAccessToken = async (store) => {
  await ensureAuthIsInitialized(store)
  if (isAuthenticated(store)) {
    await ensureUserDataIsInitialized(store)
    if (store.state.user.currentUser.spotifyAccessToken) {
      const res = await spotifyService.refreshAccessToken(store.state.user.currentUser.spotifyRefreshToken)
      if (res) {
        await store.dispatch('user/updateUserData', {
          uid: store.state.user.currentUser.uid,
          spotifyAccessToken: res.access_token,
          spotifyRefreshToken: res.refresh_token,
        })
        await store.commit('spotify/setTokenReady', true)
      }
    }
  }
}
