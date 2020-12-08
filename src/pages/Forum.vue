<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      allow-subscribe
      :tags="tags"
      placeholder="Filter Tags"
      icon="eva-funnel-outline"
      class="q-pb-md"/>
    <PostList
      ref="postList"
      :tags="tags"
      @tag-clicked="tags = [$event]"/>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/forum/TagCreatorBar";
import PostList from "components/forum/posts/PostList";

export default {
  name: 'PageHome',
  components: {PostList, TagCreatorBar},

  data() {
    return {
      tags: [],
    }
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


