<template>
  <q-page>
    <q-item-label overline>SPOTIFY ACCOUNT</q-item-label>
    <q-btn @click="Spotify()" icon="eva-link-outline" class="flex-center q-ma-sm" color="primary" style="max-width: 15rem" label="Link Spotify"></q-btn>
    <q-btn @click="refreshToken()" label="RefreshToken" class="flex-center q-ma-sm"></q-btn>
    <q-btn @click="getMe()" label="GET ME" class="flex-center q-ma-sm"></q-btn>
  </q-page>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {mapActions} from "vuex";

Vue.use(VueAxios, axios)

export default {
  data() {
    return {
      access_token: '',
      refresh_token: '',
    }
  },
  methods: {
    ...mapActions('spotify',[]),





    getHashParams() {
      const hashParams = {};
      let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1)
      while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2])
      }
      return hashParams
    },
    async getMe() {
      try {
        const { data } = await this.$http.patch(
          'https://api.spotify.com/v1/me',
          {
            headers: {'Authorization': 'Bearer ' + this.access_token},
          }
        )
      } catch (e) {
        console.log(e)
      } finally {

      }
    },
    async refreshToken() {
      try {
        const { data } = await this.$http.patch(
          '/refresh_token',
          {
            data: {'refresh_token': this.refresh_token}
          }
        )
      } catch (e) {
        console.log(e)
      } finally {

      }
    },

    Spotify() {
      const params = this.getHashParams();

      const access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

      if (error) {
        alert('There was an error during the authentication');
      } else {
        if (access_token) {
          // render oauth info
          this.access_token = access_token
          this.refresh_token = refresh_token

        } else {
          // render initial screen
        }
      }
      this.getMe()
      this.refreshToken()
    }
  }
}
</script>

<style scoped>

</style>
