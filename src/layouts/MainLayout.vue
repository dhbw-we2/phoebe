<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn dense flat round icon="eva-menu-outline" @click="drawer = !drawer" class="q-mr-sm"/>

        <router-link to="/">
          <q-avatar square size="55px" class="logo">
            <img src="~assets/spreddit-logo.svg" alt="Logo">
          </q-avatar>
        </router-link>
        <q-toolbar-title>
          <router-link to="/" class="logo-text" style="display: inline-block">
            <div>spreddit</div>
          </router-link>
        </q-toolbar-title>
        <q-btn flat round icon="eva-log-in-outline"
               v-if="!this.$store.state.auth.isAuthenticated"
               to="/auth/login">
          <q-tooltip :delay="500">Login</q-tooltip>
        </q-btn>

        <q-btn flat round icon="eva-log-out-outline"
               v-if="this.$store.state.auth.isAuthenticated"
               @click="logout">
          <q-tooltip :delay="500">Logout</q-tooltip>
        </q-btn>

        <q-btn round :ripple="false"
               v-if="this.currentUser"
               to="/profile">
          <q-avatar size="40px">
            <q-icon round="round" color="white" name="eva-person-outline" text-color="white"
                    v-if="showDefaultProfilePicture()"/>
            <q-img :src="currentUser.profilePicture" alt="Avatar"
                   v-else/>
          </q-avatar>
          <q-tooltip :delay="500">Profile</q-tooltip>
        </q-btn>
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
              <q-icon name="eva-message-circle-outline"/>
            </q-item-section>
            <q-item-section>
              Forum
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple
                  :to="{name: 'newPost'}">
            <q-item-section avatar>
              <q-icon name="eva-plus-circle-outline"/>
            </q-item-section>
            <q-item-section>
              New Post
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple
                  to="/myPosts">
            <q-item-section avatar>
              <q-icon name="eva-person-outline"/>
            </q-item-section>
            <q-item-section>
              My Post
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="eva-music-outline"/>
            </q-item-section>
            <q-item-section>
              Playlists
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="eva-bell-outline"/>
            </q-item-section>
            <q-item-section>
              Notifications
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

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
import {mapActions, mapGetters} from "vuex";
import {currentUser} from "src/store/user/getters";

export default {
  data() {
    return {
      showLogin: false,
      showRegister: false,
      drawer: false,
      miniState: true,
      defaultProfilePicture: true
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  methods: {
    ...mapActions('auth', ['logoutUser']),
    async logout() {
      try {
        await this.logoutUser()
        this.$q.notify({
          type: 'info',
          message: "You are now logged out!"
        })
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: `${err}`,
        })
      }
    },
    showDefaultProfilePicture() {
      return this.currentUser.profilePicture === '' ||
        this.currentUser.profilePicture === null ||
        this.currentUser.profilePicture === undefined
    },
  },
  created() {
  }
}
</script>
