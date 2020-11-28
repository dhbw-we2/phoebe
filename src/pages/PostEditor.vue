<template>
  <div class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat>
      <q-card-section>
        <div class="text-h4">{{ getTitle }}</div>
      </q-card-section>
      <q-separator inset="true"/>
      <q-card-section>
        <div class="q-pa-md q-gutter-md">
          <q-input filled dark v-model="captionInput" placeholder="Catchy Caption">
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
        <spotify-search-bar class="q-pa-md"/>
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
          unelevated rounded
          icon-right="eva-close-outline"
          color=negative
          label="close"
          to="/"
        />
        <q-btn
          unelevated rounded
          ref="submitBtn"
          icon-right="eva-checkmark-outline"
          color=positive
          label="submit"
          @click="submitPost"
          :disable="postSubmitted"
        />
      </q-card-actions>
    </q-card>

    <PostView disabled
              :caption="sanitizedCaption"
              :date="date"
              :text="sanitizedText"
              :user-ref="currentUserRef"
              :tags="tags"
              preview>
    </PostView>

  </div>
</template>
<script>

import {mapGetters} from "vuex";
import TextEditor from "components/forum/TextEditor"
import PostView from "components/forum/posts/PostView";
import TagCreatorBar from "components/forum/TagCreatorBar"
import SpotifySearchBar from "components/forum/SpotifySearchBar"
import {postCollection} from "src/services/firebase/db";

export default {
  components: {TextEditor, PostView, TagCreatorBar, SpotifySearchBar},
  computed: {
    ...mapGetters('user', ['currentUserRef']),
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
  watch: {
    /**
     *
     * @param route
     */
    '$route.name'(route) {
      if (route === 'newPost') {
        this.clearInputs()
      }
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
      date: new Date().getTime(),
      postSubmitted: false,
    }
  },
  methods: {
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
          dateEdited: new Date().getTime()
        }).then(() => {
          this.$router.push('/')
        }).catch((err) => {
          this.$q.notify({
            message: err,
            type: 'negative'
          })
        })
      } else {
        //Submit new post
        postCollection().add({
          caption: this.sanitizedCaption,
          tags: this.tags,
          text: this.sanitizedText,
          date: new Date().getTime(),
          user: this.currentUserRef,
        }).then(() => {
          this.$router.push('/')
        }).catch((err) => {
          this.$q.notify({
            message: err,
            type: 'negative'
          })
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
        this.textInput = post.text;
        this.tags = post.tags;
        this.captionInput = post.caption;
        this.date = post.date;
      })
        .catch(() => {
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
      this.date = new Date().getTime()
    },
  },
  created() {
    if (this.isEdit) {
      if (this.$route.params.id) {
        this.$q.loading.show()
        this.restoreIfEdit();
      } else {
        this.$router.push({name: 'newPost'})
      }
    }
    this.$changeLayoutColor('posteditor')
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
