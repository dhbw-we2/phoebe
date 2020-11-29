<template>
  <q-page class="constrain q-pa-md">
    <tag-creator-bar
      :tags="tags"
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
import {postCollection} from "src/services/firebase/db";
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
      this.tags = this.currentUser.subscribedTags
    },
    showPosts(){
      let query = postCollection().orderBy("date", "asc")
      if(this.tags.length > 0){
        query = query.where("tags", "array-contains-any", this.tags )
      }
    },
    removeTag(tag){
      console.log('hey')
      this.currentUserRef.update({
        subscribedTags: firebase.firestore.FieldValue.arrayRemove(...tag)
      })
    },
  },
  created() {
    this.getSubscriptionTags()
    this.showPosts()
  },
}


</script>

