<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      ref="subscriptionBox"
      :tags="tags"
      subscription-box
      placeholder="Add Tag"
      class="q-pb-md"/>
    <post-list
      ref="postList"
      v-if="hasSubscriptions"
      :tags="tags"
      @tag-clicked="$refs.subscriptionBox.addTag($event)">
      <template v-slot:tagTooltip="props">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[5, 5]" :delay="0"
                   content-class="bg-dark text-subtitle2">
          <span>Subscribe to </span>
          <span class="text-primary">#{{ props.tag }}</span>
        </q-tooltip>
      </template>
    </post-list>
    <template v-else>
      <h5 class="text-center text-grey-4">You have no tag subscriptions</h5>
    </template>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/forum/TagCreatorBar";
import PostList from "components/forum/posts/PostList";
import {mapGetters} from "vuex";

export default {
  name: "MyFeed",
  components: {PostList, TagCreatorBar},
  data(){
    return{
      tags: [],
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
    hasSubscriptions(){
      return this.currentUser && this.currentUser.subscribedTags.length > 0
    }
  },
  created() {
    this.$changeBackgroundColor('feed')
  },
  beforeRouteLeave(to, from, next) {
    if(this.$refs.postList){
      this.$refs.postList.clearQuery()
    }
    next();
  },
}
</script>
