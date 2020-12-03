<template>
  <div>
    <template v-if="!loadingSkeleton && posts.length">
      <post-view v-for="post in posts"
                 :key="post.id"
                 :id="post.id"
                 :caption="post.caption"
                 :date="post.date"
                 :text="post.text"
                 :user="userData[post.user.id]"
                 :uid="post.user.id"
                 :tags="post.tags"
                 :date-edited="post.dateEdited"
                 :upvotes="post.upvotes"
                 :downvotes="post.downvotes"
                 @tag-clicked="tags.length = 0; tags.push($event)">
      </post-view>
    </template>
    <template v-else-if="!loadingSkeleton && !posts.length">
      <h5 class="text-center text-grey-4">Nothing to see here.</h5>
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
import {firestore} from "firebase/app"

export default {
  name: 'PostList',
  components: {TagCreatorBar, PostView, PostSkeleton},

  data() {
    return {
      posts: [],
      loadingSkeleton: true,
      initialUpdate: true,
      pendingPosts: [],
      postQuery: Function,
      newPostsNotify: Function,
      canShowNewPostsNotify: true,
      newestSnapshot: Function,
      userData: [],
    }
  },
  props: {
    userFilter: Object,
    tags: {
      type: Array,
      default: function () {
        return []
      }
    },
  },
  watch: {
    tags: function () {
      this.$emit("tags-changed", this.tags)
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
        console.error(err)
        this.$q.notify({
          message: `Firebase Connection Failed!`,
          type: 'negative'
        })
      })
    },
    loadPosts(snapshot) {
      if (snapshot.empty && snapshot.metadata.fromCache) {
        throw new Error('empty response');
      }
      this.posts = []
      const userRefs = []
      snapshot.forEach((doc) => {
        const post = doc.data()
        post.id = doc.id
        if (post.user instanceof firestore.DocumentReference) {
          if ((userRefs.findIndex(user => user.id === post.user.id) === -1) &&
            (this.userData.findIndex(user => user.uid === post.user.id) === -1)) {
            userRefs.push(post.user)
          }
        }
        this.posts.push(post)
      })
      // Load all user information into userData object //
      userRefs.forEach(userRef => {
        userRef.get().then(doc => {
          this.$set(this.userData, userRef.id, doc.data())
        })
      })
      // Hide the loading skeletons to reveal the posts  //
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
