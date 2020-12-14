<template>
  <div>
    <q-input filled v-model="tagInput"
             :placeholder="placeholder"
             @keypress.space.enter.prevent="addTagFromInput">
      <template v-slot:prepend>
        <q-icon :name="icon"/>
      </template>
      <template v-slot:append>
        <q-btn
          v-if="!subscriptionBox"
          unelevated rounded
          icon="eva-plus-outline"
          type="submit"
          label="ADD TAG"
          @click="addTagFromInput"
        />
        <q-btn
          v-if="subscriptionBox"
          unelevated rounded
          icon="eva-person-add-outline"
          type="submit"
          label="SUBSCRIBE"
          @click="addTagFromInput"
        />
      </template>
    </q-input>
        <transition-group tag="div" name="zoom" class=" q-pt-md q-gutter-sm" v-show="tags.length > 0">
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
        </transition-group>
    <q-card-actions align="right" v-if="allowSubscribe && tags.length > 0">
      <q-btn
        color='negative'
        unelevated rounded filled
        icon-right="eva-person-add-outline"
        @click="subscribeButton"
        :loading="subscribing"
        label="SUBSCRIBE">
      </q-btn>
    </q-card-actions>
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
      subscribing: false
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
    subscriptionBox: Boolean,
  },
  watch: {
    tagInput: function () {
      if (this.tagInput.slice(-1) === ' ') {
        this.addTagFromInput();
      }
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
  },
  methods: {
    addTagFromInput() {
      if (this.addTag(this.tagInput)) {
        this.tagInput = '';
      }
    },
    addTag(tag) {
      if (this.tags.length < 10) {
        const newTag = tag.replace(/\s/g, '').toLowerCase()
        if (newTag !== '') {
          const index = this.tags.indexOf(newTag);
          if (index === -1) {
            this.tags.push(newTag);
            if (this.subscriptionBox) {
              this.subscribe([newTag]);
            }
            return true
          }
        }
      } else {
        this.$q.notify({
          type: 'warning',
          message: 'You can only add up to 10 tags!'
        })
      }
      return false
    },
    removeTag(tag) {
      const index = this.tags.indexOf(tag);
      if (index !== -1) {
        this.tags.splice(index, 1);
        if(this.subscriptionBox){
          this.unsubscribe(tag)
        }
      }
    },
    async subscribe(tag) {
      await this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayUnion(...tag)
      })
    },
    async unsubscribe(tag){
      await this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayRemove(tag)
      })
    },
    getSubscriptions() {
      if (this.currentUser.subscribedTags) {
        this.tags.push(...this.currentUser.subscribedTags)
      }
    },
    async subscribeButton() {
      this.subscribing = true
      try {
        await this.subscribe(this.tags)
        this.$q.notify({
          type: 'positive',
          message: 'Subscription added'
        })
      } catch (err) {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: `Failed to add subscription!`
        })
      }
      this.subscribing = false
    }
  },
  created() {
    if (this.subscriptionBox) {
      this.getSubscriptions()
    }
  }
}
</script>
