<template>



  <q-layout view="lHh Lpr lFf ">

    <q-header
      class="bg-blue-grey-6 text-grey-10"
      bordered
    >
      <q-toolbar class="constrain bg-blue-grey-6" >
        <q-separator
          class="large-screen-only"
          vertical
          spaced
        />
        <q-toolbar-title class="text-bold text-white">
          garduino
        </q-toolbar-title>
        <q-btn
          to="/"
          class="large-screen-only"
          icon="eva-home-outline"
          size="18px"
          flat
          round
          dense
        />
      </q-toolbar>
    </q-header>



    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  data () {
    return {

    }
  }
}
</script>

<style lang="sass">
  .q-toolbar
    @media (min-width: $breakpoint-sm-min)
      height: 77px
  .q-toolbar__title
    font-size: 30px
    @media (max-width: $breakpoint-xs-max)
      text-align: center
  .q-footer
    .q-tab__icon
      font-size: 30px
</style>
