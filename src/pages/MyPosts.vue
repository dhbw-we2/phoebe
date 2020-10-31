<template>
  <q-page class="constrain q-pa-md">
    <q-card class="card-post-text q-mb-md" flat bordered v-for="post in myPosts">
      <PostView
        :key="post.id"
        :id="post.id"
        :caption="post.caption"
        :date="post.date"
        :text="post.text"
        :user="post.user"
        :tags="post.tags">
      </PostView>
      <q-card-actions align="stretch">
        <q-btn flat round icon="eva-trash-2-outline" v-on:click="deletePost(post.id)"/>
        <q-btn flat round icon="eva-edit-2-outline" v-on:click="editPost(post.id)"/>
      </q-card-actions>
    </q-card>
  </q-page>
</template>
<script>
import PostView from "components/PostView";

export default {
  data() {
    return {
      myPosts: [],
    }
  },
  components: {PostView},
  methods: {
    editPost(id) {
      this.$router.push({ name: 'editPost', params: {id: id}});
    },
    deletePost(id) {
      this.$firestore.collection("posts").doc(id).delete();
      this.getMyPosts();
    },
    loadPosts(snapshot) {
      if (snapshot.empty && snapshot.metadata.fromCache) {
        throw new Error('empty response');
      }
      this.myPosts = []
      snapshot.forEach((doc) => {
        const post = doc.data();
        post.id = doc.id;
        if(post.user == this.$fb.auth().currentUser.email){
          this.myPosts.push(post);
        }
      })
      this.loadingPosts = false;
    },
    getMyPosts() {
      // .where("user", "==", this.$fb.auth().currentUser.email)
      this.$firestore.collection("posts")
        .orderBy("date", "desc")
        .get().then(snapshot => this.loadPosts(snapshot));
    },
  },
  created() {
    this.getMyPosts();
  }
}
</script>
