<template>
  <q-card class="row">
    <form class="col-2"></form>
    <form @submit.prevent="submitRegistration" class="col">
      <q-card-section class="row">
        <div class="text-h5">Register</div>
        <q-space/>
      </q-card-section>

      <q-card-section>
        <div>By continuing, you agree to our User Agreement and Privacy Policy.</div>
      </q-card-section>

      <q-card-section align="left">
        <q-input
          class="login-size"
          v-model="userCredentials.username"
          label="username"
          :rules="[val => !!val || 'Field is required']"
          ref="username"
        />
        <q-input
          class="login-size"

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

      <q-card-actions align="left">
        <q-btn class="login-size" outline label="Register" color="blue-6" type="submit"/>
      </q-card-actions>

      <q-card-section align="left">
        You already have an account?
      </q-card-section>
    </form>
    <form class="col-2" align="right">
      <q-btn
        flat
        round
        dense
        icon="close"
        v-close-popup/>
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
    submitRegistration () {
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
