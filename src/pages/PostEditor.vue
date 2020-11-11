<template>
  <div class="constrain q-pa-md" v-if="currentUser">
    <q-card class="card-post-text q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h4">{{ getTitle }}</div>
      </q-card-section>
      <q-separator/>
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
      <q-separator/>
      <q-card-section>
        <q-editor
          v-model="textInput"
          placeholder="This is a very interesting Post"
          :dense="$q.screen.lt.md"
          :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify']
            },
          ],
          [
            {
              label: $q.lang.editor.defaultFont,
              icon: $q.iconSet.editor.font,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'default_font',
                'arial',
                'arial_black',
                'comic_sans',
                'courier_new',
                'impact',
                'lucida_grande',
                'times_new_roman',
                'verdana'
              ]
            },
            'removeFormat'
          ],
          ['bold', 'italic', 'strike', 'underline'],
          ['link'],

          ['unordered', 'ordered'],

          ['undo', 'redo']
        ]"
          :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana'
        }"
        />
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
              :caption="captionInput"
              :date="date"
              :text="textInput"
              :uid="this.currentUser.uid"
              :tags="tags"
              preview>
    </PostView>

  </div>
</template>
<script>

import PostView from "components/PostView";
import TagCreatorBar from "components/TagCreatorBar";
import {mapGetters} from "vuex";

export default {
  components: {TagCreatorBar, PostView},

  computed: {
    ...mapGetters('user', ['currentUser']),
    getTitle() {
      return this.isEdit ? 'Edit Post' : 'Create a Post'
    },
    isEdit() {
      return this.$route.name === 'editPost'
    },
    postID() {
      return this.$route.params.id
    }
  },
  watch: {
    '$route.name'(route) {
      if (route === 'newPost') {
        this.clearInputs()
      }
    }
  },
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
    addTagFkt() {
      if (this.tagInput !== '') {
        const size = this.tags.length;
        this.tags[size] = this.tagInput;
        this.tagInput = '';
      }
    },
    submitPost() {
      this.postSubmitted = true;
      if (this.isEdit) {
        this.$firestore.collection("posts").doc(this.postID).update({
          caption: this.captionInput.trim(),
          tags: this.tags,
          text: this.textInput,
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
        this.$firestore.collection("posts").add({
          caption: this.captionInput,
          tags: this.tags,
          text: this.textInput,
          date: new Date().getTime(),
          user: this.currentUser.uid,
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
      this.$firestore.collection("posts").doc(this.postID).get().then(doc => {
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
  },
  beforeRouteLeave(to, from, next) {
    //Show warning when leaving partially filled form
    if ((this.tags.length > 0 || this.textInput || this.captionInput || this.tagInput) && !this.postSubmitted) {
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
