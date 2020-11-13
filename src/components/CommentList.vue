<template>
  <div>
    <comment-view
      v-for="comment in comments"
      :key="comment.id"
      :id="comment.id"
      :text="comment.text"
      :user-ref="comment.user"
      :date="comment.date"
      :all-comments="queriedComments"
      :post="post"
      />
  </div>
</template>

<script>

import {postRef} from "src/services/firebase/db";

export default {
  name: "CommentList",
  components: {
    CommentView: () => import('components/CommentView')
  },
  props: {
    post: String,
    commentId: String,
    allComments: Array,
  },

  data() {
    return {
      comments: [],
      commentsQuery: Function,
      queriedComments: [],
    }
  },
  methods: {
    loadComments() {
      this.comments = []
      this.queriedComments.forEach((comment) => {
        if (comment.parentComment && comment.parentComment.id === this.commentId) {
          this.comments.push(comment)
        }
      })
    },
    createQuery() {
      this.clearQuery()
      let query = this.buildQuery();
      this.commentsQuery = query.onSnapshot(snapshot => this.onSnapshot(snapshot), (err) => {
        this.$q.notify({
          message: `Firebase Connection Failed! ${err}`,
          type: 'negative'
        })
      })
    },
    clearQuery() {
      this.commentsQuery()
    },
    buildQuery() {
      let query = this.$firestore.collection("comments").orderBy("date", "asc")
      if (this.post) {
        query = query.where("post", "==", postRef(this.post))
      }
      return query
    },
    onSnapshot(snapshot) {
      let comments = []
      snapshot.forEach((doc) => {
        let comment = doc.data();
        comment.id = doc.id
        comments.push(comment)
      })
      this.queriedComments = comments;
      this.comments = []
      comments.forEach((comment) => {
        if (!comment.parentComment) {
          this.comments.push(comment)
        }
      })
    }
  },
  created() {
    // Check if CommentList is a nested list
    if (!this.commentId) {
      // Is top list
      this.createQuery()
    } else {
      // Is nested list
      this.queriedComments = this.allComments
      this.loadComments()
    }
  },
  beforeDestroy(){
    this.clearQuery()
  }
}
</script>
