<template>
  <q-slide-transition appear :duration=150 @show="onTransitionEnd">
    <div ref="commentView" class="scroll-margin-navbar">
        <q-card-section horizontal>
          <q-card-actions vertical class="justify-center">
            <q-icon name="eva-corner-down-right-outline" size="2em"/>
          </q-card-actions>
          <q-separator vertical inset="true"/>
          <q-card-section class="full-width q-pa-none">
            <q-card-section horizontal>
              <q-card-actions vertical class="q-pa-sm" style="min-width: 4em">
                <q-btn flat round icon="eva-arrow-ios-upward-outline" :disable="rating.disabled || downvoteLoading"
                       :loading="upvoteLoading" :color="alreadyUpvoted ? 'primary' : 'white'"
                       @click="vote(true)">
                  <template v-slot:loading>
                    <q-spinner-puff color="white"/>
                  </template>
                </q-btn>
                <span v-html="score" class="text-center text-h6"></span>
                <q-btn flat round icon="eva-arrow-ios-downward-outline" :disable="rating.disabled || upvoteLoading"
                       :loading="downvoteLoading" :color="alreadyDownvoted ? 'primary' : 'white'"
                       @click="vote(false)">
                  <template v-slot:loading>
                    <q-spinner-puff color="white"/>
                  </template>
                </q-btn>
              </q-card-actions>

              <q-card-section vertical class="q-pa-none full-width">
                <q-card-section horizontal>
                  <q-item class="q-pa-none q-pt-sm" vertical>
                    <q-item-section avatar>
                      <q-skeleton v-if="!user" type="QAvatar" size="50px"/>
                      <q-avatar v-else-if="user.profilePicture" size="50px">
                        <q-img :src="user.profilePicture" alt="Avatar"/>
                      </q-avatar>
                      <q-avatar v-else size="50px" color="primary" icon="eva-person-outline" text-color="white"/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-overline inline-block">
                        <span>Posted by u/</span>
                        <q-skeleton v-if="!user" type="rect" width="4em" height="1em"
                                    class="inline-block vertical-middle"/>
                        <span v-else>{{ user.username ? user.username : '[deleted]' }}</span>
                        <span> {{ timeSinceCommentCreated }}</span>
                        <span v-if="dateEdited"> (edited {{ timeSinceCommentEdited }})</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-space/>
                  <q-card-actions>
                    <q-btn flat round
                           icon="eva-trash-2-outline"
                           v-if="postedByCurrentUser()"
                           @click="deleteComment"/>
                    <q-btn flat rounded :label="$q.screen.xs ? '' : 'REPLY'"
                           icon="eva-message-circle-outline"
                           @click="replyToComment"
                           v-if="$store.state.auth.isAuthenticated && (text !== undefined)"
                    />
                  </q-card-actions>
                </q-card-section>
                <q-card-section v-html="(text ? text : '[removed]')" class="q-pl-none links-primary"/>
              </q-card-section>
            </q-card-section>
            <q-separator/>
          </q-card-section>
        </q-card-section>
        <q-slide-transition appear>
          <q-card-section v-if="replying" class="q-pa-none q-pt-sm">
            <text-editor
              ref="editor"
              placeholderText="Very interesting Comment"
              :text-input.sync="commentInput">
            </text-editor>
            <q-card-actions class="q-pr-none">
              <q-space/>
              <q-btn
                unelevated rounded
                color=positive
                label="SEND"
                icon="eva-paper-plane-outline"
                type="submit"
                @click="AddReply"
                :loading="submittingReply">
                <template v-slot:loading>
                  <q-spinner-dots/>
                </template>
              </q-btn>
            </q-card-actions>
          </q-card-section>
        </q-slide-transition>
      <q-card-section
        class="q-pa-none"
        v-if="hasSubComments && transitionEnded">
        <comment-list
          :post="post"
          :comment-id="id"
          :inherited-comments="allComments"
          :all-user-data="allUserData"
          :all-rating-data="allRatingData"/>
      </q-card-section>
    </div>
  </q-slide-transition>
