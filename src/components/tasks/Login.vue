<template>
  <q-card>
    <q-card-section class="row">
      <div class="text-h6">Login</div>
      <q-space/>
      <q-btn
        flat
        round
        dense
        icon="close"
        v-close-popup/>
    </q-card-section>
    <q-card-section>

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
      </q-form>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Login" color="primary" type="submit"/>
    </q-card-actions>

    <q-card-section>
      Forgot your password?
    </q-card-section>
  </q-card>
</template>

<script>
import {mapActions} from "vuex";

export default {
  data() {
    return {
      email: "",
      password: "",
      isPwd: true,
    }
  },
  methods: {
    ...mapActions('auth', ['createNewUser', 'loginUser']),
    onSubmit() {
      const {email, password} = this
      this.$refs.emailAuthenticationForm.validate()
        .then(async success => {
          if (success) {
            const notif = this.$q.notify({
              message: 'Authenticating your account...',
              type: 'ongoing',
            })
            try {
              await this.loginUser({email, password})
              this.$router.push({path: '/profile'})
              notif({
                message: 'Logged in',
                type: 'positive'
              })
            } catch (err) {
              console.error(err)
              notif({
                message: `An error as occured: ${err}`,
                type: 'negative'
              })
            }
          }
        })
    }
  }
}
</script>
