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
      <post-skeleton v-if="!lastPage" v-view="onLoadMoreInView"/>
      <div v-else class="column items-center">
        <h5 class="text-center text-grey-4 q-my-md">You have reached the end 🏁</h5>
        <q-btn rounded flat label="TRY AGAIN" icon="eva-refresh-outline" :loading="loadingNextPage"
               @click="loadMorePosts"></q-btn>
      </div>
    </template>
    <template v-else-if="!loadingSkeleton && !posts.length">
      <h5 class="text-center text-grey-4 q-my-md">Nothing to see here 👀</h5>
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
import {postCollection, userCollection} from "src/services/firebase/db";
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
      lastDocVisible: null,
      pageSize: 10,
      lastPage: false,
      loadingNextPage: false
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
      this.refreshQuery();
    }
  },
  methods: {
    onLoadMoreInView(e) {
      if (e.type === 'enter' && !this.loadingNextPage) {
        this.loadMorePosts()
      }
    },
    loadMorePosts() {
      this.loadingNextPage = true
      let query = this.buildQuery()
      if (this.lastDocVisible) {
        query = query.startAfter(this.lastDocVisible)
      }
      query.get().then(snapshot => {
        this.addPosts(snapshot)
        this.loadingNextPage = false
      })
    },
    replacePosts(snapshot) {
      this.posts = []
      this.addPosts(snapshot)
    },
    listenForQuery(query) {
      this.postQuery = query.onSnapshot(snapshot => {
        this.newestSnapshot = snapshot
        if (this.initialUpdate) {
          this.replacePosts(snapshot)
          this.initialUpdate = false;
        } else {
          let newPosts = false;
          snapshot.docChanges().forEach((change) => {
            switch (change.type) {
              case 'modified':
                newPosts = true
                break
              case 'added':
                if (change.newIndex !== this.pageSize - 1 && !change.doc.metadata.hasPendingWrites) newPosts = true
                break
              default:
                break
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
    refreshQuery() {
      this.loadingSkeleton = true;
      this.initialUpdate = true;
      this.clearQuery()
      this.listenForQuery(this.buildQuery())
    },
    addPosts(snapshot) {
      if (snapshot.empty && snapshot.metadata.fromCache) {
        throw new Error('empty response');
      }
      if (snapshot.docs.length > 0) {
        this.lastDocVisible = snapshot.docs[snapshot.docs.length - 1]
      }
      this.lastPage = snapshot.docs.length < this.pageSize;

      const userIDs = []
      snapshot.forEach((doc) => {
        const post = doc.data()
        post.id = doc.id
        // Populate userIDs with all users visible in post list //
        if (post.user instanceof firestore.DocumentReference) {
          if ((userIDs.findIndex(userID => userID === post.user.id) === -1) &&
            (this.userData.findIndex(user => user.uid === post.user.id) === -1)) {
            userIDs.push(post.user.id)
          }
        }
        // Populate posts array //
        this.posts.push(post)
      })

      // Load all user information into userData object //
      while (userIDs.length > 0) {
        const userRefsPart = userIDs.splice(0, 10)
        userCollection().where(firestore.FieldPath.documentId(), "in", userRefsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            this.$set(this.userData, doc.id, doc.data())
          })
        })
      }

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
            label: 'Update', color: 'white', handler: () => {
              window.scrollTo({top: 0, behavior: 'auto'})
              this.replacePosts(this.newestSnapshot)
            }
          }
        ]
      })
    },
    clearQuery() {
      this.postQuery()
      this.newPostsNotify()
    },
    buildQuery() {
      let query = postCollection().orderBy("date", "desc").limit(this.pageSize)
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
    this.refreshQuery()
  },
}
</script>
