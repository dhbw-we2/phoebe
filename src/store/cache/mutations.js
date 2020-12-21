import Vue from 'vue'

export function setUserDataCache (state, {index, item}) {
  Vue.set(state.userData, index, item)
}

export function setSpotifyDataCache (state, {index, item}) {
  Vue.set(state.spotifyData, index, item)
}

