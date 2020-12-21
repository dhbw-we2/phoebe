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
                        @click="showPhotoUpload()"/>
              <q-avatar v-else class="q-mb-sm shadow-5 profile-picture" size="180px"
                        @click="showPhotoUpload()">
                <q-img :src="currentUser.profilePicture"/>
              </q-avatar>
              <span class="cursor-pointer text-caption"
                    @click="showPhotoUpload()">
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
                           v-if="!spotifyAuth">
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
      <q-dialog v-model="photoUpload" transition-hide="scale" transition-show="scale">
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

export default {
  name: 'UserProfile',
  mixins: [QUploaderBase],
  components: {
    'fbq-uploader': () => import('components/profile/FBQUploader.vue')
  },
  data() {
    return {
      photoType: 'profile',
      photoUpload: false,
      spotifyUsername: '',
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'spotifyAuth']),
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
    ...mapActions('user', ['updateUserData', 'unlinkSpotify']),
    /**
     * Convenience function to get user attributes
     * @param attr
     * @returns {string}
     */
    getUserData(attr) {
      return (this.currentUser[attr]) ? this.currentUser[attr] : '((EMPTY))'
    },
    /**
     * If the profilePicture field in the DB is empty, null or undefined, it returns true
     * @returns {boolean}
     */
    showDefaultPhoto() {
      return this.currentUser.profilePicture === '' ||
        this.currentUser.profilePicture === null ||
        this.currentUser.profilePicture === undefined
    },
    /**
     * Opens the upload dialog
     */
    showPhotoUpload() {
      this.photoUpload = true
    },
    uploadComplete() {
      this.photoUpload = false
      this.$q.notify({
        type: 'positive',
        message: 'Successfully uploaded your profile picture'
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
        type: 'negative',
        message: message
      })
    },
    /**
     * Links Spotify Account using PKCE Authentication
     */
    linkSpotifyAccount() {
      const pkceChallenge = require('pkce-challenge')
      const challenge = pkceChallenge(128)
      const scope = 'user-read-private';

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
          this.updateSpotifyUsername()
        }
      }, 300);
    },
    /**
     * Unlinks spotify account from user and removes entry in DB
     * @returns {Promise<void>}
     */
    async unlinkSpotifyAccount() {
      try {
        await this.unlinkSpotify()
        this.spotifyUsername = ''
      } catch (err) {
        console.error(err)
        this.$q.notify({
          message: `Failed to unlink your Spotify account!`,
          color: 'negative'
        })
      }
    },
    /**
     * Updates Spotify user name from API
     */
    updateSpotifyUsername() {
      if (this.spotifyAuth) {
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
