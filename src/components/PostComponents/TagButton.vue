<template>
  <q-btn unelevated rounded
         icon-right="eva-close-outline"
         color=dark
         v-on:click="$emit('remove', id)"
         >
    <slot />
  </q-btn>
</template>
<script>
export default {
  name: 'TagButton',
  props: ['id','contentLabel']
}
</script>

