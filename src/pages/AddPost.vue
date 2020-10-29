<template>
  <div class="constrain">
  <h3 align="center">Create a Post</h3>
    <div class="q-pa-md q-gutter-sm">
      <q-input dark v-model="Caption" placeholder="This is a catchy Caption">
        <template v-slot:prepend>
          <q-icon name="eva-arrow-right-outline" />
        </template>
      </q-input>
      <div ref="container">
        <q-input bottom-slots dark v-model="Tag" placeholder="#intrestingTages">
          <template v-slot:prepend>
            <q-icon name="eva-arrow-right-outline" />
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
      </div>
      <q-editor
        v-model="TextToPost"
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
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              options: ['left', 'center', 'right', 'justify']
            }
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['print', 'fullscreen'],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: [
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'code'
              ]
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7'
              ]
            },
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
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

          ['undo', 'redo'],
          ['viewsource']
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
    </div>
    <div align="right" class="q-pa-md q-gutter-sm">
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
      />
    </div>
    <h4 align="center">Preview</h4>
    <q-card class="card-post-text q-mb-md" flat bordered>
      <q-card-section vertical>
        <q-card-section class="q-pt-xs">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
              </q-avatar>
            </q-item-section>

            <q-item-section >
              <q-item-label>
                <span v-for="i in this.indexOfTags"> r/{{ Tags[i-1] }}</span>
              </q-item-label>
              <q-item-label class="text-overline">Posted by u/me now  </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                disable
                color="blue-6"
                label="Join +"
              />
            </q-item-section>
          </q-item>

          <div class="text-h5 q-mt-sm q-mb-xs">{{ Caption }}</div>
        </q-card-section>
        <q-card-section v-html="TextToPost" class="col-5 flex flex-center"/>
        <q-card-section class="col-5 flex flex-center" disable>
          <a href="https://open.spotify.com/playlist/52tpcZzLHOTbPelf1zuo78?si=Ob9CMproTrGaI9r5l-FRCg" target="_blank" rel="noopener" class="doc-link">Click here</a>
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="stretch">
        <q-btn flat disable round icon="eva-heart-outline" />
        <q-btn flat disable round icon="eva-message-square-outline" />
        <q-btn flat disable round icon="eva-save-outline" />
        <q-btn flat disable round icon="eva-more-horizontal-outline" />
      </q-card-actions>
    </q-card>

  </div>
</template>
<script>
import TagButton from 'src/components/PostComponents/TagButton'
import Vue from "vue";



export default {
  data () {
    return {
      Caption: '',
      Tag: '',
      Tags: [''],
      TextToPost: '',
      indexOfTags: 0,
    }
  },
  components: { TagButton },
  methods: {
    addTagFkt() {
      if(this.Tag != ''){
        const ComponentClass = Vue.extend(TagButton)
        const instance = new ComponentClass({
          propsData: {
            type: 'primary',
            index: this.indexOfTags
          }
        })
        instance.$slots.default = this.Tag
        instance.$mount() // pass nothing
        this.Tags[this.indexOfTags] = this.Tag
        this.indexOfTags++
        this.$refs.container.appendChild(instance.$el)
        this.Tag =''
      }
    },
    SubmitPost(){

    },
    deleteTag(index){
      //this.$refs.container.removeChild(this.$refs.container.getChild())
      console.log("index: " + index)
      this.Tags.splice(index,1)
      this.indexOfTags--
    },
  }
}


</script>
