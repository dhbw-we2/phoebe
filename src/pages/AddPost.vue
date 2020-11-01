<template>
  <div class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat bordered>
      <q-card-section align="middle">
        <div class="text-h4">Create a Post</div>
      </q-card-section>
      <q-separator />
      <q-card-section >
        <div class="q-pa-md q-gutter-md">
          <q-input rounded filled dark v-model="captionInput" placeholder="Catchy Caption">
            <template v-slot:prepend>
              <q-icon name="eva-arrow-right-outline" />
            </template>
          </q-input>
          <tag-creator-bar @tags-changed="setTagData"
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
import TagCreatorBar from "components/TagCreatorBar";
export default {
  components: {TagCreatorBar, PostView},
  data () {
    return {
      captionInput: '',
      tagInput: '',
      tags: [],
      textInput: '',
    }
  },
  methods: {
    setTagData(tagsData){
      this.tags = tagsData;
    },
    addTagFkt() {
      if(this.tagInput != ''){
        const size = this.tags.length;
        //console.log(size);
        this.tags[size] = this.tagInput;
        this.tagInput ='';
      }
    },
    SubmitPost(){
      this.$firestore.collection("posts").add({
        caption: this.captionInput,
        date: new Date().getTime(),
        tags: this.tags,
        text: this.textInput,
        user: this.$fb.auth().currentUser.email,
      });
    },
    removeFormElement(tag) {
      console.log('removing form element', tag);
      const index = this.tags.findIndex(f => f === tag);
      this.tags.splice(index, 1);
    },
  }
}
</script>
