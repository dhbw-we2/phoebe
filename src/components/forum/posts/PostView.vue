<template>
  <div ref="postView" class="scroll-margin-navbar overflow-wrap">
    <q-card class="card-post-text q-mb-md" flat>
        <q-card-section horizontal>
          <q-card-actions vertical class="q-ma-md-sm" style="min-width: 5em">
            <q-btn flat round icon="eva-arrow-ios-upward-outline"
                   :disable="preview || rating.disabled || downvoteLoading"
                   :loading="upvoteLoading" :color="alreadyUpvoted ? 'primary' : 'white'"
                   @click="vote(true)">
              <template v-slot:loading>
                <q-spinner-puff color="white"/>
              </template>
            </q-btn>
            <span v-html="score" class="text-center text-h5"></span>
            <q-btn flat round icon="eva-arrow-ios-downward-outline"
                   :disable="preview || rating.disabled || upvoteLoading"
                   :loading="downvoteLoading" :color="alreadyDownvoted ? 'primary' : 'white'"
                   @click="vote(false)">
              <template v-slot:loading>
                <q-spinner-puff color="white"/>
              </template>
            </q-btn>
          </q-card-actions>
          <q-space/>
          <div class="full-width">
            <q-card-section vertical class="q-pa-none q-pt-md">
              <q-item class="q-pl-none">
                <q-item-section avatar>
                  <q-skeleton v-if="!user" type="QAvatar" size="60px"/>
                  <q-avatar v-else-if="user.profilePicture" size="60px">
                    <q-img :src="user.profilePicture" alt="Avatar"/>
                  </q-avatar>
                  <q-avatar v-else size="60px" color="primary" icon="eva-person-outline" text-color="white"/>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                      <span v-for="tag in tags" class="text-primary cursor-pointer text-subtitle1"
                            @click="$emit('tag-clicked', tag)">
                        #{{ tag }}
                        <slot name="tagTooltip" v-bind:tag="tag"/>
                      </span>
                  </q-item-label>
                  <q-item-label class="text-overline inline-block">
                    <span>Posted by u/</span>
                    <q-skeleton v-if="!user" type="rect" width="4em" height="1em" class="inline-block vertical-middle"/>
                    <span v-else>{{ user.username ? user.username : 'NaU' }}</span>
                    <span v-if="date"> {{ timeSincePostCreated }}</span>
                    <span v-if="dateEdited"> (edited {{ timeSincePostEdited }})</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-card-section :horizontal="!$q.screen.xs && !$q.screen.sm" class="q-pa-none">
                <q-card-section class="col-6 q-pl-none q-pb-none" v-if="hasSpotifyItem && isSpotifyLinked">
                  <spotify-item-display :spotify-item="spotifyItem"/>
                </q-card-section>
                <q-card-section class="q-pb-none">
                  <div v-if="hasSpotifyItem && !isSpotifyLinked" class="q-pb-sm">
                    <q-btn v-if="$store.state.auth.isAuthenticated"
                           rounded color="primary" size="sm" outline
                           @click="$router.push({name: 'profile'})">
                      Connect your Spotify account and see the attached media
                    </q-btn>
                    <q-btn v-else rounded color="primary" size="sm" outline
                           @click="$router.push({name: 'Login'})">
                      Login to see the attached media
                    </q-btn>
                  </div>
                  <div class="text-h5 q-pb-md">{{ caption }}</div>
                  <div ref="postContent" v-html="text"
                       class="links-primary post-content overflow-hidden post-shortened"/>
                  <div class="q-mt-sm">
                    <q-btn outline rounded size="sm"
                           v-if="longPost && !postExpanded"
                           @click="togglePostExpanded">
                      READ MORE
                    </q-btn>
                    <q-btn outline rounded size="sm"
                           v-if="postExpanded"
                           @click="togglePostExpanded">
                      COLLAPSE
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card-section>
            <q-card-actions class="full-width">
              <q-space/>
              <q-btn flat round icon="eva-trash-2-outline"
                     v-if="postedByCurrentUser()"
                     @click="deletePost"
                     :disable="preview"/>
              <q-btn flat round icon="eva-edit-outline"
                     v-if="postedByCurrentUser()"
                     @click="editPost"
                     :disable="preview"/>
              <q-btn flat round icon="eva-message-square-outline"
                     @click="showHideComments"
                     :loading="commentsLoading"
                     :disable="preview"/>
              <q-btn flat round icon="eva-bookmark-outline"
                     :disable="preview"/>
            </q-card-actions>
          </div>

        </q-card-section>
        <q-slide-transition appear :duration=300 @hide="onCommentsHidden" @show="onCommentsShowTransitionEnd">
          <div v-show="commentsShown" ref="commentsSection">
            <q-separator inset="true"/>
            <q-card-section v-if="$store.state.auth.isAuthenticated">
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
                  @click="addComment($event);"
                  :loading="submittingComment">
                  <template v-slot:loading>
                    <q-spinner-dots/>
                  </template>
                </q-btn>
              </q-card-actions>
            </q-card-section>
            <q-card-section class="q-pa-none" v-if="commentsActive">
              <comment-list ref="commentList"
                            :post="id"
                            @comments-received="onCommentsReceived"/>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
  </div>
</template>

<script>
import {getTimeSincePostText} from "src/helpers/TimeHelper";
import {mapGetters} from "vuex";
import {commentCollection, postRatingRef, postRef} from "src/services/firebase/db";
import CommentList from "components/forum/comments/CommentList";
import TextEditor from "components/forum/TextEditor";
import {firestore} from "firebase/app";
import SpotifyItemDisplay from "components/forum/SpotifyItemDisplay";

