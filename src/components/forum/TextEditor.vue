<template>
  <div>
    <div>
      <q-editor class="relative-position"
        v-model="textInputProxy"
        :placeholder=placeholderText
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
            }">
      </q-editor>
      <q-btn
        class="absolute-bottom-right q-ma-lg"
        icon="eva-smiling-face-outline"
        @click="toggleShowEmojiDialog"
      />
    </div>
    <div v-if="showEmojiDialog" class="flex-start absolute-bottom-right">
      <VEmojiPicker @select="selectEmoji" dark="true"/>
      <q-btn icon="eva-close-outline" @click="toggleShowEmojiDialog" unelevated rounded color=negative />
    </div>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker';
//import packData from 'v-emoji-picker/data/emojis.json'
export default {
  components: {
    VEmojiPicker
  },
  name: "TextEditor",
  props: {
    placeholderText: String,
    textInput: '',
  },
  computed: {
    textInputProxy: {
      get() {return this.textInput},
      set(value) {this.$emit('update:text-input', value)}
    }
  },
  data(){
    return{
      showEmojiDialog: false,
    }
  },
  methods:{
    toggleShowEmojiDialog() {
      this.showEmojiDialog = !this.showEmojiDialog
    },
    selectEmoji(emoji) {
      this.textInputProxy = (this.textInputProxy + emoji.data)
    },
  }
}
</script>
