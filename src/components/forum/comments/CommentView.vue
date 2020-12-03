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
            <q-card-actions vertical class="justify-center q-pa-sm" style="min-width: 4em">
              <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
              <span v-html="0" class="text-center text-h6"></span>
              <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
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
                      <q-skeleton v-if="!user" type="rect" width="4em" height="1em" class="inline-block vertical-middle"/>
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
                  <q-btn flat rounded label="REPLY"
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
          :all-user-data="allUserData"/>
      </q-card-section>
    </div>
  </q-slide-transition>
</template>

<script>
import {mapGetters} from "vuex";
import {commentCollection, commentRef, postRef} from "src/services/firebase/db";
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
    allUserData: Array
  },
  data() {
    return {
      hasSubComments: false,
      replying: false,
      commentInput: "",
      now: firestore.Timestamp.now(),
      submittingReply: false,
      transitionEnded: false,
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
    }
  },
  methods: {
    onTransitionEnd() {
      this.transitionEnded = true
    },
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
    updateNow() {
      this.now = new Date().getTime();
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
  },
  created() {
    // this.scheduleUpdateNow()
    this.checkForSubComments()
  },
  watch: {
    allComments() {
      this.checkForSubComments()
    },
    currentUser() {
      if (!this.currentUser) {
        this.replying = false
      }
    }
  },
}
</script>
