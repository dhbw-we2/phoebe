<template>
  <q-page>
    <q-item-label overline>SPOTIFY ACCOUNT</q-item-label>
    <q-btn @click="spotify()" icon="eva-link-outline" class="flex-center q-ma-sm" color="primary"
           style="max-width: 15rem" label="Link Spotify"></q-btn>
    <q-btn @click="refreshToken()" label="RefreshToken" class="flex-center q-ma-sm"></q-btn>
    <q-btn @click="getMe()" label="GET ME" class="flex-center q-ma-sm"></q-btn>
  </q-page>
</template>

<script>
import * as querystring from "querystring";
import {mapGetters} from "vuex";

export default {
  data() {
    return {
      access_token: '',
      refresh_token: '',
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  methods: {
    spotify() {
      const client_id = process.env.SPOTIFY_CONFIG.CLIENT_ID; // Your client id
      const redirect_uri = process.env.SPOTIFY_CONFIG.REDIRECT_URI; // Your redirect uri
      const scope = 'user-read-private user-read-email';

      const pkceChallenge = require('pkce-challenge')
      const challenge = pkceChallenge(128)

      const authURL = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          redirect_uri: redirect_uri,
          scope: scope,
          code_challenge_method: 'S256',
          code_challenge: challenge.code_challenge
        })
      this.$store.commit('spotify/setPKCEChallengeVerifier', challenge.code_verifier)
      window.pkce_challenge_verifier = challenge.code_verifier

      const width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

      const w = window.open(authURL, 'Spotify API Authentication', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
      const timer = setInterval(function() {
        if(w.closed) {
          clearInterval(timer);
          //Clear temporary global variable
          delete (this.window.pkce_challenge_verifier)
        }
      }, 300);
    }
  }
}
</script>

<style scoped>

</style>
