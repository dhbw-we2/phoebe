<template>
  <div class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat bordered>
      <q-card-section align="middle">
        <div class="text-h4">Create a Post</div>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="q-pa-md q-gutter-sm">
          <q-input dark v-model="captionInput" placeholder="This is a catchy Caption">
            <template v-slot:prepend>
              <q-icon name="eva-arrow-right-outline"/>
            </template>
          </q-input>
          <q-input bottom-slots dark v-model="tagInput" placeholder="#interestingTags">
            <template v-slot:prepend>
              <q-icon name="eva-arrow-right-outline"/>
            </template>
            <template v-slot:append>
              <q-btn
                unelevated rounded
                label="Add Tag"
                icon="eva-plus-outline"
                v-on:click="addTagFkt"
              />
            </template>
          </q-input>
          <q-btn
            color='positive'
            unelevated rounded
            icon-right="eva-close-outline"
            ref="container"
            v-for="tag in tags"
            :key="tag"
            v-on:click="removeFormElement(tag)">
            {{ tag }}
          </q-btn>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <q-editor
          v-model="textInput"
          placeholder="This is a very interesting Text"
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
          @click="SubmitPost"
          to="/"
        />
      </q-card-actions>
    </q-card>

    <PostView disabled="true"
              :caption="captionInput"
              :date="new Date().getTime()"
              :text="textInput"
              :user="this.$fb.auth().currentUser.email"
              :tags="tags">
    </PostView>

  </div>
</template>
<script>

import PostView from "components/PostView";

export default {
  components: {PostView},
  data() {
    return {
      captionInput: '',
      tagInput: '',
      tags: [],
      textInput: '',
      id: 0,
      dateTime: 0,
    }
  },
  methods: {
    addTagFkt() {
      if (this.tagInput != '') {
        const size = this.tags.length;
        //console.log(size);
        this.tags[size] = this.tagInput;
        this.tagInput = '';
      }
    },
    SubmitPost() {
      if (this.id) {
        this.$firestore.collection("posts").doc(this.id).set({
          caption: this.captionInput,
          tags: this.tags,
          text: this.textInput,
          date: this.dateTime,
          user: this.$fb.auth().currentUser.email,
        });
      } else {
        this.$firestore.collection("posts").add({
          caption: this.captionInput,
          date: new Date().getTime(),
          tags: this.tags,
          text: this.textInput,
          user: this.$fb.auth().currentUser.email,
        });
      }
    },
    removeFormElement(tag) {
      console.log('removing form element', tag);
      const index = this.tags.findIndex(f => f === tag);
      this.tags.splice(index, 1);
    },
    restoreIsEdit() {
      this.id = this.$route.params.id;
      console.log(this.id)
      if (this.id != undefined) {
        console.log("id is set")
        this.$firestore.collection("posts").doc(this.id).get().then(doc => {
          const post = doc.data()
          this.textInput = post.text;
          this.tags = post.tags;
          this.captionInput = post.caption;
          this.dateTime = post.date;
        })
          .catch(err => {
            this.$q.notify({
              message: 'Firebase Connection Failed!',
              type: 'negative'
            })
          })
      }
    },
  },
  created() {
    if(this.$route.params.id)
      this.restoreIsEdit();
  }
}
</script>
