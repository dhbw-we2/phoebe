<template>
  <div class="fixed-center text-center">
    <q-icon name="eva-alert-circle-outline" size="50px" class="q-ma-lg"/>
    <p class="text-faded">
      Sorry, nothing here...<strong>(404)</strong>
    </p>
    <q-btn
      color="primary"
      style="width:200px;"
      @click="$router.go(-1)"
      label="Go Back"
    />
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
