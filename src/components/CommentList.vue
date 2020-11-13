<template>
  <div >
    <comment
      @comment-deleted="deleteComment"
      v-for="comment in comments"
      :key="comment.id"
      :id="comment.id"
      :text="comment.text"
      :user="comment.user"
      :date="comment.date"
      :comments="comment.comments"
    >
    </comment>
  </div>
</template>

<script>

export default {
  name: "CommentList",
  components: {
    Comment: () => import('components/Comment')
  },
  props: {
    commentsFromParent: Array,
  },
  data() {
    return {
      comments: [],
    }
  },
  methods: {
    deleteComment(commentID){
      this.comments.splice(this.commentsFromParent.indexOf(commentID),1)
      this.commentsFromParent.splice(this.commentsFromParent.indexOf(commentID),1)
      this.$emit('deleteComment', this.commentsFromParent)
    },
    getComments(){
      this.buildQuery()
    },
    buildQuery(){
      if(this.commentsFromParent){
        this.commentsFromParent.forEach(commentID => {
          this.getSubComment(commentID)
        })
      }
    },
    getSubComment(commentID){
      if(commentID != null){
        let queryOfComment = this.$firestore.collection("comments").doc(commentID)
        queryOfComment.onSnapshot(commentSnapshot => {
          let comment =  commentSnapshot.data()
          if(comment){
            comment.id = commentID
            this.comments.push(comment)
          }
        })
      }
    },
  },
  created() {
    this.getComments();
  },
}

</script>
