<template>
  <div>
    <q-input bottom-slots dark v-model="tagInput" placeholder="#interestingTags">
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
    <q-btn
      color='positive'
      unelevated rounded
      icon-right="eva-close-outline"
      ref="container"
      v-for="tag in tags"
      :key="tag"
      v-on:click="removeFormElement(tag)">
      {{tag}}
    </q-btn>
  </div>
</template>

<script>
export default {
name: "TagCreatorBar",
  data(){
    return{
      tags: [],
      tagInput: '',

    }
  },
  methods:{
    getTags(){
      return this.tags;
    },
    addTagFkt() {
      if(this.tagInput != ''){
        const size = this.tags.length;
        //console.log(size);
        this.tags[size] = this.tagInput;
        this.tagInput ='';
      }
      console.log('addTagFkt')
      //Emit doesnt Work
      this.$emit('settagdata', this.tags);
    },
    removeFormElement(tag) {
      const index = this.tags.findIndex(f => f === tag);
      this.tags.splice(index, 1);
      console.log('removeFormElement')
      //Emit doesnt Work
      this.$emit('settagdata', this.tags);
    },
  }
}
</script>

<style scoped>

</style>
