<template>
  <div>
    <q-editor class=""
              ref="editor"
              v-model="textInputProxy"
              :placeholder=placeholderText
              :dense="$q.screen.lt.md"
              @paste.native="evt => pasteCapture(evt)"
              @drop.prevent
              content-class="links-primary"
              :toolbar="
                [
                  ['bold', 'italic', 'strike', 'underline'],
                  ['unordered', 'ordered'],
                  ['undo', 'redo'],
                  ['emoji']
                ]"
    >
      <template v-slot:emoji>
        <q-btn
          dense no-caps
          ref="token"
          no-wrap
          unelevated
          size="sm"
          icon="eva-smiling-face-outline">
          <q-menu v-model="emojiDialog" cover anchor="bottom left"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                  content-class="bg-transparent">
            <VEmojiPicker
              @select="selectEmoji"
              dark="true"
              class="emoji-picker-color-override"
            />
          </q-menu>
        </q-btn>
      </template>
    </q-editor>
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
    selectEmoji(emoji) {
      this.$refs.editor.runCmd('insertText', emoji.data)
      this.emojiDialog = true
    },
    pasteCapture(evt) {
      let text, onPasteStripFormattingIEPaste
      evt.preventDefault()
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData('text/plain')
        if (text.startsWith("http")) {
          const linkHTML = `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          this.$refs.editor.runCmd('insertHTML', linkHTML)
        } else {
          this.$refs.editor.runCmd('insertText', text)
        }
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData('text/plain')
        if (text.startsWith("http")) {
          const linkHTML = `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          this.$refs.editor.runCmd('insertHTML', linkHTML)
        } else {
          this.$refs.editor.runCmd('insertText', text)
        }
      } else if (window.clipboardData && window.clipboardData.getData) {
        if (!onPasteStripFormattingIEPaste) {
          onPasteStripFormattingIEPaste = true
          this.$refs.editor.runCmd('ms-pasteTextOnly', text)
        }
        onPasteStripFormattingIEPaste = false
      }
    }
  },
}
</script>
