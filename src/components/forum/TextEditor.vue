<template>
  <div>
      <q-editor class=""
                ref="editor"
                v-model="textInputProxy"
                :placeholder=placeholderText
                :dense="$q.screen.lt.md"
                @paste.native="evt => pasteCapture(evt)"
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
            icon="eva-smiling-face-outline"
            @click="toggleEmojiDialog"
          />
        </template>
      </q-editor>
    <div v-if="emojiDialog" ref="emojiDialogRef"
         class="absolute-bottom-right"
         style="outline: none"
         tabindex="-1"
         @focusout="emojiDialog = false">
      <VEmojiPicker
        @select="selectEmoji"
        dark="true"
        class="emoji-picker-color-override"/>
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
    pasteCapture(evt) {
      let text, onPasteStripFormattingIEPaste
      evt.preventDefault()
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData('text/plain')
        if(text.startsWith("http")){
          const linkHTML = `<a href="${text}">${text}</a>`;
          this.$refs.editor.runCmd('insertHTML', linkHTML)
        } else {
          this.$refs.editor.runCmd('insertText', text)
        }
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData('text/plain')
        if(text.startsWith("http")){
          const linkHTML = `<a href="${text}">${text}</a>`;
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
