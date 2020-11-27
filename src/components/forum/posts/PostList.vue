<template>
  <div>
    <tag-creator-bar v-if="tagFilter"
                     ref="searchBar"
                     v-bind:tags="tags"
                     placeholder="Filter Tags"
                     icon="eva-funnel-outline">
    </tag-creator-bar>
    <q-card-actions align="right">
      <div class="q-gutter-sm">
        <q-btn
          color='negative'
          unelevated rounded filled
          icon-right="eva-plus-outline"
          v-on:click="subscribeTo()"
          v-if="tags.length > 0"
          label="SUBSCRIBE"
          class="q-mb-sm q-pa-xs">
        </q-btn>
      </div>
    </q-card-actions>
    <template v-if="!loadingSkeleton && posts.length">
      <post-view v-for="post in posts"
                 :key="post.id"
                 :id="post.id"
                 :caption="post.caption"
                 :date="post.date"
                 :text="post.text"
                 :user-ref="post.user"
                 :tags="post.tags"
                 :date-edited="post.dateEdited"
                 @tag-clicked="tags = [$event]">
      </post-view>
    </template>
    <template v-else-if="!loadingSkeleton && !posts.length">
      <h5 class="text-center text-grey">Nothing to see here.</h5>
    </template>
    <template v-else>
      <post-skeleton/>
      <post-skeleton/>
      <post-skeleton/>
    </template>
  </div>
</template>

<script>
import PostSkeleton from "components/forum/posts/PostSkeleton";
import PostView from "components/forum/posts/PostView";
import TagCreatorBar from "components/forum/TagCreatorBar";
import {postCollection} from "src/services/firebase/db";

export default {
  name: 'PostList',
  components: {TagCreatorBar, PostView, PostSkeleton},

  data() {
    return {
      posts: [],
      loadingSkeleton: true,
      initialUpdate: true,
      tags: [],
      pendingPosts: [],
      postQuery: Function,
      newPostsNotify: Function,
      canShowNewPostsNotify: true,
      newestSnapshot: Function
    }
  },
  props: {
    tagFilter: Boolean,
    userFilter: Object,
  },
  watch: {
    tags: function () {
      this.updateQuery();
    }
  },
  methods: {
    updateQuery() {
      this.loadingSkeleton = true;
      this.initialUpdate = true;
      this.clearQuery()
      let query = this.buildQuery();
      this.postQuery = query.onSnapshot(snapshot => {
        this.newestSnapshot = snapshot
        if (this.initialUpdate) {
          this.loadPosts(snapshot)
          this.initialUpdate = false;
        } else {
          let newPosts = false;
          snapshot.docChanges().forEach((change) => {
            if (['added', 'modified'].indexOf(change.type) !== -1) {
              newPosts = true
            }
          })
          if (newPosts) {
            this.showNewPostsNotification()
          }
        }

      }, (err) => {
        this.$q.notify({
          message: `Firebase Connection Failed! ${err}`,
          type: 'negative'
        })
      })
    },
    loadPosts(snapshot) {
      if (snapshot.empty && snapshot.metadata.fromCache) {
        throw new Error('empty response');
      }
      this.posts = []
      snapshot.forEach((doc) => {
        const post = doc.data()
        post.id = doc.id
        if(typeof(post.user) !== 'object'){
          post.user = null
        }
        this.posts.push(post)
      })
      this.loadingSkeleton = false
    },
    showNewPostsNotification() {
      this.newPostsNotify = this.$q.notify({
        color: "primary",
        message: "New Posts",
        position: "top",
        timeout: 0,
        actions: [
          {
            label: 'Update', color: 'white', handler: () => this.loadPosts(this.newestSnapshot)
          }
        ]
      })
    },
    clearQuery() {
      this.postQuery()
      this.newPostsNotify()
    },
    subscribeTo(){

    },
    buildQuery() {
      let query = postCollection().orderBy("date", "desc")
      if (this.userFilter) {
        query = query.where('user', '==', this.userFilter)
      }
      if (this.tags.length > 0) {
        query = query.where("tags", "array-contains-any", this.tags)
      }
      return query
    }
  },
  created() {
    this.updateQuery()
  },
}
</script>
