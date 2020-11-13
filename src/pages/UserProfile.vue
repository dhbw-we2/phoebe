<template>
  <q-page class="constrain q-pa-md">
    <div v-if="currentUser">
      <q-card class="my-card">
        <q-card-section>
          <p class="text-center text-h4 no-margin">User Profile</p>
        </q-card-section>
        <q-card-section>
          <q-card-section>
            <div class="column items-center" v-if="showDefaultPhoto()">
              <q-avatar  @click="showPhotoUpload('profile')" class="q-mb-sm profile-picture" round="round" color="primary" icon="eva-person-outline" font-size="110px"
                        size="180px" text-color="white"></q-avatar>
              <span><q-icon class="q-mr-sm" color="" name="edit" size="16px"></q-icon>Click to edit</span></div>
            <div class="column items-center" v-else>
              <q-avatar class="q-mb-sm shadow-5 profile-picture" size="180px" @click="showPhotoUpload('profile')">
                <q-img :src="currentUser.profilePicture"></q-img>
              </q-avatar>
              <span class=""><q-icon class="q-mr-sm" color="" name="edit" size="16px"></q-icon>Click to edit</span>
            </div>
          </q-card-section>
          <q-card-section >
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
                    <q-btn @click="spotify" icon="eva-link-outline" class="q-ma-sm" color="primary" style="max-width: 15rem" label="Link Spotify">
                    </q-btn>
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

export default {
  name: 'UserProfile',
  mixins: [QUploaderBase],
  components: {
    'fbq-uploader': () => import('src/components/FBQUploader.vue')
  },
  data() {
    return {
      photoType: '',
      photoUpload: false,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
    meta() {
      return {
        id: this.currentUser.id,
        photoType: this.photoType
      }
    },
    prefixPath() {
      const id = this.currentUser.id,
        path = `${id}/${this.photoType}Picture/${this.photoType}Picture.`
      return path
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
      const {currentUser, username, spotifyToken} = this

      this.$q.loading.show({
        message: 'Updating your data, please stand by...',
      })

      try {
        await this.updateUserData({
          id: currentUser.uid,
          username,
          spotifyToken
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
        message: `Successfully uploaded your photo: ${fileNames}`,
        color: 'positive'
      })
    },
  },
}
</script>
<style lang="stylus">
.profile-picture
  cursor pointer
</style>
