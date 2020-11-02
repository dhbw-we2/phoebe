<template>
  <div>
    <q-input filled bottom-slots dark v-model="tagInput"
             :placeholder="placeholder"
             v-on:keypress.space.enter.prevent="addTag">
      <template v-slot:prepend>
        <q-icon :name="icon"/>
      </template>
      <template v-slot:append>
        <q-btn
          unelevated rounded
          label="Add Tag"
          icon="eva-plus-outline"
          type="submit"
          v-on:click="addTag"
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
      default: 'eva-arrow-right-outline',
    },
    tags: {
      default: () => ([]),
      type: Array
    }
  },
  watch: {
    tags: {
      handler: function () {
        this.$emit('tags-changed', this.tags);
        this.$emit('update:tags', this.tags)
      },
      deep: true
    },
    tagInput: function () {
      if (this.tagInput.slice(-1) === ' ') {
        this.addTag();
      }
    }
  },
  methods: {
    addTag() {
      if (this.tags.length < 10) {
        const newTag = this.tagInput.replace(/\s/g, '').toLowerCase()
        if (newTag !== '') {
          const index = this.tags.indexOf(newTag);
          if (index === -1) {
            this.tags.push(newTag);
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
    },
  }
}
</script>

<style scoped>

</style>
