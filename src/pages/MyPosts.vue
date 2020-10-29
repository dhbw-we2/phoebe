<template>
  <div class="constrain" ref="container">
    <q-btn
      unelevated rounded
      icon-right="eva-plus-outline"
      color=positive
      label="add Tag"
      v-on:click="onClick"
    />
  </div>
</template>
<script>
import TagButton from 'src/components/PostComponents/TagButton'
import Vue from 'vue'


export default {
  name: 'App',
  components: { TagButton },
  methods: {
    onClick(){

      var ComponentClass = Vue.extend(TagButton)
      var instance = new ComponentClass({
        propsData: { type: 'primary' }
      })
      instance.$slots.default = [ 'Click me!' ]
      instance.$mount() // pass nothing
      this.$refs.container.appendChild(instance.$el)
    }
  },
}
</script>
