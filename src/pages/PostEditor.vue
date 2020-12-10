<template>
  <q-page class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat>
      <q-card-section>
        <div class="text-h4">{{ getTitle }}</div>
      </q-card-section>
      <q-separator inset="true"/>
      <q-card-section>
        <div class="q-gutter-md">
          <q-input filled dark class=""
                   v-model="captionInput"
                   placeholder="Catchy Caption">
            <template v-slot:prepend>
              <q-icon name="eva-edit-outline"/>
            </template>
          </q-input>
          <tag-creator-bar :tags.sync="tags"
                           placeholder="Add Tags">
          </tag-creator-bar>
        </div>
      </q-card-section>
      <q-separator inset="true"/>
      <q-card-section>
        <spotify-search-bar @add-item="addSpotifyItem"/>
      </q-card-section>
      <q-card-section v-if="spotifyItemId" class="q-pt-none">
        <spotify-item-display :spotify-item="spotifyItemData"/>
      </q-card-section>
      <q-separator inset="true"/>
      <q-card-section>
        <text-editor
          placeholderText="Very interesting Post"
          :text-input.sync="textInput">
        </text-editor>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          padding="sm"
          unelevated rounded
          icon-right="eva-close-outline"
          color=negative
          label="close"
          @click="$router.go(-1)"
        />
        <q-btn
          padding="sm"
          unelevated rounded
          ref="submitBtn"
          icon-right="eva-checkmark-outline"
          color=positive
          label="submit"
          @click="submitPost"
          :loading="postSubmitted"
        />
      </q-card-actions>
    </q-card>

    <post-view preview
               :caption="sanitizedCaption"
               :date="date"
               :text="sanitizedText"
               :user="currentUser"
               :tags="tags"
               :initial-score="post ? post.score : 0"
               :spotify-item="spotifyItemData"
               :has-spotify-item="!!spotifyItemId">
    </post-view>
  </q-page>
</template>
<script>

import {mapGetters} from "vuex";
import TextEditor from "components/forum/TextEditor"
import PostView from "components/forum/posts/PostView";
import TagCreatorBar from "components/forum/TagCreatorBar"
import SpotifySearchBar from "components/forum/SpotifySearchBar"
import {postCollection} from "src/services/firebase/db";
import {firestore} from "firebase/app";
import SpotifyItemDisplay from "components/forum/SpotifyItemDisplay";

