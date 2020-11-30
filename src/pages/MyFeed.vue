<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      :tags="tags"
      change-to-subscribe
      placeholder="Filter Tags"
      icon="eva-funnel-outline"
      @remove-tag="removeTag($event)"/>
    <post-list
      ref="postList"
      :tags="tags"
      @tags-changed="tags = $event" />
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
    getSubscriptionTags() {
      this.tags = [...this.currentUser.subscribedTags]
    },
    removeTag(tag){
      this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayRemove(tag)
      })
    },
  },
  created() {
    this.getSubscriptionTags()
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.postList.clearQuery()
    next();
  },
}


</script>

