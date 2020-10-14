<template>
<q-layout>
  <q-header
  class="bg-white text-grey-10"
  bordered>
    <q-toolbar class="constrain">
      <q-btn
      to="/"
      class="large-screen-only q-mr-sm"
      icon="eva-home-outline"
      flat
      round
      dense
      />
      <q-separator
        class="large-screen-only"
        vertical
        spaced
        />
      <q-toolbar-title>
        listen2.me
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container class="bg-grey-1">
    <router-view/>
  </q-page-container>
</q-layout>
</template>

<style lang="sass">
  .q-toolbar__title
    font-size: 30px
    @media (max-width: $breakpoint-xs-max)
      text-align: center
  .q-toolbar
    @media (min-width: $breakpoint-xs-min)
      height: 70px
</style>