</template>

<script>
import {mapGetters} from "vuex";
import {
  commentCollection, commentRatingCollection,
  commentRatingRef,
  commentRef,
  postRef
} from "src/services/firebase/db";
import {getTimeSincePostText} from "src/helpers/TimeHelper";
import {firestore} from "firebase/app";

export default {
  name: "CommentView",
  components: {
    TextEditor: () => import('components/forum/TextEditor'),
    CommentList: () => import('components/forum/comments/CommentList')
  },
  props: {
    id: String,
    text: String,
    user: Object,
    date: [Number, firestore.Timestamp],
    dateEdited: undefined,
    allComments: Array,
    post: String,
    parentComment: Object,
    allUserData: Array,
    initialScore: {
      type: Number,
      default: 0
    },
    initialRating: Object,
    allRatingData: Array,
  },
  data() {
    return {
      hasSubComments: false,
      replying: false,
      commentInput: "",
      now: firestore.Timestamp.now(),
      submittingReply: false,
      transitionEnded: false,
      score: 0,
      rating: {disabled: true},
      upvoteLoading: false,
      downvoteLoading: false
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    // Display the Time since this post was created
    timeSinceCommentCreated() {
      return getTimeSincePostText(this.date, this.now)
    },
    // Display the Time since this post was edited
    timeSinceCommentEdited() {
      return getTimeSincePostText(this.dateEdited, this.now)
    },
    sanitizedComment() {
      return this.commentInput.replace(/&nbsp;/g, '').trim()
    },
    alreadyUpvoted() {
      if (!this.rating.disabled && !this.rating.neutral) {
        return this.rating.positive
      }
    },
    alreadyDownvoted() {
      if (!this.rating.disabled && !this.rating.neutral) {
        return !this.rating.positive
      }
    }
  },
  watch: {
    /**
     * if new Sub-Comments exists or old got deleted
     */
    allComments() {
      this.checkForSubComments()
    },
    /**
     * checks if user is logged in so he can answer
     */
    currentUser() {
      if (!this.currentUser) {
        this.replying = false
      }
    },
    /**
     * sets params to data
     */
    initialRating() {
      this.rating = this.initialRating
    },
    /**
     * sets params to data
     */
    initialScore() {
      this.score = this.initialScore
    }
  },
  methods: {
    /**
     * updates the upvote-downvote score of the comment
     */
    async updateScore() {
      commentRef(this.id).get({source: 'server'}).then(doc => {
        this.score = doc.data().score
      })
      const query = await commentRatingCollection().where('user', "==", this.currentUserRef)
        .where('comment', '==', commentRef(this.id)).get()
      if (!query.empty) {
        this.rating = query.docs[0].data()
      } else {
        this.rating = {neutral: true}
      }
    },
    /**
     * upvote or downvote / undo upvote or undo downvote
     */
    async vote(positive) {
      if (positive) this.upvoteLoading = true
      else this.downvoteLoading = true

      try {
        // Define default values //
        let voteValue = 1
        let removeRating = false
        // Check for current rating and adjust magnitude of vote value //
        const currentRatingDoc = await commentRatingRef(`${this.currentUser.uid}_${this.id}`).get()
        if (currentRatingDoc.exists) {
          if (currentRatingDoc.data().positive === positive) {
            voteValue = -1
            removeRating = true
          } else {
            voteValue = 2
          }
        }
        // Begin transaction to update multiple documents at the same time //
        const batch = this.$firestore.batch()

        // Update counter in comment according to current state //
        batch.update(commentRef(this.id), {score: firestore.FieldValue.increment(positive ? voteValue : -voteValue)})
        if (removeRating) {
          batch.delete(commentRatingRef(`${this.currentUser.uid}_${this.id}`))
        } else {
          batch.set(commentRatingRef(`${this.currentUser.uid}_${this.id}`), {
            comment: commentRef(this.id),
            user: this.currentUserRef,
            positive: positive
          })
        }

        // Commit the transaction //
        await batch.commit()

      } catch (e) {
        if (e.code === 'permission-denied') {
          console.error('Tried to vote with illegal value')
        } else {
          console.error(e)
        }
      } finally {
        await this.updateScore()
        this.upvoteLoading = false
        this.downvoteLoading = false
      }
    },
    onTransitionEnd() {
      this.transitionEnded = true
    },
    /**
     * adds a new comment to the DB after the user typed the comment and clicked the submit button.
     */
    AddReply() {
      if (!this.sanitizedComment.replace(/<\/?[^>]+(>|$)/g, "")) {
        this.$q.notify({
          type: 'negative',
          message: `Cannot post empty comment`
        })
        return
      }
      this.submittingReply = true
      this.replying = false
      commentCollection().add({
        date: firestore.FieldValue.serverTimestamp(),
        user: this.currentUserRef,
        text: this.sanitizedComment,
        parentComment: commentRef(this.id),
        post: postRef(this.post)
      }).then(() => {
        this.commentInput = ''
      }).catch(err => {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: `Failed to post comment!`
        })
        this.replying = true
      }).finally(() => {
        this.submittingReply = false;
      })
    },
    /**
     * opens or closes the answering editor depending when the answering button is clicked
     */
    replyToComment() {
      this.replying = !this.replying
      if (this.replying) {
        this.$refs.commentView.scrollIntoView({block: 'start', behavior: 'smooth'});
        //Focus text editor if device is non-touch
        if (!this.$q.platform.has.touch) {
          setTimeout(() => {
            if (this.$refs.editor) this.$refs.editor.$refs.editor.focus()
          }, 500)
        }
      }
    },
    /**
     * deletes the comment in the DB, but only if in the recursive tree there is no other comment depending on it.
     * if there is, the comment is replaced by a dummy-Comment
     */
    deleteComment() {
      this.$q.dialog({
        title: 'Delete comment',
        message: 'Do you really want to delete this comment?',
        position: "top",
        cancel: "No",
        ok: 'Yes',
        color: 'primary'
      }).onOk(() => {
        if (this.hasSubComments) {
          commentCollection().where('parentComment', '==', commentRef(this.id)).get().then(querySnapshot => {
            if (querySnapshot.size > 0) {
              commentRef(this.id).update({
                user: firestore.FieldValue.delete(),
                text: firestore.FieldValue.delete(),
                dateEdited: firestore.FieldValue.delete(),
                removed: true
              })
            }
          })
        } else {
          this.recursiveDelete(this.parentComment)
          commentRef(this.id).delete();
        }
      })
    },
    /**
     * handles the recursive part of deleting a post
     */
    recursiveDelete(parentComment) {
      if (parentComment) {
        const parentIndex = this.allComments.findIndex(comment => comment.id === parentComment.id)
        if (parentIndex !== -1) {
          if (!this.allComments[parentIndex].text) {
            this.recursiveDelete(this.allComments[parentIndex].parentComment)
          }
        }
        if (!this.allComments[parentIndex].text) {
          commentRef(parentComment.id).delete()
        }
      }
    },
    /**
     * checks if the Comment has sub-comments
     */
    checkForSubComments() {
      let subComments = false
      this.allComments.every((comment) => {
        if (comment.parentComment && comment.parentComment.id === this.id) {
          subComments = true;
          return true
        } else {
          return true
        }
      })
      this.hasSubComments = subComments
    },
    /**
     * updates var now to the current date and calls scheduleUpdateNow()
     */
    updateNow() {
      this.now = firestore.Timestamp.now();
      this.scheduleUpdateNow();
    },
    /**
     * update var now to current Date in 1 ms
     */
    scheduleUpdateNow() {
      setTimeout(this.updateNow, 1000);
    },
    /**
     * checkes if the current user is the creater of the Comment
     */
    postedByCurrentUser() {
      if (this.currentUser && this.user) {
        return this.user.uid === this.currentUser.uid;
      }
      return false
    },
  },
  created() {
    this.scheduleUpdateNow()
    this.score = this.initialScore
    this.checkForSubComments()
  },
}
</script>
