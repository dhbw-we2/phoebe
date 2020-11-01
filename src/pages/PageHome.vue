<template>
  <q-page class="constrain q-pa-md">
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

export default {
  name: 'PageHome',
  components: {PostView, PageloadingPosts},
  data() {
    return {
      posts: [],
      loadingPosts: true,
      initialUpdate: true,
    }
  },
  component: {
    'loadingScreen': require('pages/PageloadingPosts.vue').default
  },
  methods: {
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
    getPosts() {
      this.$firestore.collection("posts").orderBy("date", "desc").get().then(snapshot => this.loadPosts(snapshot))
        .catch(err => {
          this.$q.notify({
            message: 'Firebase Connection Failed!',
            type: 'negative'
          })
        }).finally(() => {
        this.$firestore.collection('posts').orderBy("date", "desc").onSnapshot((snapshot) => {
          this.showNewPostsNotification(snapshot)
        });
      })
    },
    showNewPostsNotification(snapshot) {
      if (!this.initialUpdate) {
        this.$q.notify({
          color: "primary",
          message: "New Post",
          position: "top",
          timeout: 0,
          actions: [
            {
              label: 'Update', color: 'white', handler: () => this.loadPosts(snapshot)
            }
          ]
        })
      } else {
        this.initialUpdate = false;
      }
    },
  },
  created() {
    this.getPosts()
  }
}
</script>


