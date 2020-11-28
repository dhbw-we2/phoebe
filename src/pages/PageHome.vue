<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      :tags="tags"
      placeholder="Filter Tags"
      icon="eva-funnel-outline"
      allow-subscribe/>
    <PostList
      ref="postList"
      :tags="tags"
      @tags-changed="tags = $event"
    />

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
}
</script>


