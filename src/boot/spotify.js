import spotifyService from "../services/spotify";

export default async ({Vue}) => {
  spotifyService.SpotifyInit()


  Vue.prototype.$spotify = spotifyService
}
