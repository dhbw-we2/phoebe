import spotifyService from "../services/spotify"
import firebaseService from '../services/firebase'

export default ({Vue}) => {
  spotifyService.SpotifyInit()

  firebaseService.auth().onAuthStateChanged((currentUser) => {
    spotifyService.handleOnAuthStateChanged(currentUser)
  })

  Vue.prototype.$spotify = spotifyService
}
