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


        <div class="q-pa-md" v-if="this.$store.state.auth.isAuthenticated">
          <q-btn-dropdown
            class=""
            split= split
            label="Account"
          >
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-toggle v-model="darkmode" label="Darkmode" />
                <label>Hier könnten acievements oder notifications stehen</label>
              </div>

              <q-separator vertical class="q-mx-lg" />

              <div class="column items-center">
                <q-btn round :ripple="false"
                       v-if="this.$store.state.auth.isAuthenticated"
                       to="/profile">
                  <q-avatar size="5em">
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
                  </q-avatar>
                  <q-tooltip :delay="500">Profile</q-tooltip>
                </q-btn>
                <div class="text-subtitle1 q-mt-md q-mb-xs">User</div>

                <q-btn
                  color="primary"
                  label="Logout"
                  push
                  size="sm"
                  @click="logout"
                  v-close-popup
                />
              </div>
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
            </div>
          </q-btn-dropdown>
        </div>


        <div class="q-pa-md" v-if="!this.$store.state.auth.isAuthenticated">
          <q-btn-dropdown
            class=""
            split= split
            label="Login"
            to="/auth/login"
          >
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-toggle v-model="darkmode" label="Darkmode" />
                <label>Hier könnten acievements oder notifications stehen</label>
              </div>

              <q-separator vertical class="q-mx-lg" />

              <div class="column items-center-centered">
                <q-btn flat  icon="eva-log-in-outline"
                       v-if="!this.$store.state.auth.isAuthenticated"
                       to="/auth/login"
                       label="Login"
                       justify-content="center"
                       >
                  <q-tooltip :delay="500">Login</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-btn-dropdown>
        </div>
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

.items-center-centered
  display: flex
  justify-content: center
  align-items: center
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
      darkmode: true,
      split: true
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