export default {
  components: {SpotifyItemDisplay, TextEditor, PostView, TagCreatorBar, SpotifySearchBar},
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    /**
     * Returns
     * @returns {string}
     */
    getTitle() {
      return this.isEdit ? 'Edit Post' : 'New Post'
    },
    /**
     *
     * @returns {boolean}
     */
    isEdit() {
      return this.$route.name === 'editPost'
    },
    /**
     *
     * @returns {string}
     */
    postID() {
      return this.$route.params.id
    },
    /**
     *
     * @returns {string}
     */
    sanitizedCaption() {
      return this.captionInput.trim()
    },
    /**
     *
     * @returns {string}
     */
    sanitizedText() {
      return this.textInput.replace(/&nbsp;/g, '').trim()
    }
  },
  /**
   *
   * @returns tagInput: string
   * @returns date: number
   * @returns textInput: string
   * @returns title: string
   * @returns postSubmitted: boolean
   * @returns captionInput: string
   * @returns tags: []
   */
  data() {
    return {
      title: 'Create a Post',
      captionInput: '',
      tagInput: '',
      tags: [],
      textInput: '',
      date: null,
      postSubmitted: false,
      post: null,
      spotifyItemId: null,
      spotifyItemType: null,
      spotifyItemData: null,
    }
  },
  watch: {
    '$route.name'(route) {
      if (route === 'newPost') {
        this.clearInputs()
      }
    },
    async spotifyItemId() {
      switch (this.spotifyItemType) {
        case 'track':
          this.spotifyItemData = await this.$spotify.getTrack(this.spotifyItemId)
          break;
        case 'album':
          this.spotifyItemData = await this.$spotify.getAlbum(this.spotifyItemId)
          break;
      }
    }
  },
  methods: {
    /**
     * This function gets triggered by click on Item in SpotifySearchPreview
     * Sets item type and id for database and creates a Notification
     * @Input: id
     * @Input: type
     */
    addSpotifyItem({id, type}) {
      this.spotifyItemType = type
      this.spotifyItemId = id
    },

    /**
     * Adds Tag to the Tag-Array if the input field is not empty
     */
    addTagFkt() {
      if (this.tagInput !== '') {
        const size = this.tags.length;
        this.tags[size] = this.tagInput;
        this.tagInput = '';
      }
    },
    /**
     *
     */
    submitPost() {
      if (this.tags.length === 0 || !this.sanitizedCaption || !this.sanitizedText.replace(/<\/?[^>]+(>|$)/g, "")) {
        this.$q.notify({
          message: 'Not all fields have been filled out',
          type: 'negative'
        })
        return
      }
      this.postSubmitted = true;
      if (this.isEdit) {
        //Edit existing post
        postCollection().doc(this.postID).update({
          caption: this.sanitizedCaption,
          tags: this.tags,
          text: this.sanitizedText,
          spotifyItemId: this.spotifyItemId,
          spotifyItemType: this.spotifyItemType,
          dateEdited: firestore.FieldValue.serverTimestamp()
        }).then(() => {
          this.$router.go(-1)
        }).catch(err => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: `Failed to submit edited post!`
          })
          this.postSubmitted = false
        })
      } else {
        //Submit new post
        postCollection().add({
          caption: this.sanitizedCaption,
          tags: this.tags,
          text: this.sanitizedText,
          spotifyItemId: this.spotifyItemId,
          spotifyItemType: this.spotifyItemType,
          date: firestore.FieldValue.serverTimestamp(),
          user: this.currentUserRef,
        }).then(() => {
          this.$router.push({name: 'forum'})
        }).catch(err => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: `Failed to submit post!`
          })
          this.postSubmitted = false
        })
      }
    },
    removeTag(tag) {
      const index = this.tags.findIndex(f => f === tag);
      this.tags.splice(index, 1);
    },
    restoreIfEdit() {
      postCollection().doc(this.postID).get().then(doc => {
        const post = doc.data()
        this.post = post
        this.textInput = post.text
        this.tags = post.tags
        this.captionInput = post.caption
        this.date = post.date
        this.spotifyItemId = post.spotifyItemId
        this.spotifyItemType = post.spotifyItemType
      })
        .catch(err => {
          console.error(err)
          this.$q.notify({
            message: 'Failed to read post!',
            type: 'negative'
          })
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    clearInputs() {
      this.captionInput = ''
      this.tagInput = ''
      this.tags = []
      this.textInput = ''
      this.date = null
      this.spotifyItemId = null
      this.spotifyItemType = null
      this.spotifyItemData = null
      this.post = null
    },
  },
  created() {
    if (this.isEdit) {
      if (this.$route.params.id) {
        this.$q.loading.show()
        this.restoreIfEdit()
      } else {
        this.$router.push({name: 'newPost'})
      }
    }
    this.$changeBackgroundColor('post-editor')
  },
  beforeRouteLeave(to, from, next) {
    //Show warning when leaving partially filled form
    if (!this.postSubmitted && (this.tags.length > 0 || this.sanitizedText || this.sanitizedCaption || this.tagInput) && this.$store.state.auth.isAuthenticated) {
      this.$q.dialog({
        title: 'Unsaved Changes',
        message: 'Do you really want to leave the editor?',
        position: "top",
        cancel: "No",
        ok: 'Yes',
        color: 'primary'
      }).onOk(() => next())
        .onDismiss(() => next(false))
    } else {
      next()
    }
  }
}
</script>
