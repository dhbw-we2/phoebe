<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'Home',
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  created() {
    if (this.$store.state.auth.isAuthenticated) {
      if (this.currentUser.subscribedTags && this.currentUser.subscribedTags.length > 0) {
        this.$router.push({name: 'feed'})
      } else {
        this.$router.push({name: 'forum'})
      }
    } else {
      this.$router.push({name: 'forum'})
    }
  }
}
</script>
