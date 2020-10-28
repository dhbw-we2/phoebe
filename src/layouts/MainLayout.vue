<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="drawer = !drawer" class="q-mr-sm"/>

        <q-avatar square size="55px">
          <img src="~assets/spreddit-logo.svg" alt="Logo">
        </q-avatar>
        <q-toolbar-title class="logo-text">spreddit</q-toolbar-title>

        <q-btn flat round icon="login" @click="showLogin = true"/>

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="drawer" side="left"
              :mini="miniState"
              @mouseover="miniState = false"
              @mouseout="miniState = true"
              :width="200"
              :breakpoint="500">
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item clickable v-ripple
                  to="/home">
            <q-item-section avatar>
              <q-icon name="eva-message-circle-outline" />
            </q-item-section>
            <q-item-section>
              Forum
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple
                  to="/addPost">
            <q-item-section avatar>
              <q-icon name="eva-plus-circle-outline" />
            </q-item-section>
            <q-item-section>
              Add Post
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple
                  to="/myPosts">
            <q-item-section avatar>
              <q-icon name="eva-person-outline" />
            </q-item-section>
            <q-item-section>
              My Post
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="eva-music-outline" />
            </q-item-section>
            <q-item-section>
              Playlists
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="eva-bell-outline" />
            </q-item-section>
            <q-item-section>
              Notifications
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
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
      drawer: false,
      miniState: true
    }
  },
  components: {
    'login': require('components/tasks/Login.vue').default,
    'register': require('components/tasks/Register.vue').default
  }
}
</script>
