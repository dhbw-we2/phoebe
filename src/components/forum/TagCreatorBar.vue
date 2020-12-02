<template>
  <div>
    <q-input filled v-model="tagInput"
             :placeholder="placeholder"
             @keypress.space.enter.prevent="addTag">
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
          @click="addTag"
        />
        <q-btn
          v-if="subscriptionBox"
          unelevated rounded
          icon="eva-person-add-outline"
          type="submit"
          label="SUBSCRIBE"
          @click="addTag"
        />
      </template>
    </q-input>
    <div class="q-gutter-sm q-pt-md" v-if="tags.length > 0">
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
            if(this.subscriptionBox)
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
    async subscribeTo(tag) {
      await this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayUnion(...tag)
      })
    },
    getSubscriptions() {
      if(this.currentUser.subscribedTags) {
        this.tags.push(...this.currentUser.subscribedTags)
      }
    },
    async subscribeButton() {
      this.subscribing = true
      try{
        await this.subscribeTo(this.tags)
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
    if(this.subscriptionBox){
      this.getSubscriptions()
    }
  }
}
</script>
