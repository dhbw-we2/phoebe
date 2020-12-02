<template>
  <div ref="postView" class="scroll-margin-navbar overflow-wrap">
    <q-slide-transition>
      <q-card class="card-post-text q-mb-md" flat v-show="visible">
        <q-card-section horizontal>
          <q-card-actions vertical class="q-ma-md-sm q-px-xs-none q-px-md-sm" style="min-width: 5em">
            <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
            <span v-html="score" class="text-center text-h5"></span>
            <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
          </q-card-actions>
          <q-space/>
          <div class="full-width">
            <q-card-section vertical class="q-pl-none q-pb-none">
              <q-item class="q-pl-none q-pr-none q-pb-md">
                <q-item-section avatar>
                  <q-avatar v-if="avatar" size="60px">
                    <q-img :src="avatar" alt="Avatar"/>
                  </q-avatar>
                  <q-avatar size="60px" v-else round color="primary" icon="eva-person-outline" text-color="white"/>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                      <span v-for="tag in tags" class="text-primary cursor-pointer text-subtitle1"
                            @click="$emit('tag-clicked', tag)"> #{{ tag }}</span>
                  </q-item-label>
                  <q-item-label class="text-overline inline-block">
                    <span>Posted by u/{{ username }} {{ timeSincePostCreated }}</span>
                    <span v-if="dateEdited"> (edited {{ timeSincePostEdited }})</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <div class="text-h5 q-pb-sm">{{ caption }}</div>
              <q-card-section class="q-pa-none">
                <div ref="postContent" id='test' v-html="text"
                     class="links-primary post-content overflow-hidden post-shortened"/>
                <div class="q-mt-sm">
                  <q-btn outline rounded size="sm"
                         v-if="isLongPost() && !postExpanded"
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
            <q-card-actions class="full-width">
              <q-space/>
              <q-btn flat round icon="eva-trash-2-outline" v-if="postedByCurrentUser() && !preview"
                     @click="deletePost"/>
              <q-btn flat round icon="eva-edit-outline" v-if="postedByCurrentUser() && !preview" @click="editPost"/>
              <q-btn flat round icon="eva-message-square-outline"
                     @click="showHideComments"
                     :loading="commentsLoading"/>
              <q-btn flat round icon="eva-bookmark-outline"/>
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
    </q-slide-transition>
  </div>
</template>

<script>
import {getTimeSincePostText} from "src/helpers/TimeHelper";
import {mapGetters} from "vuex";
import {commentCollection, postRef} from "src/services/firebase/db";
import CommentList from "components/forum/comments/CommentList";
import TextEditor from "components/forum/TextEditor";
import {firestore} from "firebase/app";

export default {
  name: "PostView",
  components: {CommentList, TextEditor},
  props: {
    id: String,
    caption: String,
    tags: Array,
    text: String,
    date: [Number, firestore.Timestamp],
    dateEdited: [Number, firestore.Timestamp],
    userRef: Object,
    preview: Boolean,
    upvotes: {
      type: Array,
      default: function () {
        return []
      },
    },
    downvotes: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data() {
    return {
      visible: true,
      now: firestore.Timestamp.now(),
      username: null,
      uid: null,
      avatar: null,
      commentsActive: false,
      commentInput: '',
      commentsShown: false,
      commentsLoading: false,
      submittingComment: false,
      score: 200,
      postExpanded: false,
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
  },
  methods: {
    togglePostExpanded() {
      if (this.postExpanded) {
        this.$refs.postContent.classList.add('post-shortened')
      } else {
        this.$refs.postContent.classList.remove('post-shortened')
      }
      this.postExpanded = !this.postExpanded
    },
    isLongPost() {
      // Check whether  post content is overflowing
      const postContent = this.$refs.postContent
      if (postContent) {
        return postContent.scrollHeight > postContent.clientHeight || postContent.scrollWidth > postContent.clientWidth;
      }
      return false
    },
    onCommentsShowTransitionEnd() {
      if (!this.isInViewport()) {
        this.$refs.postView.scrollIntoView({block: 'start', behavior: 'smooth'});
      }
      this.commentsActive = true
      //Focus text editor if device is non-touch
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
        this.visible = false;
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
      if (this.currentUser) {
        return this.uid === this.currentUser.uid;
      }
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
    // this.scheduleUpdateNow();

    if (this.userRef) {
      this.userRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data()
          this.username = data.username
          this.avatar = data.profilePicture
          this.uid = data.uid
        }
      })
    }
    this.score = this.upvotes.length - this.downvotes.length

  },
}
</script>
