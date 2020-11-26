<template>
  <div>
    <div>
      <q-editor class=""
                ref="editor"
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

              ['undo', 'redo'],
              ['emoji']
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
        <template v-slot:emoji>
          <q-btn
            dense no-caps
            ref="token"
            no-wrap
            unelevated
            size="sm"
            icon="eva-smiling-face-outline"
            @click="toggleEmojiDialog"
          />
        </template>
      </q-editor>

    </div>
    <div v-if="emojiDialog" ref="emojiDialogRef"
         class="flex-start absolute-bottom-right" tabindex="-1"
         @focusout="emojiDialog = false">
      <VEmojiPicker
        @select="selectEmoji"
        dark="true"/>
    </div>
  </div>
</template>

<script>
import {VEmojiPicker} from 'v-emoji-picker';

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
      get() {
        return this.textInput
      },
      set(value) {
        this.$emit('update:text-input', value)
      }
    }
  },
  data() {
    return {
      emojiDialog: false,
    }
  },
  methods: {
    toggleEmojiDialog() {
      this.emojiDialog = !this.emojiDialog
      if (this.emojiDialog) {
        this.$nextTick(function () {
          this.$refs.emojiDialogRef.focus();
        });
      }
    },
    selectEmoji(emoji) {
      this.$nextTick(function () {
        this.$refs.emojiDialogRef.focus();
        this.emojiDialog = true;
      });
      this.$refs.editor.runCmd('insertText', emoji.data)
    },
  },
}
</script>
