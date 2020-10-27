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

      <q-toolbar-title>spreddit</q-toolbar-title>

      <!-- Login and Register Button -->
      <div class="q-pa-md">
        <q-btn label="Log In" color="blue-6" @click="showLogin = true" />
      </div>
      <div class="q-pa-md">
        <q-btn label="Register" outline color="blue-6" @click="showRegister = true" />
      </div>


      <q-dialog v-model="showLogin">
        <login />
      </q-dialog>
      <q-dialog v-model="showRegister">
        <register />
      </q-dialog>

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

<script>
export default {
  data () {
    return {
      showLogin: false,
      showRegister: false
      }
    },
      components : {
        'login' : require('components/tasks/Login.vue').default,
        'register': require('components/tasks/Register.vue').default
      }
}
</script>
