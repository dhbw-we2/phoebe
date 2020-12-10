import spotifyService from "src/services/spotify/index";

/**
 *
 * @param store
 * @returns {Promise<boolean>}
 */
export const ensureTokenIsRefreshed = async (store) => {
  if (store.state.spotify.isReady) return true
  const res = await spotifyService.refreshAccessToken(store.state.user.currentUser.spotifyRefreshToken)
  if (res) {
    await store.dispatch('user/updateUserData', {spotifyAccessToken: res.access_token, spotifyRefreshToken: res.refresh_token, uid: store.state.user.currentUser.uid})
    await store.commit('spotify/setReady', true)
  }
  return true
}
