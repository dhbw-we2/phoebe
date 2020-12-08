<template>
  <div class="q-pl-lg">
    <comment-view
      v-for="comment in comments"
      :key="comment.id"
      :id="comment.id"
      :text="comment.text"
      :user="comment.user ? userData[comment.user.id] : {}"
      :date="comment.date"
      :all-comments="allComments"
      :post="post"
      :parent-comment="comment.parentComment"
      :all-user-data="userData"
      :initial-score="comment.score"
      :initial-rating="ratingData[comment.id]"
      :all-rating-data="ratingData"
    />
  </div>
</template>

<script>

import {commentCollection, commentRatingCollection, postRef} from "src/services/firebase/db";
import {firestore} from "firebase/app";
import {mapGetters} from "vuex";

export default {
  name: "CommentList",
  components: {
    CommentView: () => import('components/forum/comments/CommentView')
  },
  props: {
    post: String,
    commentId: String,
    inheritedComments: Array,
    allUserData: Array,
    allRatingData: Array
  },

  data() {
    return {
      comments: [],
      commentsQuery: Function,
      allComments: [],
      userData: [],
      ratingData: [],
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
  },
  methods: {
    fetchCurrentUserRatings(commentRefs){
      while (commentRefs.length > 0) {
        const commentRefsPart = commentRefs.splice(0, 10)
        commentRatingCollection().where('user', "==", this.currentUserRef)
          .where('comment', 'in', commentRefsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            // Set rating according to database //
            this.$set(this.ratingData, doc.data().comment.id, doc.data())
            // Remove this post from the temporary list //
            commentRefsPart.splice(commentRefsPart.findIndex(comment => comment.id === doc.data().comment.id), 1)
          })
          // Set all post that don't have a user rating to neutral to get them out of loading state//
          commentRefsPart.forEach(comment => {
            this.$set(this.ratingData, comment.id, {neutral: true})
          })
        })
      }
    },
    createQuery() {
      this.clearQuery()
      let query = this.buildQuery();
      this.commentsQuery = query.onSnapshot(snapshot => this.onSnapshot(snapshot), (err) => {
        console.error(err)
        this.$q.notify({
          message: `Firebase Connection Failed!`,
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
      } else {
        throw new Error("Loaded comment list without post ID")
      }
      return query
    },
    onSnapshot(snapshot) {
      let comments = []
      const userRefs = []
      const commentRefs = []
      snapshot.forEach((doc) => {
        let comment = doc.data({serverTimestamps: 'estimate'});
        comment.id = doc.id
        if (comment.user instanceof firestore.DocumentReference) {
          if ((userRefs.findIndex(user => user.id === comment.user.id) === -1) &&
            (this.userData.findIndex(user => user.uid === comment.user.id) === -1)) {
            userRefs.push(comment.user)
          }
        }
        // Populate commentRefs array for fetching ratings //
        commentRefs.push(doc.ref)
        // Populate comments array //
        comments.push(comment)
      })
      // Load all user information into userData object //
      userRefs.forEach(userRef => {
        userRef.get().then(doc => {
          this.$set(this.userData, userRef.id, doc.data())
        })
      })

      // Get current user ratings for all posts from database //
      if(this.$store.state.auth.isAuthenticated) {
        this.fetchCurrentUserRatings(commentRefs)
      }
      this.allComments = comments;
      this.loadTopLevelComments()
      this.$emit('comments-received')
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
      this.userData = this.allUserData
      this.ratingData = this.allRatingData
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
