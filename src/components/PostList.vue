<template>
  <div>
    <template v-if="!loadingSkeleton && posts.length">
      <post-view v-for="post in posts"
                 :key="post.id"
                 :id="post.id"
                 :caption="post.caption"
                 :date="post.date"
                 :text="post.text"
                 :user="post.user"
                 :tags="post.tags"
                 :date-edited="post.dateEdited"
                 @post-deleted="updateQuery">
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
import PostSkeleton from "components/PostSkeleton";
import PostView from "components/PostView";
import TagCreatorBar from "components/TagCreatorBar";

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
    }
  },
  props: {
    userFilter: String,
    default: []
  },
  watch: {
    tags: function () {
      this.updateQuery(this.tags);
    }
  },
  methods: {
    updateQuery() {
      this.loadingSkeleton = true;
      this.initialUpdate = true;
      this.clearQuery()
      let query = this.buildQuery();
      this.postQuery = query.onSnapshot(snapshot => {
        if (this.initialUpdate) {
          this.loadPosts(snapshot)
          this.initialUpdate = false;
        } else {
          this.showNewPostsNotification(snapshot)
        }
      }, () => {
        this.$q.notify({
          message: 'Firebase Connection Failed!',
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
        this.posts.push(post)
      })
      this.loadingSkeleton = false
    },
    showNewPostsNotification(snapshot) {
      this.newPostsNotify = this.$q.notify({
        color: "primary",
        message: "New Posts",
        position: "top",
        timeout: 0,
        actions: [
          {
            label: 'Update', color: 'white', handler: () => this.loadPosts(snapshot)
          }
        ]
      })
    },
    clearQuery () {
      this.postQuery()
      this.newPostsNotify()
    },
    buildQuery() {
      let query = this.$firestore.collection("posts").orderBy("date", "desc")
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
