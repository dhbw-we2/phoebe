<template>
  <q-page class="constrain q-pa-md">
      <q-form class="authentication q-gutter-y-md" ref="emailAuthenticationForm" @submit="onSubmit">
        <h4 class="text-center">{{ getAuthType }}</h4>
        <q-input
          v-model="email"
          filled dark
          autocomplete="email"
          data-cy="email"
          for="email"
          lazy-rules="lazy-rules"
          name="email"
          label="EMAIL"
          type="email"
          :rules="[val => !!val || '*Field is required', val => val.includes('@') && val.includes('.') || '*Please Provide a valid email']"
          autofocus
        />
        <q-input
          v-model="password"
          for="password"
          name="password"
          lazy-rules="lazy-rules"
          filled dark
          autocomplete="current-password"
          data-cy="password"
          label="PASSWORD"
          :rules="[val => !!val || '*Field is required']"
          :type="isPwd ? 'password' : 'text'"
          @keyup.enter="onSubmit();"
        >
          <template v-slot:append>
            <q-icon class="cursor-pointer" :name="isPwd ? 'eva-eye-off-outline' : 'eva-eye-outline'" @click="isPwd = !isPwd"/>
          </template>
        </q-input>
        <q-input
          v-if="isRegistration"
          lazy-rules="lazy-rules"
          filled dark
          autocomplete="new-password"
          data-cy="verifyPassword"
          label="VERIFY PASSWORD"
          v-model="passwordMatch"
          :rules="[val => !!val || '*Field is required', val => val === password || '*Passwords don\'t match']"
          :type="isPwd ? 'password' : 'text'"
          @keyup.enter="onSubmit();"
        >
          <template v-slot:append>
            <q-icon class="cursor-pointer" :name="isPwd ? 'eva-eye-off-outline' : 'eva-eye-outline'" @click="isPwd = !isPwd"/>
          </template>
        </q-input>
        <q-input
          v-if="isRegistration"
          lazy-rules="lazy-rules"
          filled dark
          autocomplete="username"
          label="USERNAME"
          v-model="username"
          :rules="[
          val => !!val || '*Field is required',
          val => val.length < 20 || 'Username cannot be longer than 20 characters',
          val => !/\s/.test(val) || 'Username cannot contain any whitespaces',
          checkIfUsernameFree ]"
          type="username"
          debounce="500"
          @keyup.enter="onSubmit();"
        />
        <q-btn
          class="full-width q-mt-md"
          color="primary"
          data-cy="submit"
          type="submit"
          :label="getAuthType"
          :loading="submitting"
        >
          <template v-slot:loading>
            <q-spinner-dots/>
          </template>
        </q-btn>


        <p class="q-mt-md q-mb-none text-center" @click="$refs.emailAuthenticationForm.focus()">
          <router-link class="text-primary" :to="routeAuthentication">
            <span v-if="isRegistration">Already have an account?</span>
            <span v-else>You need an account?</span>
          </router-link>
        </p>
        <p class="q-ma-sm text-center">
          <router-link class="text-primary" to="forgotPassword">Forgot Password?</router-link>
        </p>
      </q-form>
  </q-page>
</template>

<script>
import {mapActions} from 'vuex'
import {userCollection} from "src/services/firebase/db";

export default {
  name: 'Auth',
  computed: {
    getAuthType() {
      return this.isRegistration ? 'Register' : 'Login'
    },
    isRegistration() {
      return this.$route.name === 'Register'
    },
    routeAuthentication() {
      return this.isRegistration ? '/auth/login' : '/auth/register'
    }
  },
  data() {
    return {
      email: null,
      isPwd: true,
      password: null,
      username: null,
      passwordMatch: null,
      submitting: false,
      usernameQueryState: false,
      usernameTaken: false,
    }
  },
  methods: {
    ...mapActions('auth', ['createNewUser', 'loginUser']),
    /**
     * submit the authentication inputs as a login/registration
     * validates the account
     * checks if user already exists
     * login or Registration
     * checks for mistakes in the input, like an invalid email
     */
    onSubmit() {
      this.submitting = true;
      const {email, password, username} = this
      this.$refs.emailAuthenticationForm.validate()
        .then(async success => {
            if (success) {
              try {
                if (this.isRegistration) {
                  await this.createNewUser({email, password, username})
                  this.$q.notify({
                    type: 'positive',
                    message: "Account created!"
                  })
                } else {
                  await this.loginUser({email, password})
                  this.$q.notify({
                    type: 'positive',
                    message: "You are now logged in!"
                  })
                }
                await this.$router.push({path: '/'})
              } catch (err) {
                const mess = function (code) {
                  switch (code) {
                    case 'auth/wrong-password':
                      return 'Wrong email address or password';
                    case 'auth/user-not-found':
                      return 'No account found associated with this email address';
                    default:
                      return `${err}`;
                  }
                }(err.code)
                this.$q.notify({
                  type: 'negative',
                  message: mess,
                })
              } finally {
                this.submitting = false;
              }
            }
          }
        )
    },
    /**
     * checks if username is free
     * @returns if username is free => true else false
     */
    checkIfUsernameFree() {
      return new Promise((resolve) => {
        userCollection().where('username', '==', this.username).get().then(querySnapshot => {
          if (querySnapshot.size > 0) {
            resolve('Username already taken!')
          } else {
            resolve(true)
          }
        })
      })
    }
  },
  created() {
    this.$changeBackgroundColor('auth')
  }
}
</script>

<style lang="stylus">
.authentication
  margin auto
  max-width 30em
  width 100%
</style>
