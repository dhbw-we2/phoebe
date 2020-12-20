<template>
  <q-page class="constrain q-pa-md">
    <div>
      <q-card flat class="my-card">
        <q-card-section>
          <p class="text-center text-h4 no-margin">User Profile</p>
        </q-card-section>
        <q-card-section>
          <q-card-section>
            <div class="column items-center">
              <q-avatar v-if="showDefaultPhoto()" class="q-mb-sm profile-picture" size="180px"
                        round="round" color="primary" icon="eva-person-outline" font-size="110px" text-color="white"
                        @click="showPhotoUpload('profile')"/>
              <q-avatar v-else class="q-mb-sm shadow-5 profile-picture" size="180px"
                        @click="showPhotoUpload('profile')">
                <q-img :src="currentUser.profilePicture"/>
              </q-avatar>
              <span class="cursor-pointer text-caption"
                    @click="showPhotoUpload('profile')">
                  Click to edit
                  <q-icon name="eva-edit-outline"/>
              </span>
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
          label="Upload a Picture (max. 200 KiB)"
          :meta="meta"
          :prefixPath="prefixPath"
          @uploaded="uploadComplete"
          accept="image/*"
          @rejected="imageRejected"
          max-file-size="204800"
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
    /**
     * If a user exists in the db, his info can be displayed
     * @param attr
     * @returns {string}
     */
    getUserData(attr) {
      return (this.currentUser[attr]) ? this.currentUser[attr] : '((EMPTY))'
    },
    /**
     * Sets photoType to zero
     */
    resetPhotoType() {
      this.photoType = ''
    },
    /**
     * If the profilePicture field in the db is empty, null or undefined, it returns true
     * @returns {boolean}
     */
    showDefaultPhoto() {
      return this.currentUser.profilePicture === '' ||
        this.currentUser.profilePicture === null ||
        this.currentUser.profilePicture === undefined
    },
    /**
     * Opens the dialog to finally upload and sets photoType for the FBQUploader
     * @param type
     */
    showPhotoUpload(type) {
      this.photoUpload = true
      this.photoType = type
    },
    /**
     * Closes dialog to upload and creates notification
     */
    uploadComplete() {
      this.photoUpload = false
      this.$q.notify({
        message: 'Successfully uploaded your profile picture',
        color: 'positive'
      })
    },
    /**
     * Creates upload failure notification
     * @param rejectedEntries
     */
    imageRejected(rejectedEntries) {
      let message = 'Something went wrong'
      switch (rejectedEntries[0].failedPropValidation) {
        case('max-file-size'):
          message = 'File size too large!'
          break
        case('accept'):
          message = 'Please choose an image file!'
          break
      }
      this.$q.notify({
        message: message,
        color: 'negative'
      })
    },
    /**
     * Links Spotify Account using PKCE Authentication
     */
    linkSpotifyAccount() {
      const pkceChallenge = require('pkce-challenge')
      const challenge = pkceChallenge(128)
      const scope = 'user-read-private user-read-email';

      //creates authentication URL
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
      const timer = setInterval(async () => {
        if (w.closed) {
          clearInterval(timer);
          //Clear temporary global variable
          delete (window.pkce_challenge_verifier)
          await this.$store.commit('spotify/setTokenReady', true)
          this.$spotify.setAccessToken(this.currentUser.spotifyAccessToken)
          this.updateSpotifyUsername()
        }
      }, 300);
    },
    /**
     * Unlinks spotify accound from user entry in db
     * @returns {Promise<void>}
     */
    async unlinkSpotifyAccount() {
      try {
        await this.updateUserData({
          uid: this.currentUser.uid,
          spotifyAccessToken: firebase.firestore.FieldValue.delete(),
          spotifyRefreshToken: firebase.firestore.FieldValue.delete(),
        })
      } catch (err) {
        console.error(err)
        this.$q.notify({
          message: `Failed to unlink your Spotify account!`,
          color: 'negative'
        })
      } finally {
        this.spotifyUsername = ''
      }
    },
    /**
     * Updates Spotify user name
     * Is called when refreshToken is set again
     */
    updateSpotifyUsername() {
      if (this.currentUser.spotifyAccessToken) {
        this.$spotify.getMe().then((data) => {
          this.spotifyUsername = data.body.display_name
        })
      }
    },
  },
  created() {
    this.$changeBackgroundColor('user-profile')
    this.updateSpotifyUsername()
  }
}
</script>
<style lang="stylus">
.profile-picture
  cursor pointer
</style>
