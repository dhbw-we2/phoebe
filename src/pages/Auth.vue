<template>
  <q-page padding>
    <h5 class="text-center">{{ getAuthType }}</h5>
    <q-form class="authentication q-gutter-y-md" ref="emailAuthenticationForm" @submit="onSubmit">
      <q-input
        v-model="email"
        outlined
        autocomplete="email"
        color="primary"
        data-cy="email"
        for="email"
        lazy-rules="lazy-rules"
        name="email"
        label="EMAIL"
        type="email"
        :rules="[val => !!val || '*Field is required', val => val.includes('@') && val.includes('.') || '*Please Provide a valid email']"
      />
      <q-input
        v-model="password"
        for="password"
        name="password"
        lazy-rules="lazy-rules"
        outlined
        autocomplete="current-password"
        color="primary"
        data-cy="password"
        label="PASSWORD"
        :rules="[val => !!val || '*Field is required']"
        :type="isPwd ? 'password' : 'text'"
        @keyup.enter="onSubmit();"
      >
        <template v-slot:append>
          <q-icon class="cursor-pointer" :name="isPwd ? 'visibility_off' : 'visibility'" @click="isPwd = !isPwd"/>
        </template>
      </q-input>
      <q-input
        v-if="isRegistration"
        lazy-rules="lazy-rules"
        outlined
        autocomplete="new-password"
        color="primary"
        data-cy="verifyPassword"
        label="VERIFY PASSWORD"
        v-model="passwordMatch"
        :rules="[val => !!val || '*Field is required', val => val === password || '*Passwords don\'t match']"
        :type="isPwd ? 'password' : 'text'"
        @keyup.enter="onSubmit();"
      >
        <template v-slot:append>
          <q-icon class="cursor-pointer" :name="isPwd ? 'visibility_off' : 'visibility'" @click="isPwd = !isPwd"/>
        </template>
      </q-input>
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


      <p class="q-mt-md q-mb-none text-center">
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
import {QSpinnerGears} from 'quasar'

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
      passwordMatch: null,
      submitting: false
    }
  },
  methods: {
    ...mapActions('auth', ['createNewUser', 'loginUser']),
    onSubmit() {
      this.submitting = true;
      const {email, password} = this
      this.$refs.emailAuthenticationForm.validate()
        .then(async success => {
            if (success) {
              try {
                if (this.isRegistration) {
                  await this.createNewUser({email, password})
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
                this.$router.push({path: '/'})
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
    }
  }
}
</script>

<style lang="stylus">
.authentication
  margin auto
  max-width 30em
  width 100%
</style>