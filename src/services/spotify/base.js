import {firestore} from "firebase/app";
import {Notify} from "quasar";
import {store} from "src/store"
import {refreshAccessToken} from "src/services/spotify/api";

let refreshInterval

/**
 * Ensures the access code is valid and starts refresh if invalid.
 * Waits until refresh has completed before exit.
 * @param store
 * @returns {Promise<unknown>}
 */
export const ensureAccessCodeIsValid = (store) => {
  const now = new Date()
  const in5Minutes = now.setMinutes(now.getMinutes() + 5)
  if (store.state.user.spotifyAuth.expires.toDate() < in5Minutes) {
    const removeNotify = Notify.create({
      spinner: true,
      message: 'Refreshing Spotify Access'
    })
    refreshAndSaveAccessToken(store).then(() => {
      removeNotify()
    })

    // Create the observer only once on init
    return new Promise((resolve, reject) => {
      let unwatch = store.watch((state) => {
        return state.user.spotifyAuth.expires
      }, (expires) => {
        if (expires.toDate() > new Date()) {
          resolve()
          unwatch()
        }
      })
      setTimeout(() => {
        reject("Spotify Request Timeout")
      }, 5000)
    })
  }
}

export const handleOnAuthStateChanged = (currentUser) => {
  if (!currentUser) {
    clearInterval(refreshInterval)
  }
}

export const saveSpotifyAuthData = async (data) => {
  const expires = new Date();
  expires.setSeconds(new Date().getSeconds() + data.expires_in)
  await store.dispatch('user/setSpotifyAuth',{
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expires: firestore.Timestamp.fromDate(expires)
  })
}

export const refreshAndSaveAccessToken = async (store) => {
  try {
    const data = await refreshAccessToken(store.state.user.spotifyAuth.refreshToken)
    refreshInterval = setInterval(() => {
      refreshAndSaveAccessToken(store)
    }, 3300000)
    await saveSpotifyAuthData(data)
  } catch (e) {
    Notify.create({
      type: 'negative',
      message: `Failed to refresh Spotify access token! Please re-link your account in your profile`,
      timeout: 10000
    })
  }
}
