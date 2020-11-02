<template>
  <div class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h4">{{ getTitle }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section >
        <div class="q-pa-md q-gutter-md">
          <q-input rounded filled dark v-model="captionInput" placeholder="Catchy Caption">
            <template v-slot:prepend>
              <q-icon name="eva-arrow-right-outline" />
            </template>
          </q-input>
          <tag-creator-bar :tags.sync="tags"
          placeholder="#tags">
          </tag-creator-bar>
        </div>
      </q-card-section>
      <q-separator />
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
          icon-right="eva-checkmark-outline"
          color=positive
          label="submit"
          @click="submitPost"
          to="/"
        />
      </q-card-actions>
    </q-card>

    <PostView disabled="true"
              :caption="captionInput"
              :date="date"
              :text="textInput"
              :user="this.$fb.auth().currentUser.email"
              :tags="tags">
    </PostView>

  </div>
</template>
<script>

import PostView from "components/PostView";
import TagCreatorBar from "components/TagCreatorBar";
export default {
  components: {TagCreatorBar, PostView},

  computed: {
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
      if (this.isEdit) {
        this.$firestore.collection("posts").doc(this.postID).set({
          caption: this.captionInput,
          tags: this.tags,
          text: this.textInput,
          date: this.date,
          user: this.$fb.auth().currentUser.email,
        });
      } else {
        this.$firestore.collection("posts").add({
          caption: this.captionInput,
          tags: this.tags,
          text: this.textInput,
          date: new Date().getTime(),
          user: this.$fb.auth().currentUser.email,
        });
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
        .finally( () => {
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
  }
}
</script>
