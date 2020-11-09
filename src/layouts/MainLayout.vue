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

        <q-btn-dropdown
          v-if="$store.state.auth.isAuthenticated"
          icon="eva-bell-outline"
          flat
          style="height:100%">
          <div class="row no-wrap q-pa-md">
            <div class="column">
              <div class="text-h6 q-mb-md">Notifications</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>Hier könnten achievements oder notifications stehen</q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-btn-dropdown>

        <q-btn-dropdown
          flat
          :ripple="false"
          dropdown-icon="eva-chevron-down-outline"
          style="height:100%">
          <template v-slot:label>
            <q-avatar size="45px">
              <q-img :src="currentUser.profilePicture" alt="Avatar"
                     v-if="currentUser && !showDefaultProfilePicture()"/>
              <q-icon round="round" color="white" name="eva-person-outline" text-color="white"
                      v-else/>
            </q-avatar>
          </template>
          <div v-if="$store.state.auth.isAuthenticated && currentUser">
            <div class="column items-center q-pt-md">
              <div class="text-h6 text-bold">{{ currentUser.username }}</div>
              <div class="column q-pb-sm q-pt-sm">
                <q-btn
                  flat
                  icon="eva-person-outline"
                  label="My Profile"
                  to="profile"
                  v-close-popup
                />
                <q-btn
                  flat
                  icon="eva-log-out-outline"
                  label="Logout"
                  @click="logout"
                  v-close-popup
                />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="column items-center">
              <div class="column q-pb-sm q-pt-sm">
                <q-btn
                  flat
                  icon="eva-log-in-outline"
                  label="Login"
                  to="auth/login"
                  v-close-popup
                />
              </div>
            </div>
          </div>
          <q-separator/>
          <div class="column q-pb-sm q-pt-sm">
            <q-btn
              v-if="$q.dark.isActive"
              flat
              icon="eva-sun-outline"
              label="Light Mode"
              @click="toggleDarkMode"
            />
            <q-btn
              v-else
              flat
              icon="eva-moon-outline"
              label="Dark Mode"
              @click="toggleDarkMode"
            />
          </div>
        </q-btn-dropdown>
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
    toggleDarkMode() {
      this.$q.dark.toggle()
    }
  },
  created() {
  }
}
</script>
