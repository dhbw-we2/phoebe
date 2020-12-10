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
  return ensureTokenValidAndCall(_spotify.search, query, types, options, callback)
}

export const setAccessToken = (accessToken) => {
  return _spotify.setAccessToken(accessToken)
}

export const setRefreshToken = (accessToken) => {
  return _spotify.setRefreshToken(accessToken)
}

export const getMe = async () => {
  await ensureTokenIsRefreshed(store)
  return ensureTokenValidAndCall(_spotify.getMe)
}

export const getTrack = async (trackID) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getTrack, trackID)
  return buildTrackItem(apiResponse.body)
}

export const getTracks = async (trackIDs) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getTracks, trackIDs)
  const trackItems = []
  apiResponse.body.tracks.forEach(apiTrack => {
    trackItems.push(buildTrackItem(apiTrack))
  })
  return trackItems
}

export const getAlbum = async (albumID) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getAlbum, albumID)
  return buildAlbumItem(apiResponse.body)
}

export const getAlbums = async (albumIDs) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getAlbums, albumIDs)
  const albumItems = []
  apiResponse.body.albums.forEach(apiAlbum => {
    albumItems.push(buildAlbumItem(apiAlbum))
  })
  return albumItems
}

/**
 * Converts a track object from the api into one that only contains relevant information
 * @param apiTrack
 * @returns {{coverURL: *, artist: *, name: *, id: *, url: {mutations: {setTokenReady?}, state: {tokenReady: boolean}, getters: {}, actions: {}, namespaced: boolean}}}
 */
const buildTrackItem = (apiTrack) => {
  const artists = apiTrack.artists.map(a => a.name)
  return {
    type: 'track',
    id: apiTrack.id,
    name: apiTrack.name,
    artist: artists.join(', '),
    coverURL: apiTrack.album.images[1].url,
    url: apiTrack.external_urls.spotify
  }
}

/**
 * Converts a album object from the api into one that only contains relevant information
 * @param apiAlbum
 * @returns {{coverURL: *, artist: *, name: *, id: *, url: {mutations: {setTokenReady?}, state: {tokenReady: boolean}, getters: {}, actions: {}, namespaced: boolean}}}
 */
const buildAlbumItem = (apiAlbum) => {
  const artists = apiAlbum.artists.map(a => a.name)
  return {
    type: 'album',
    id: apiAlbum.id,
    name: apiAlbum.name,
    artist: artists.join(', '),
    coverURL: apiAlbum.images[1].url,
    url: apiAlbum.external_urls.spotify
  }
}
/**
 * Calls library function and retry on fail after waiting for token refresh
 * @param apiFunction
 * @param args
 * @returns {Promise<*>}
 */
const ensureTokenValidAndCall = async (apiFunction, ...args) => {
  try {
    return await apiFunction.call(_spotify, ...args)
  } catch {
    await ensureTokenIsRefreshed(store)
    return await apiFunction.call(_spotify, ...args)
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
    // Save access token to spotify api library object //
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
