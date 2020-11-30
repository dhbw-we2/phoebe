<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      :tags="tags"
      subscription-box
      placeholder="Add Tag Subscription"
      @remove-tag="removeTag($event)"
      class="q-pb-md"/>
    <post-list
      ref="postList"
      v-if="currentUser.subscribedTags && currentUser.subscribedTags.length > 0"
      :tags="tags"
      @tags-changed="tags = $event" />
    <template v-else>
      <h5 class="text-center text-grey-4">You have no tag subscriptions</h5>
    </template>
  </q-page>
</template>

<script>
import TagCreatorBar from "components/forum/TagCreatorBar";
import PostList from "components/forum/posts/PostList";
import {mapGetters} from "vuex";
import * as firebase from 'firebase/app';

export default {
  name: "MyFeed",
  components: {PostList, TagCreatorBar},
  data(){
    return{
      tags: [],
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
  },
  methods: {
    removeTag(tag){
      this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayRemove(tag)
      })
    },
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
