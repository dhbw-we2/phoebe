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
                 :initial-score="post.score"
                 :initial-rating="ratingData[post.id]"
                 :spotify-item="spotifyData[`${post.spotifyItemType}_${post.spotifyItemId}`]"
                 @tag-clicked="$emit('tag-clicked', $event)">
        <template v-slot:tagTooltip="props">
          <slot name="tagTooltip" :tag="props.tag"/>
        </template>
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
import {postCollection, postRatingCollection, userCollection} from "src/services/firebase/db";
import {firestore} from "firebase/app"
import {mapGetters} from "vuex";

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
      ratingData: [],
      spotifyData: [],
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
      this.refreshQuery();
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
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
      const postRefs = []
      const spotifyItems = []
      // Traverse through query snapshot and extract data //
      snapshot.forEach((doc) => {
        const post = doc.data()
        // Set document id as field //
        post.id = doc.id
        // Populate userIDs with all new users that have not been loaded yet //
        if (post.user instanceof firestore.DocumentReference) {
          if ((userIDs.findIndex(userID => userID === post.user.id) === -1) &&
            (this.userData.findIndex(user => user.uid === post.user.id) === -1)) {
            userIDs.push(post.user.id)
          }
        }
        // Populate postRefs array for fetching ratings //
        postRefs.push(doc.ref)

        // Populate spotifyItems with all new items //
        if ((spotifyItems.findIndex(item => item.id === post.spotifyItemId) === -1) &&
          (this.spotifyData.findIndex(item => item.id === post.spotifyItemId) === -1)) {
          spotifyItems.push({id: post.spotifyItemId, type: post.spotifyItemType})
        }

        // Populate posts array //
        this.posts.push(post)
      })

      // Load all user information into userData object //
      while (userIDs.length > 0) {
        const userIDsPart = userIDs.splice(0, 10)
        userCollection().where(firestore.FieldPath.documentId(), "in", userIDsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            this.$set(this.userData, doc.id, doc.data())
          })
        })
      }

      // Get current user ratings for all posts from database //
      if (this.$store.state.auth.isAuthenticated) {
        this.fetchCurrentUserRatings(postRefs)
        if (this.currentUser.spotifyAccessToken) {
          this.fetchSpotifyData(spotifyItems)
        }
      }

      // Hide the loading skeletons to reveal the posts  //
      this.loadingSkeleton = false
    },
    /**
     * Fetch spotify information and save to spotifyData array
     * @param spotifyItems
     */
    fetchSpotifyData(spotifyItems) {
      const trackIDs = [], albumIDs = []
      spotifyItems.forEach(item => {
        switch (item.type) {
          case 'track':
            trackIDs.push(item.id)
            break;
          case 'album':
            albumIDs.push(item.id)
            break;
        }
      })
      while (trackIDs.length > 0) {
        const trackIDsPart = trackIDs.splice(0, 50)
        this.$spotify.getTracks(trackIDsPart).then(trackItems => {
          trackItems.forEach(trackItem => {
            this.$set(this.spotifyData, `track_${trackItem.id}`, trackItem)
          })
        })
      }
      while (albumIDs.length > 0) {
        const albumIDsPart = albumIDs.splice(0, 50)
        this.$spotify.getAlbums(albumIDsPart).then(albumItems => {
          albumItems.forEach(albumItem => {
            this.$set(this.spotifyData, `album_${albumItem.id}`, albumItem)
          })
        })
      }
    },
    fetchCurrentUserRatings(postRefs) {
      while (postRefs.length > 0) {
        const postRefsPart = postRefs.splice(0, 10)
        postRatingCollection().where('user', "==", this.currentUserRef)
          .where('post', 'in', postRefsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            // Set rating according to database //
            this.$set(this.ratingData, doc.data().post.id, doc.data())
            // Remove this post from the temporary list //
            postRefsPart.splice(postRefsPart.findIndex(post => post.id === doc.data().post.id), 1)
          })
          // Set all post that don't have a user rating to neutral to get them out of loading state//
          postRefsPart.forEach(post => {
            this.$set(this.ratingData, post.id, {neutral: true})
          })
        })
      }
    }
    ,
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
    }
    ,
    clearQuery() {
      this.postQuery()
      this.newPostsNotify()
    }
    ,
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
