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
import DataFetchMixin from "src/mixins/DataFetchMixin";

export default {
  name: "CommentList",
  components: {
    CommentView: () => import('components/forum/comments/CommentView')
  },
  props: {
    post: String,
    commentId: String,
    inheritedComments: Array,
    allRatingData: Array
  },

  data() {
    return {
      comments: [],
      commentsQuery: Function,
      allComments: [],
      ratingData: [],
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    ...mapGetters('cache', ['userData', 'spotifyData'])
  },
  mixins: [DataFetchMixin],
  methods: {
    /**
     * fetches the up/down-votings of comments from the Post, of the current user
     */
    fetchCurrentUserRatings(commentRefs) {
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
    /**
     * using the comments query from buildQuery() a Snapshot
     * is created, which is send to onSnapshot(snapshot)
     * ! only if main Comment-list of Post
     */
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
    /**
     * clears the Value of commentsQuery
     */
    clearQuery() {
      this.commentsQuery()
    },
    /**
     * creates query of Comments of the Post this List is in
     * - which is ordered by date of creation
     * @returns the created query
     */
    buildQuery() {
      let query = commentCollection().orderBy("date", "asc")
      if (this.post) {
        query = query.where("post", "==", postRef(this.post))
      } else {
        throw new Error("Loaded comment list without post ID")
      }
      return query
    },
    /**
     * Filters the snapshot to only use the comments, which are from the right parent-component
     * allComments is set with an array with the filtered comments from the query
     *
     * @param snapshot = a snapshot of the comments query from buildQuery()
     */
    onSnapshot(snapshot) {
      let comments = []
      const userIDs = []
      const commentRefs = []
      snapshot.forEach((doc) => {
        let comment = doc.data({serverTimestamps: 'estimate'});
        comment.id = doc.id
        // Populate userIDs with all new users that have not been loaded yet //
        if (comment.user instanceof firestore.DocumentReference) {
          if (userIDs.indexOf(comment.user.id) === -1 &&
            !this.userData[comment.user.id]) {
            userIDs.push(comment.user.id)
          }
        }
        // Populate commentRefs array for fetching ratings //
        commentRefs.push(doc.ref)
        // Populate comments array //
        comments.push(comment)
      })

      // Load all user information into userData cache object //
      this.fetchUserData(userIDs)

      // Get current user ratings for all posts from database //
      if (this.$store.state.auth.isAuthenticated) {
        this.fetchCurrentUserRatings(commentRefs)
      }
      this.allComments = comments;
      this.loadTopLevelComments()
      this.$emit('comments-received')
    },
    /**
     * loads the first Comments of the Post so vue can render them
     */
    loadTopLevelComments() {
      this.comments = []
      this.allComments.forEach((comment) => {
        if (!comment.parentComment) {
          this.comments.push(comment)
        }
      })
    },
    /**
     * loads a nested-List of Comment under a other Comment so vue can render it
     */
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
  /**
   * distinction between if list is the main Comment-List of
   * the Post or a nested-List of Comments under a other Comment
   */
  created() {
    // Check if CommentList is a nested list
    if (!this.inheritedComments) {
      // Is top list
      this.createQuery()
    } else {
      // Is nested list
      this.ratingData = this.allRatingData
      this.loadSubComments()
    }
  },
  beforeDestroy() {
    this.clearQuery()
  },
  watch: {
    /**
     * checkes if new Comments got created
     */
    inheritedComments() {
      this.loadSubComments()
    }
  }

}
</script>
