<template>
  <q-page class="constrain q-pa-md">
    <PostList ref="postList"
              tag-filter/>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/forum/TagCreatorBar";
import PostList from "components/forum/posts/PostList";

export default {
  name: 'PageHome',
  components: {PostList, TagCreatorBar},

  data() {
    return {}
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.postList.clearQuery()
    next();
  },
  created() {
    this.$changeBackgroundColor('forum')
  }
}
</script>


