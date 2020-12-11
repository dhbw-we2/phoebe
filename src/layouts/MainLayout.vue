<template>
  <q-layout view="hHh LpR fFf">
    <div id="background-container">
      <div class="background gradient-color" id="background-gradient"/>
      <div class="background gradient-darken"/>
    </div>
    <div id="pixel-anchor-toolbar-scroll"/>
    <q-header style="background-color: transparent">
      <q-toolbar class="toolbar" id="toolbar">
        <q-toolbar-title>
          <div class="flex logo">
            <router-link to="/" class="logo-text-link">
              <div class="flex no-wrap q-gutter-x-sm">
                <q-avatar square size="55px">
                  <img src="~assets/spreddit-logo.svg" alt="Logo">
                </q-avatar>
                <div class="self-center logo-text">spreddit</div>
              </div>
            </router-link>
          </div>
        </q-toolbar-title>

        <q-btn-dropdown
          flat
          :ripple="false"
          dropdown-icon="eva-chevron-down-outline"
          style="height:100%"
          padding="5px">
          <template v-slot:label>
            <q-avatar size="45px">
              <q-img :src="currentUser.profilePicture" alt="Avatar"
                     v-if="$store.state.auth.isAuthenticated && currentUser && !showDefaultProfilePicture()"/>
              <q-icon round="round" color="white" name="eva-person-outline" text-color="white"
                      v-else/>
            </q-avatar>
          </template>
          <div v-if="$store.state.auth.isAuthenticated">
            <div class="column items-center q-pt-md">
              <div class="text-h6 text-bold"
                   v-if="currentUser">
                {{ currentUser.username }}
              </div>
              <div class="column q-pb-sm q-pt-sm">
                <q-btn
                  flat
                  icon="eva-person-outline"
                  label="My Profile"
                  :to="{name:'profile'}"
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
            <div class="column q-pb-sm q-pt-sm">
              <q-btn
                flat
                icon="eva-log-in-outline"
                label="Login"
                to="/auth/login"
                v-close-popup
              />
            </div>
          </div>
          <q-separator/>
          <div class="column q-pb-sm q-pt-sm">
            <q-btn
              v-if="$q.dark.isActive"
              flat
              icon="eva-sun-outline"
              label="Light Mode"
              @click="rainbowColors"
              v-close-popup
            />
            <q-btn
              v-else
              flat
              icon="eva-moon-outline"
              label="Dark Mode"
              @click="toggleDarkMode"
              v-close-popup
            />
          </div>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer class="large-screen-only"
              v-model="drawer"
              show-if-above side="left"
              :mini="miniState"
              @mouseover="miniState = false"
              @mouseout="miniState = true"
              @focusout="miniState = true"
              @="miniState = true"
              @mouseleave="miniState = true"
              :width="200"
              :breakpoint="500"
              mini-to-overlay>
      <q-list padding class="drawer-list">
        <q-item clickable v-ripple
                :to="{name: 'feed'}">
          <q-item-section avatar>
            <q-icon name="eva-home-outline"/>
          </q-item-section>
          <q-item-section>
            My Feed
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple
                :to="{name: 'forum'}">
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
                :to="{name: 'myPosts'}">
          <q-item-section avatar>
            <q-icon name="eva-person-outline"/>
          </q-item-section>
          <q-item-section>
            My Posts
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <transition
        name="slide-right"
        mode="out-in">
        <router-view/>
      </transition>
    </q-page-container>
    <q-footer class="small-screen-only" reveal :reveal-offset="20">
      <q-tabs align="center" dense active-color="primary" switch-indicator indicator-color="transparent"
              :breakpoint="0">
        <q-route-tab icon="eva-home-outline" v-ripple
                     :to="{name: 'feed'}">
          Feed
        </q-route-tab>
        <q-route-tab icon="eva-message-circle-outline"
                     :to="{name: 'forum'}">
          Forum
        </q-route-tab>
        <q-route-tab icon="eva-person-outline"
                     :to="{name: 'myPosts'}">
          My Posts
        </q-route-tab>
        <q-route-tab icon="eva-plus-circle-outline"
                     :to="{name: 'newPost'}">
          New
        </q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import {mapActions, mapGetters} from "vuex";


export default {
  data() {
    return {
      showLogin: false,
      showRegister: false,
      drawer: false,
      miniState: true,
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
    },
    handleScroll() {
      const header = document.getElementById('header')
      if (document.body.scrollTop >= 25 || document.documentElement.scrollTop >= 25) {
        header.style.backgroundColor = 'black';
      } else {
        header.style.backgroundColor = 'blue'
      }
    },
    rainbowColors() {
      this.$q.notify({
        color: 'negative',
        position: 'top',
        message: 'Who in the world needs light mode?!'
      })
      this.$changeBackgroundColor('fun')
    }
  },
  mounted() {
    // Define Observer to change the header opacity
    if ("IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window &&
      "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
      let observer = new IntersectionObserver(entries => {
        if (entries[0].boundingClientRect.y < 0) {
          document.getElementById('toolbar').classList.add("scroll")
        } else {
          document.getElementById('toolbar').classList.remove("scroll")
        }
      });
      observer.observe(document.querySelector("#pixel-anchor-toolbar-scroll"));
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
