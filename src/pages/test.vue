<template>
  <q-page>
    <q-item-label overline>SPOTIFY ACCOUNT</q-item-label>
    <q-btn @click="getAuth()" icon="eva-link-outline" class="flex-center q-ma-sm" color="primary" style="max-width: 15rem" label="Link Spotify"></q-btn>
    <q-btn @click="auth()" label="RefreshToken" class="flex-center q-ma-sm"></q-btn>
    <q-btn @click="getMe()" label="GET ME" class="flex-center q-ma-sm"></q-btn>
  </q-page>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {mapActions} from "vuex";
import SpotifyWebApi from "spotify-web-api-node";

Vue.use(VueAxios, axios)

export default {
  data() {
    return {
      access_token: '',
      refresh_token: '',
    }
  },
  methods: {
    auth() {
      const scopes = ['user-read-private', 'user-read-email'],
      redirectUri = 'http://localhost:8080/#/callback',
      clientId = '2169dc1e116440768044f7101e7ccc7d',
      state = '';

      // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
      const spotifyApi = new SpotifyWebApi({
        redirectUri: redirectUri,
        clientId: clientId
      });

      // Create the authorization URL
      const authorizeURL = spotifyApi.createAuthorizeURL()
      console.log(authorizeURL);
    },


    login(callback) {

      const CLIENT_ID = '2169dc1e116440768044f7101e7ccc7d';
      const REDIRECT_URI = 'http://localhost:8080/#/callback/';

      function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&scope=' + encodeURIComponent(scopes.join(' ')) +
          '&response_type=token';
      }

      const url = getLoginURL([
        'user-read-email'
      ]);

      const width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

      window.addEventListener("message", function (event) {
        const hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
          callback(hash.access_token);
        }
      }, false);

      const w = window.open(url, 'Spotify', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);

    },

    getUserData(accessToken) {
      axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(function(response) {
        console.log(response);
      })
    },

    getAuth() {

      this.login(function(accessToken) {
        this.getUserData(accessToken)
          .then(function(response) {
            console.log(response);
            this.display = true;
          });
      });
    }

  }
}
</script>

<style scoped>

</style>
