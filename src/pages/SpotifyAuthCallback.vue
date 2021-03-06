<template>
  <h5 v-html="result" class="text-center"></h5>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import querystring from "querystring";

export default {
  name: 'SpotifyAuthCallback',
  data() {
    return {
      result: 'Loading...'
    }
  },
  computed: {
    ...mapGetters('user', ['currentUserRef'])
  },
  methods: {
    ...mapActions('user', ['updateUserData']),
    /**
     * Request a Spotify access and refresh token for access to commands
     */
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
      }).then(async response =>  {
        try {
          await this.$spotify.saveSpotifyAuthData(response.data)
          this.result = 'Success! You can close this window now.'
          window.close()
        } catch (err) {
          console.error(err);
          this.result = err
        }
      }).catch(err => {
        console.error(err.response);
        this.result = 'Something went wrong.'
      }).finally(() => {
        //Clear temporary global variable
        delete (window.opener.pkce_challenge_verifier)
      })
    },
  },
  /**
   * Checks if page was redirected from the Spotify API callback and prints error messages
   */
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
