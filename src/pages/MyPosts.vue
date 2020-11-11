<template>
  <q-page class="constrain q-pa-md">
    <PostList ref="postList"
              tag-filter
              :user-filter="getCurrentUserRef()"/>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/TagCreatorBar";
import PostList from "components/PostList";
import {userRef} from 'src/services/firebase/db';

export default {
  name: 'MyPosts',
  components: {PostList, TagCreatorBar},

  data() {
    return {}
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.postList.clearQuery()
    next();
  },
  methods:{
    getCurrentUserRef(){
      return userRef(this.$store.state.auth.uid)
    }
  }
}
</script>