export default {
  name: "PostView",
  components: {SpotifyItemDisplay, CommentList, TextEditor},
  props: {
    id: String,
    caption: String,
    tags: Array,
    text: String,
    date: [Number, firestore.Timestamp],
    dateEdited: [Number, firestore.Timestamp],
    user: Object,
    preview: Boolean,
    score: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Object,
      default: function () {
        return {disabled: true}
      }
    },
    spotifyItem: Object,
    hasSpotifyItem: Boolean,
  },
  data() {
    return {
      now: firestore.Timestamp.now(),
      commentsActive: false,
      commentInput: '',
      commentsShown: false,
      commentsLoading: false,
      submittingComment: false,
      longPost: false,
      postExpanded: false,
      upvoteLoading: false,
      downvoteLoading: false,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    // Display the Time since this post was created
    timeSincePostCreated() {
      return getTimeSincePostText(this.date, this.now)
    },
    // Display the Time since this post was edited
    timeSincePostEdited() {
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
    },
    isSpotifyLinked() {
      return this.currentUser && this.currentUser.spotifyAccessToken
    },
  },
  watch: {
    text() {
      this.checkForLongPost()
    },
  },
  methods: {
    async vote(ratingPositive) {
      if (ratingPositive) this.upvoteLoading = true
      else this.downvoteLoading = true

      try {
        // Define default values //
        let voteValue = 1
        let removeRating = false
        // Adjust magnitude of vote value according to current vote state
        if (this.alreadyUpvoted && ratingPositive || this.alreadyDownvoted && !ratingPositive) {
          voteValue = -1
          removeRating = true
        } else if (this.alreadyUpvoted && !ratingPositive || this.alreadyDownvoted && ratingPositive) {
          voteValue = 2
        }

        // Begin transaction to update multiple documents at the same time //
        const batch = this.$firestore.batch()

        // Update counter in post according to current state //
        batch.update(postRef(this.id), {score: firestore.FieldValue.increment(ratingPositive ? voteValue : -voteValue)})
        if (removeRating) {
          batch.delete(postRatingRef(`${this.currentUser.uid}_${this.id}`))
        } else {
          batch.set(postRatingRef(`${this.currentUser.uid}_${this.id}`), {
            post: postRef(this.id),
            user: this.currentUserRef,
            positive: ratingPositive
          })
        }
        // Commit the transaction //
        await batch.commit()
      } catch (e) {
        if (e.code === 'permission-denied') {
          console.warn('Tried to vote with illegal value')
        } else {
          console.error(e)
        }
      } finally {
        this.upvoteLoading = false
        this.downvoteLoading = false
      }
    },
    togglePostExpanded() {
      if (this.postExpanded) {
        this.$refs.postContent.classList.add('post-shortened')
      } else {
        this.$refs.postContent.classList.remove('post-shortened')
      }
      this.postExpanded = !this.postExpanded
    },
    checkForLongPost() {
      // Check whether  post content is overflowing
      const postContent = this.$refs.postContent
      if (postContent) {
        this.longPost = postContent.scrollHeight > postContent.clientHeight
      }
    },
    onCommentsShowTransitionEnd() {
      if (!this.isInViewport()) {
        this.$refs.postView.scrollIntoView({block: 'start', behavior: 'smooth'});
      }
      this.commentsActive = true
      // Focus text editor if device is non-touch
      if (!this.$q.platform.has.touch) {
        setTimeout(() => {
          if (this.$refs.editor) {
            this.$refs.editor.$refs.editor.focus()
          }
        }, 500)
      }
    },
    onCommentsHidden() {
      this.commentsActive = false;
    },
    onCommentsReceived() {
      this.commentsShown = true
      this.commentsLoading = false
    },
    showHideComments() {
      if (!this.commentsShown) {
        if (!this.commentsActive) {
          this.commentsLoading = true
          this.commentsShown = true
          this.$refs.postView.scrollIntoView({block: 'start', behavior: 'smooth'});
        } else {
          this.commentsShown = true
        }
      } else {
        this.commentsShown = false;
      }
    },
    isInViewport() {
      const bounding = this.$refs.postView.getBoundingClientRect();
      return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    },
    editPost() {
      this.$router.push({name: 'editPost', params: {id: this.id}});
    },
    deletePost() {
      this.$q.dialog({
        title: 'Delete Post',
        message: 'Do you really want to delete this post?',
        position: "top",
        cancel: "No",
        ok: 'Yes',
        color: 'primary'
      }).onOk(() => {
        postRef(this.id).delete().then(() => {
          // this.$emit('post-deleted')
        });
      })
    },
    updateNow() {
      this.now = firestore.Timestamp.now();
      this.scheduleUpdateNow();
    },
    scheduleUpdateNow() {
      setTimeout(this.updateNow, 1000);
    },
    postedByCurrentUser() {
      if (this.currentUser && this.user) {
        return this.user.uid === this.currentUser.uid;
      }
      return false
    },
    addComment() {
      if (!this.sanitizedComment.replace(/<\/?[^>]+(>|$)/g, "")) {
        this.$q.notify({
          type: 'negative',
          message: `Cannot post empty comment`
        })
        return
      }
      this.submittingComment = true
      commentCollection().add({
        date: firestore.FieldValue.serverTimestamp(),
        user: this.currentUserRef,
        text: this.sanitizedComment,
        post: postRef(this.id)
      }).catch(err => {
        console.error(err)
        this.$q.notify({
          type: 'negative',
          message: `Failed to post comment!`
        })
      }).finally(() => {
        this.submittingComment = false
      })
      this.commentInput = ''
    },
  },
  created() {
    this.scheduleUpdateNow();
  },
  mounted() {
    this.checkForLongPost()
  }
}
</script>
