<template>
  <q-page class="constrain q-pa-md">
    <PostList ref="postList"
              tag-filter
              :user-filter="currentUserRef"/>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/forum/TagCreatorBar";
import PostList from "components/forum/posts/PostList";
import {mapGetters} from "vuex";

export default {
  name: 'MyPosts',
  components: {PostList, TagCreatorBar},

  data() {
    return {}
  },
  computed: {
    ...mapGetters('user', ['currentUserRef']),
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.postList.clearQuery()
    next();
  },
  created() {
    this.$changeLayoutColor('myposts')
  }
}
</script>
