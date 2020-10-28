<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left"/>

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" alt="Logo">
          </q-avatar>
          spreddit
        </q-toolbar-title>

        <q-btn flat round icon="login" @click="showLogin = true"/>

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-dialog v-model="showLogin">
      <login/>
    </q-dialog>
    <q-dialog v-model="showRegister">
      <register/>
    </q-dialog>

    <q-page-container>
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
  data() {
    return {
      showLogin: false,
      showRegister: false,
      left: false
    }
  },
  components: {
    'login': require('components/tasks/Login.vue').default,
    'register': require('components/tasks/Register.vue').default
  }
}
</script>
