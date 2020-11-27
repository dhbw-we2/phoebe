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



export const searchTracks = async (query, types, options, callback) => {
  return await _spotify.search(query, types, options, callback)

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
