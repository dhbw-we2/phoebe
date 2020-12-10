import SpotifyWebApi from "spotify-web-api-node";
import querystring from "querystring";
import axios from 'axios'
import {Notify} from 'quasar'
import {store} from "src/store"
import {ensureTokenIsRefreshed} from "src/services/spotify/base";

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
  return ensureTokenValidAndCall(_spotify.search(query, types, options, callback))
}

export const setAccessToken = (accessToken) => {
  return _spotify.setAccessToken(accessToken)
}

export const setRefreshToken = (accessToken) => {
  return _spotify.setRefreshToken(accessToken)
}

export const getMe = async () => {
  await ensureTokenIsRefreshed(store)
  return ensureTokenValidAndCall(_spotify.getMe())
}

export const getTracks =  (trackIDs) => {
  return ensureTokenValidAndCall(_spotify.getTracks(trackIDs))
}

export const getAlbums = (albumIDs) => {
  return ensureTokenValidAndCall(_spotify.getAlbums(albumIDs))
}

/**
 * Calls library function and retry on fail after waiting for token refresh
 * @param apiCall
 * @returns {Promise<*>}
 */
const ensureTokenValidAndCall = async (apiCall) => {
  try {
    return await apiCall
  } catch {
    await ensureTokenIsRefreshed(store)
    return await apiCall
  }
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
    _spotify.setAccessToken(res.data.access_token)
    return res.data
  } catch (err) {
    if (err.response.status === 400) {
      Notify.create({
        type: 'negative',
        message: 'Please reconnect your Spotify Account!'
      })
    } else {
      console.error(err)
    }
  }
}
