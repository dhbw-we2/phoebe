import SpotifyWebApi from "spotify-web-api-node";


const _spotify = new SpotifyWebApi()

export const SpotifyInit = () => {
  _spotify.setCredentials({
    clientId: process.env.SPOTIFY_CONFIG.CLIENT_ID,
    redirectUri: process.env.SPOTIFY_CONFIG.REDIRECT_URI,
  })
}

export const self = () => {
  return _spotify
}

export const searchTracks = (query, types, options, callback) => {
  return _spotify.search(query, types, options, callback)

}

export const setAccessToken = (accessToken) => {
  return _spotify.setAccessToken(accessToken)
}

export const setRefreshToken = (accessToken) => {
  return _spotify.setRefreshToken(accessToken)
}

export const getMe = () => {
  return _spotify.getMe()
}



/*

let isSecondFallback = false

export const fallbackAuth = () => {
  if (!isSecondFallback)  {
    SpotifyWebApi.prototype.resetAccessToken();
    isSecondFallback = true;
  } else {
    isSecondFallback = false;
  }
  return isSecondFallback
}
}

*/
