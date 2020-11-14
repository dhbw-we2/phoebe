<template>
    <div>
      <comment-view
        v-for="comment in comments"
        :key="comment.id"
        :id="comment.id"
        :text="comment.text"
        :user-ref="comment.user"
        :date="comment.date"
        :all-comments="allComments"
        :post="post"
        :parent-comment="comment.parentComment"
      />
    </div>
</template>

<script>

import {commentCollection, postRef} from "src/services/firebase/db";
export default {
  name: "CommentList",
  components: {
    CommentView: () => import('components/forum/comments/CommentView')
  },
  props: {
    post: String,
    commentId: String,
    inheritedComments: Array,
  },

  data() {
    return {
      comments: [],
      commentsQuery: Function,
      allComments: [],
    }
  },
  methods: {
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
      let query = commentCollection().orderBy("date", "asc")
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
      this.allComments = comments;
      this.loadTopLevelComments()
      this.$emit('comments-loaded')
    },
    loadTopLevelComments() {
      this.comments = []
      this.allComments.forEach((comment) => {
        if (!comment.parentComment) {
          this.comments.push(comment)
        }
      })
    },
    loadSubComments() {
      this.allComments = this.inheritedComments
      this.comments = []
      this.allComments.forEach((comment) => {
        if (comment.parentComment && comment.parentComment.id === this.commentId) {
          this.comments.push(comment)
        }
      })
    }
  },
  created() {
    // Check if CommentList is a nested list
    if (!this.inheritedComments) {
      // Is top list
      this.createQuery()
    } else {
      // Is nested list
      this.loadSubComments()
    }
  },
  beforeDestroy() {
    this.clearQuery()
  },
  watch: {
    inheritedComments() {
      this.loadSubComments()
    }
  }

}
</script>
