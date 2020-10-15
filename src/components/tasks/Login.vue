<template>
  <q-card>

    <form @submit.prevent="submitLogin">
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
        <q-input
          v-model="userCredentials.username"
          label="username"
          :rules="[val => !!val || 'Field is required']"
          ref="username"
        />
        <q-input
          v-model="userCredentials.password"
          label="password"
          :type="isPwd ? 'password' : 'text'"
          :rules="[val => !!val || 'Field is required']"
          ref="password">
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Login" color="blue-6" type="submit"/>
      </q-card-actions>

      <q-card-section>
        Forgot your username or password?
      </q-card-section>
    </form>
  </q-card>
</template>

<script>
export default {
  data () {
    return {
      userCredentials: {
        username: "",
        password: ""
      },
      isPwd: true
    }
  },
  methods: {
    submitLogin () {
      this.$refs.username.validate()
      this.$refs.password.validate()
      if (!this.$refs.username.hasError && !this.$refs.password.hasError) {
        //here we need to call a function to send our user data to the backend
        console.log("Submitted")
      }
    }
  }
}

</script>
