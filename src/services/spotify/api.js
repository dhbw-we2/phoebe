import SpotifyWebApi from "spotify-web-api-node";
import querystring from "querystring";
import axios from 'axios'
import {store} from "src/store"
import {ensureAccessCodeIsValid} from "src/services/spotify/base";

const _spotify = new SpotifyWebApi()

/**
 * Initializes the library object with credentials from the secret quasar.env config file
 */
export const SpotifyInit = () => {
  _spotify.setCredentials({
    clientId: process.env.SPOTIFY_CONFIG.CLIENT_ID,
    redirectUri: process.env.SPOTIFY_CONFIG.REDIRECT_URI,
  })
}

export const self = () => {
  return _spotify
}

/**
 * Implements the spotify search function with parameters and redirects if an error occurs
 * Search function from https://github.com/thelinmichael/spotify-web-api-node
 * @param query
 * @param types
 * @param options
 * @param callback
 * @returns {Promise<*>}
 */
export const search = (query, types, options, callback) => {
  return ensureTokenValidAndCall(_spotify.search, query, types, options, callback)
}

/**
 * Implements function "setAccessToken()" from https://github.com/thelinmichael/spotify-web-api-node
 * @param accessToken
 * @returns {*}
 */
export const setAccessToken = (accessToken) => {
  return _spotify.setAccessToken(accessToken)
}

/**
 * Implements "setRefreshToken()" from https://github.com/thelinmichael/spotify-web-api-node
 * @param accessToken
 * @returns {*}
 */
export const setRefreshToken = (accessToken) => {
  return _spotify.setRefreshToken(accessToken)
}

/**
 * Implements the "getMe()" function and handles if and error occurs
 * function from https://github.com/thelinmichael/spotify-web-api-node
 * @returns {Promise<*>}
 */
export const getMe = async () => {
  await ensureAccessCodeIsValid(store)
  return ensureTokenValidAndCall(_spotify.getMe)
}

/**
 * Implements the "getTrack()" function with a specific trackID
 * from https://github.com/thelinmichael/spotify-web-api-node
 * @param trackID
 * @returns {Promise<{coverURL: *, artist: *, name: *, id: *, url: {mutations: {setTokenReady?}, state: {tokenReady: boolean}, getters: {}, actions: {}, namespaced: boolean}}>}
 */
export const getTrack = async (trackID) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getTrack, trackID)
  return buildTrackItem(apiResponse.body)
}

/**
 * Implements the "getTracks()" function
 * from https://github.com/thelinmichael/spotify-web-api-node
 * @param trackIDs
 * @returns {Promise<[]>}
 */
export const getTracks = async (trackIDs) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getTracks, trackIDs)
  const trackItems = []
  apiResponse.body.tracks.forEach(apiTrack => {
    trackItems.push(buildTrackItem(apiTrack))
  })
  return trackItems
}

/**
 * Implements the "getAlbum()" function with a specific albumID
 * from https://github.com/thelinmichael/spotify-web-api-node
 * @param albumID
 * @returns {Promise<{coverURL: *, artist: *, name: *, id: *, url: {mutations: {setTokenReady?}, state: {tokenReady: boolean}, getters: {}, actions: {}, namespaced: boolean}}>}
 */
export const getAlbum = async (albumID) => {
  const apiResponse = await ensureTokenValidAndCall(_spotify.getAlbum, albumID)
  return buildAlbumItem(apiResponse.body)
}

/**
 * Implements the "getAlbums()" function
 * from https://github.com/thelinmichael/spotify-web-api-node
 * @param albumIDs
 * @returns {Promise<[]>}
 */
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
 * @returns {{coverURL, artist: *, name, id, type: string, url: *}}
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
 * @returns {{coverURL, artist: *, name, id, type: string, url: *}}
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
  setAccessToken(store.state.user.spotifyAuth.accessToken)
  try {
    return await apiFunction.call(_spotify, ...args)
  } catch {
    await ensureAccessCodeIsValid(store)
    return await apiFunction.call(_spotify, ...args)
  }
}

/**
 * Refreshes Access Token
 * @param refreshToken {String}
 * @returns HTTP Response Data {Object}
 */
export const refreshAccessToken = async (refreshToken) => {
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
}
