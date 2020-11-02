<template>
  <q-page class="constrain q-pa-md">
    <div class="q-pb-md">
      <tag-creator-bar ref="tagCreator"
                       @tags-changed="searchForTags"
                       placeholder="Search for Tags"
                       icon="eva-search-outline">
      </tag-creator-bar>
    </div>
    <template v-if="!loadingPosts && posts.length">
      <PostView v-for="post in posts"
                :key="post.id"
                :id="post.id"
                :caption="post.caption"
                :date="post.date"
                :text="post.text"
                :user="post.user"
                :tags="post.tags">
      </PostView>
    </template>
    <template v-else-if="!loadingPosts && !posts.length">
      <h5 class="text-center text-grey">Nothing to see here.</h5>
    </template>
    <template v-else>
      <pageloading-posts/>
    </template>
  </q-page>
</template>

<script>
import {date} from 'quasar'
import PageloadingPosts from "pages/PageloadingPosts";
import PostView from "components/PostView";
import TagCreatorBar from "components/TagCreatorBar";
import notify from "boot/notify";

export default {
  name: 'PageHome',
  components: {TagCreatorBar, PostView, PageloadingPosts},
  data() {
    return {
      posts: [],
      loadingPosts: true,
      initialUpdate: true,
      tags: [],
      pendingPosts: [],
      postListener: Function,
      newPostsNotify: Function,
      canShowNewPostsNotify: false,
    }
  },
  component: {
    'loadingScreen': require('pages/PageloadingPosts.vue').default
  },
  methods: {
    searchForTags(tags) {
      if (tags.length > 0) {
        this.loadingPosts = true;
        this.$refs.tagCreator.$data.loading = true;
        this.$firestore.collection("posts")
          .orderBy("date", "desc")
          .where("tags", "array-contains-any", tags)
          .get().then(snapshot => this.loadPosts(snapshot))
      } else {
        this.getAllPosts()
      }
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
      this.loadingPosts = false
    },
    getAllPosts() {
      this.$firestore.collection("posts")
        .orderBy("date", "desc").get()
        .then(snapshot => this.loadPosts(snapshot))
        .catch(err => {
          this.$q.notify({
            message: 'Firebase Connection Failed!',
            type: 'negative'
          })
        })
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
  },
  created() {
    this.getAllPosts()
    this.postListener = this.$firestore.collection('posts')
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
          if (this.canShowNewPostsNotify) {
            this.showNewPostsNotification(snapshot)
          }
        }
      )
    setTimeout(() => {
      this.canShowNewPostsNotify = true;
    }, 500)
  }
  ,
  beforeDestroy() {
    this.postListener()
    this.newPostsNotify()
  }
}
</script>


