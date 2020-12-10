import SpotifyWebApi from "spotify-web-api-node";
import querystring from "querystring";
import axios from 'axios'
import {Notify} from 'quasar'

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

export const getTracks = (trackIDs) => {
  return _spotify.getTracks(trackIDs)
}

export const getAlbums = (albumIDs) => {
  return _spotify.getAlbums(albumIDs)
}

/**
 * Refreshes Access Token
 * @param refreshToken {String}
 * @returns access Token {String}
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const res = await axios({
      method: 'post',
      url: `https://accounts.spotify.com/api/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CONFIG.CLIENT_ID,
      }),
    })
    return res.data
  } catch(err) {
    Notify.create({
      type: 'negative',
      message: 'Please reconnect your Spotify Account!'
    })
  }
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
