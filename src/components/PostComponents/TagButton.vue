<template>
  <q-btn unelevated rounded
         icon-right="eva-close-outline"
         color=dark
         :class="type"
         v-on:click="deleteMe">
    <slot />
  </q-btn>
</template>
<script>
import Vue from "vue";
Vue.component('')
import AddPost from "pages/AddPost";

export default {
  name: 'TagButton',
  props: [ 'type', 'index'],
  methods:{
    deleteMe(){
      AddPost.data().Tags.splice(this.index,1)
      //AddPost.methods.deleteTag(this.index);
    }
  },
}
</script>

