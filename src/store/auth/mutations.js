/**
 * This function sets the current auth state to the given one
 * @param state
 * @param data
 */
export function setAuthState (state, data) {
  state.isAuthenticated = data.isAuthenticated
  state.isReady = data.isReady
  state.uid = data.uid
}
