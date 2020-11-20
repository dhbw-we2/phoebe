const functions = require('firebase-functions');
const SpotifyWebApi = require('spotify-web-api-node');

const scopes = ['user-read-private', 'user-read-email'],
  redirectUri = 'http://localhost:8080/#/callback',
  clientId = '2169dc1e116440768044f7101e7ccc7d',
  state = '';

/*exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});*/

exports.SpotifyAuth = functions.https.onRequest((request, response ) => {
  const spotifyWebApi = new SpotifyWebApi({
    client_id: clientId,
    redirect_uri: redirectUri
  })
  const token = spotifyWebApi.getAccessToken(scopes)
  console.log(token)
  response.send(token.toString())
})
