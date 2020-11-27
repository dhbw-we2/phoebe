import spotifyService from "../services/spotify";

export default ({Vue}) => {
  spotifyService.SpotifyInit()

  Vue.prototype.$spotify = spotifyService
}
