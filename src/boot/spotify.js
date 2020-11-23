import SpotifyWebApi from "spotify-web-api-node";

export default ({Vue}) => {
  Vue.prototype.$spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CONFIG.CLIENT_ID,
    redirectUri: process.env.SPOTIFY_CONFIG.REDIRECT_URI
  })
}
