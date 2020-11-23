<template>
  <h5 v-html="result" class="text-center"></h5>
</template>

<script>
import {mapActions} from "vuex";
import querystring from "querystring";

export default {
  name: 'SpotifyAuthCallback',
  data() {
    return {
      result: 'Loading...'
    }
  },
  methods: {
    ...mapActions('user', ['updateUserData']),
    async requestToken() {
      await this.$axios({
        method: 'post',
        url: `https://accounts.spotify.com/api/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
          grant_type: "authorization_code",
          code: this.$route.query.code,
          redirect_uri: process.env.SPOTIFY_CONFIG.REDIRECT_URI,
          client_id: process.env.SPOTIFY_CONFIG.CLIENT_ID,
          code_verifier: window.opener.pkce_challenge_verifier
        }),
      }).then(response => {
        this.saveToken(response.data)
      }).catch(err => {
        console.error(err.response);
        this.result = 'Something went wrong.'
      }).finally(() => {
        //Clear temporary global variable
        delete (window.opener.pkce_challenge_verifier)
      })
    },
    async saveToken(data) {
      const userData = {
        uid: this.$store.state.auth.uid,
        spotifyAccessToken: data.access_token,
        spotifyRefreshToken: data.refresh_token
      }
      try {
        await this.updateUserData(userData)
        this.result = 'Success! You can close this window now.'
        window.close()
      } catch (err) {
        this.result = err
      }
    }
  },
  created() {
    if (this.$route.query.code) {
      this.requestToken()
    } else if (this.$route.query.error) {
      switch (this.$route.query.error) {
        case('access_denied'):
          this.result = 'Access denied! Please try again.'
          break;
        default:
          this.result = this.$route.query.error
      }
    } else {
      this.result = 'Something went wrong...'
    }
  }
}
</script>
