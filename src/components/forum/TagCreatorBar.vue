<template>
  <div>
    <q-input filled bottom-slots v-model="tagInput"
             :placeholder="placeholder"
             @keypress.space.enter.prevent="addTag">
      <template v-slot:prepend>
        <q-icon :name="icon"/>
      </template>
      <template v-slot:append>
        <q-btn
          v-if="!allowSubscribe"
          unelevated rounded
          icon="eva-plus-outline"
          type="submit"
          label="ADD TAG"
          ref="AddTagLabel"
          @click="addTag"
        />
        <q-btn
          v-if="allowSubscribe"
          unelevated rounded
          icon="eva-person-add-outline"
          type="submit"
          label="SUBSCRIBE TO TAG"
          ref="AddTagLabel"
          @click="addTag"
        />
      </template>
    </q-input>
    <div class="q-gutter-sm">
      <q-btn
        color='positive'
        unelevated rounded
        icon-right="eva-close-outline"
        ref="container"
        v-for="tag in tags"
        :key="tag"
        v-on:click="removeTag(tag)">
        {{ tag }}
      </q-btn>
    </div>
  </div>
</template>

<script>
import * as firebase from 'firebase/app';
import {mapGetters} from "vuex";

export default {
  name: "TagCreatorBar",
  data() {
    return {
      tagInput: '',
    }
  },
  props: {
    placeholder: String,
    icon: {
      default: 'eva-hash-outline',
    },
    tags: {
      default: () => ([]),
      type: Array
    },
    allowSubscribe: Boolean,
  },
  watch: {
    tagInput: function () {
      if (this.tagInput.slice(-1) === ' ') {
        this.addTag();
      }
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
  },
  methods: {
    addTag() {
      if (this.tags.length < 10) {
        const newTag = this.tagInput.replace(/\s/g, '').toLowerCase()
        if (newTag !== '') {
          const index = this.tags.indexOf(newTag);
          if (index === -1) {
            this.tags.push(newTag);
            if(this.allowSubscribe)
            this.subscribeTo([newTag]);
          }
        }
      } else {
        this.$q.notify({
          type: 'warning',
          message: 'You can only add up to 10 tags!'
        })
      }
      this.tagInput = '';
    },
    removeTag(tag) {
      const index = this.tags.indexOf(tag);
      if (index !== -1) {
        this.tags.splice(index, 1);
      }
      this.$emit('remove-tag', tag)
    },
    subscribeTo(tag) {
      this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayUnion(...tag)
      })
    },
    getSubscriptions() {
      if(this.currentUser.subscribedTags) {
        this.tags.push(...this.currentUser.subscribedTags)
      }
    },
  },
  created() {
    if(this.allowSubscribe){
      this.getSubscriptions()
    }
  }
}
</script>
