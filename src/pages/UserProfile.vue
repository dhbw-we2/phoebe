<template>
  <q-page class="constrain q-pa-md">
    <div>
      <q-card class="my-card">
        <q-card-section>
          <p class="text-center text-h4 no-margin">User Profile</p>
        </q-card-section>
        <q-card-section>
          <q-card-section>
            <div class="column items-center" v-if="showDefaultPhoto()">
              <q-avatar @click="showPhotoUpload('profile')" class="q-mb-sm profile-picture" round="round"
                        color="primary" icon="eva-person-outline" font-size="110px"
                        size="180px" text-color="white"></q-avatar>
              <span><q-icon class="q-mr-sm" color="" name="edit" size="16px"></q-icon>Click to edit</span></div>
            <div class="column items-center" v-else>
              <q-avatar class="q-mb-sm shadow-5 profile-picture" size="180px" @click="showPhotoUpload('profile')">
                <q-img :src="currentUser.profilePicture"></q-img>
              </q-avatar>
              <span class=""><q-icon class="q-mr-sm" color="" name="edit" size="16px"></q-icon>Click to edit</span>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="column items-center">
              <q-list class="col text-center">
                <q-item class="q-mb-sm">
                  <q-item-section>
                    <q-item-label overline>USERNAME</q-item-label>
                    <q-item-label>{{ getUserData('username') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="q-mb-md">
                  <q-item-section>
                    <q-item-label overline>EMAIL</q-item-label>
                    <q-item-label>{{ getUserData('email') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="q-mb-md">
                  <q-item-section>
                    <q-item-label overline>SPOTIFY ACCOUNT</q-item-label>
                    <q-btn @click="linkSpotifyAccount" icon="eva-link-outline" class="q-ma-sm" color="primary"
                           style="max-width: 15rem" label="Link Spotify"
                           v-if="!currentUser.spotifyAccessToken">
                    </q-btn>
                    <template v-else>
                      <q-item-label>{{ spotifyUsername }}</q-item-label>
                      <template class="q-ma-sm">
                        <q-btn @click="unlinkSpotifyAccount" icon="eva-trash-outline" color="negative"
                               style="max-width: 15rem" label="Unlink Spotify"
                               class="q-ma-sm">
                        </q-btn>
                        <q-btn @click="linkSpotifyAccount" icon="eva-link-outline" color="primary"
                               style="max-width: 15rem" label="Re-Link Spotify"
                               class="q-mx-sm">
                        </q-btn>
                      </template>
                    </template>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>
      <q-dialog v-model="photoUpload" transition-hide="scale" transition-show="scale" @before-hide="resetPhotoType">
        <fbq-uploader
          class="q-my-lg"
          label="Please Upload a Photo"
          :meta="meta"
          :prefixPath="prefixPath"
          @uploaded="uploadComplete"
        ></fbq-uploader>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import {QUploaderBase} from 'quasar'
import {currentUser} from "src/store/user/getters";
import querystring from "querystring";
import * as firebase from "firebase/app";

export default {
  name: 'UserProfile',
  mixins: [QUploaderBase],
  components: {
    'fbq-uploader': () => import('components/profile/FBQUploader.vue')
  },
  data() {
    return {
      photoType: '',
      photoUpload: false,
      spotifyUsername: '',
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
    meta() {
      return {
        uid: this.currentUser.uid,
        photoType: this.photoType
      }
    },
    prefixPath() {
      const uid = this.currentUser.uid
      return `${uid}/${this.photoType}Picture/${this.photoType}Picture.`
    }
  },
  methods: {
    ...mapActions('user', ['updateUserData']),
    getUserData(attr) {
      return (this.currentUser[attr]) ? this.currentUser[attr] : '((EMPTY))'
    },
    resetPhotoType() {
      this.photoType = ''
    },
    async saveUserData() {
      const {currentUser, username} = this

      this.$q.loading.show({
        message: 'Updating your data, please stand by...',
      })

      try {
        await this.updateUserData({
          uid: this.currentUser.uid,
          username,
        })
      } catch (err) {
        this.$q.notify({
          message: `Looks like a problem updating your profile: ${err}`,
          color: 'negative'
        })
      } finally {
        this.$q.loading.hide()
      }
    },
    showDefaultPhoto() {
      return this.currentUser.profilePicture === '' ||
        this.currentUser.profilePicture === null ||
        this.currentUser.profilePicture === undefined
    },
    showPhotoUpload(type) {
      this.photoUpload = true
      this.photoType = type
    },
    uploadComplete(info) {
      let fileNames = []
      info.files.forEach(file => fileNames.push(file))
      this.photoUpload = false
      this.$q.notify({
        message: 'Successfully uploaded your profile picture',
        color: 'positive'
      })
    },
    linkSpotifyAccount() {
      const pkceChallenge = require('pkce-challenge')
      const challenge = pkceChallenge(128)
      const scope = 'user-read-private user-read-email';

      const authURL = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CONFIG.CLIENT_ID,
          redirect_uri: process.env.SPOTIFY_CONFIG.REDIRECT_URI,
          scope: scope,
          code_challenge_method: 'S256',
          code_challenge: challenge.code_challenge
        })

      //Set temporary global variable
      window.pkce_challenge_verifier = challenge.code_verifier
      //Open new window for authorization
      const width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);
      const w = window.open(authURL, 'Spotify API Authentication', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
      //Check if window was closed
      const timer = setInterval(() => {
        if (w.closed) {
          clearInterval(timer);
          //Clear temporary global variable
          delete (window.pkce_challenge_verifier)
          this.updateSpotifyUsername()
        }
      }, 300);
    },
    async unlinkSpotifyAccount() {
      try {
        await this.updateUserData({
          uid: this.currentUser.uid,
          spotifyAccessToken: firebase.firestore.FieldValue.delete(),
          spotifyRefreshToken: firebase.firestore.FieldValue.delete(),
        })
      } catch (err) {
        this.$q.notify({
          message: `Failed to unlink your Spotify account! ${err}`,
          color: 'negative'
        })
      } finally {
        this.spotifyUsername = ''
      }
    },
    updateSpotifyUsername() {
      if (this.currentUser.spotifyAccessToken) {
        this.$spotify.setAccessToken(this.currentUser.spotifyAccessToken)
        this.$spotify.setRefreshToken(this.currentUser.spotifyRefreshToken)
        this.$spotify.getMe().then((data) => {
          this.spotifyUsername = data.body.display_name
        })
      }
    },
  },
  created() {
    this.updateSpotifyUsername()
  }
}
</script>
<style lang="stylus">
.profile-picture
  cursor pointer
</style>
