<template>
  <q-page class="constrain q-pa-md">
    <template v-if="!loadingPosts && posts.length">
      <PostView v-for="post in posts"
                :key="post.id"
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
      loadingPosts: false,
    }
  },
  component: {
    'loadingScreen': require('pages/PageloadingPosts.vue').default
  },
  methods: {
    getPosts() {
      this.loadingPosts = true
      this.$firestore.collection("posts").get().then(snapshot => {
        if (snapshot.empty && snapshot.metadata.fromCache) {
          throw new Error('empty response');
        }
        snapshot.forEach((doc) => {
          this.posts.push(doc.data())
        })
      }).catch(err => {
        this.$q.notify({
          message: 'Firebase Connection Failed!',
          type: 'negative'
        })
      }).finally(() => {
        this.loadingPosts = false
      })
    }
  },
  created() {
    this.getPosts()
  }
}
</script>


