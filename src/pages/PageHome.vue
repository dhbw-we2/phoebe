<template>
  <q-page class="constrain q-pa-md">
    <div class="q-pb-md">
      <tag-creator-bar ref="searchBar"
                       @tags-changed="$refs.postList.$data.tags = $event"
                       placeholder="Search for Tags"
                       icon="eva-search-outline">
      </tag-creator-bar>
    </div>
    <PostList ref="postList"/>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/TagCreatorBar";
import PostList from "components/PostList";

export default {
  name: 'PageHome',
  components: {PostList, TagCreatorBar},

  data() {
    return {}
  },
}
</script>


