export default class User {
  /**
   * Create a user.
   * @param {String} uid - Place holder for a unique Firebase id.
   * @param {String} email - A valid email.
   * @param {String} username - The user's given username.
   * @param {String} profilePicture - A generated URL from Google Storage.
   * @param {String} spotifyToken - A generated token connected to the users Spotify Account
   */
  uid = ''
  email = ''
  username = ''
  profilePicture = ''
  spotifyAccessToken = ''
  spotifyRefreshToken = ''
  subscribedTags = []

  /**
   * @param  {Object} args - User arguments supplied during
   * user creation
   */
  constructor (args) {
    Object.keys(args).forEach((v) => {
      this[v] = args[v]
    })

    return {
      ...this
    }
  }
}
