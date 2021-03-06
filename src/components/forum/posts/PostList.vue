<template>
  <div>
    <template v-if="!loadingSkeleton && posts.length">
      <transition-group leave-active-class="zoom-leave-active">
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
                   :score="post.score"
                   :rating="ratingData[post.id]"
                   :spotify-item="spotifyData[`${post.spotifyItemType}_${post.spotifyItemId}`]"
                   :has-spotify-item="!!post.spotifyItemId"
                   @tag-clicked="$emit('tag-clicked', $event)">
          <template v-slot:tagTooltip="props">
            <slot name="tagTooltip" :tag="props.tag"/>
          </template>
        </post-view>
      </transition-group>
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
import {postCollection} from "src/services/firebase/db";
import {firestore} from "firebase/app"
import {mapGetters} from "vuex";
import DataFetchMixin from "src/mixins/DataFetchMixin";

export default {
  name: 'PostList',
  components: {TagCreatorBar, PostView, PostSkeleton},

  data() {
    return {
      posts: [],
      loadingSkeleton: true,
      pendingPosts: [],
      queryListener: Function,
      newPostsNotify: Function,
      newestSnapshot: Function,
      ratingData: [],
      lastDocVisible: null,
      pageSize: 10,
      lastPage: false,
      loadingNextPage: false,
      requestCode: 0,
      isInitialSnapshot: true
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
      this.refreshQuery();
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef', 'spotifyAuth']),
    ...mapGetters('cache', ['userData', 'spotifyData'])
  },
  mixins: [DataFetchMixin],
  methods: {
    /**
     * Handler for infinite scroll
     */
    onLoadMoreInView(e) {
      if (e.type === 'enter' && !this.loadingNextPage) {
        this.loadMorePosts()
      }
    },

    /**
     * Load next n=pageSize posts
     */
    async loadMorePosts() {
      const requestCode = this.requestCode
      this.loadingNextPage = true
      let query = this.buildQuery().limit(this.pageSize)
      if (this.lastDocVisible) {
        query = query.startAfter(this.lastDocVisible)
      }
      const snapshot = await query.get()
      if (requestCode === this.requestCode) {
        this.addPosts(snapshot)
        this.loadingNextPage = false
        if (this.posts.length > 0) {
          this.isInitialSnapshot = true
          this.listenForQuery(this.buildQuery().limit(this.posts.length))
        }
        // Hide the loading skeletons to reveal the posts  //
        this.loadingSkeleton = false
      }
    },
    /**
     * Replaces all posts with data from snapshot
     */
    replacePosts(snapshot) {
      this.posts = []
      this.addPosts(snapshot)
    },
    /**
     * Replaces a single post with data from firestore document
     * Starts fetching Spotify and rating data for new post
     */
    replacePost(doc) {
      const post = doc.data({serverTimestamps: 'estimate'})
      post.id = doc.id
      const index = this.posts.findIndex(oldPost => oldPost.id === post.id)
      this.$set(this.posts, index, post)
      if (post.spotifyItemType) {
        if (!this.spotifyData[`${post.spotifyItemType}_${post.spotifyItemId}`]) {
          this.fetchSpotifyData([{
            id: post.spotifyItemId,
            type: post.spotifyItemType
          }])
        }
      }
      this.fetchCurrentUserRating([doc.ref])
    },
    /**
     * Removes a Post from the list if it got deleted somewhere
     */
    removePost(doc) {
      const index = this.posts.findIndex(post => post.id === doc.id)
      this.posts.splice(index, 1)
    },
    /**
     * Creates a listener query of all the currently visible posts
     * Reacts differently to new, modified or removed posts
     */
    listenForQuery(query) {
      this.clearQuery()
      this.queryListener = query.onSnapshot(snapshot => {
        this.newestSnapshot = snapshot
        snapshot.docChanges().forEach(change => {
          switch (change.type) {
            case 'added':
              if (!this.isInitialSnapshot && change.newIndex === 0) {
                this.showNewPostsNotification()
              }
              break
            case 'modified':
              this.replacePost(change.doc)
              break
            case 'removed':
              this.removePost(change.doc)
              break
          }
        })
        this.isInitialSnapshot = false
      })
    },
    /**
     * Called on page load and tags change
     * Query is reset and the first page is loaded
     */
    async refreshQuery() {
      this.clearQuery()
      this.loadingSkeleton = true
      this.isInitialSnapshot = true
      this.posts = []
      this.lastDocVisible = null
      this.requestCode += 1
      await this.loadMorePosts()
    },
    /**
     * Adds new post to the list
     */
    addPosts(snapshot) {
      if (!snapshot.empty) {
        this.lastDocVisible = snapshot.docs[snapshot.docs.length - 1]
        this.lastPage = snapshot.docs.length < this.pageSize;
      } else {
        this.lastPage = true
        return
      }

      const userIDs = []
      const postRefs = []
      const spotifyItems = []
      // Traverse through query snapshot and extract data //
      snapshot.forEach((doc) => {
        const post = doc.data()
        // Set document id as field //
        post.id = doc.id
        // Populate userIDs with all new users that have not been loaded yet //
        if (post.user instanceof firestore.DocumentReference) {
          if (userIDs.indexOf(post.user.id) === -1 &&
            !this.userData[post.user.id]) {
            userIDs.push(post.user.id)
          }
        }
        // Populate postRefs array for fetching ratings //
        postRefs.push(doc.ref)

        // Populate spotifyItems with all new items //
        if (post.spotifyItemId) {
          if (!spotifyItems.some(item => item.id === post.spotifyItemId) &&
            !this.spotifyData[`${post.spotifyItemType}_${post.spotifyItemId}`]) {
            spotifyItems.push({id: post.spotifyItemId, type: post.spotifyItemType})
          }
        }

        // Populate posts array //
        this.posts.push(post)
      })

      // Load all user information into userData cache object //
      this.fetchUserData(userIDs)
      if (this.$store.state.auth.isAuthenticated) {
        // Get current user ratings for all posts from database //
        this.fetchCurrentUserRating(postRefs)
        if (this.spotifyAuth) {
          // Load all spotify item data into cache//
          this.fetchSpotifyData(spotifyItems)
        }
      }
    },

    /**
     * If new Posts are available and user clicks the notification the new posts are loaded from the top
     */
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
      this.queryListener()
      this.newPostsNotify()
    },
    /**
     * Creates a query of posts and filters it, if filters are set
     * @returns the created query
     */
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
    this.refreshQuery()
  },
}
</script>
