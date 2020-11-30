<template>
  <div ref="postView" class="scroll-margin-navbar">
    <q-slide-transition>
      <q-card class="card-post-text q-mb-md" flat v-show="visible">
        <q-card-section horizontal>
          <q-card-actions vertical class="justify-center q-pa-none q-ma-md" style="min-width: 5em">
            <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
            <span v-html="score" class="text-center text-h5"></span>
            <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
          </q-card-actions>
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
                    <span>Posted by u/{{ username }} {{ timeSincePostCreated }} ago</span>
                    <span v-if="dateEdited"> (edited {{ timeSincePostEdited }} ago)</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <div class="text-h5 q-pb-sm">{{ caption }}</div>
              <q-card-section v-html="text" class="q-pa-none links-primary post-content"/>
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
            <q-card-section v-if="$store.state.auth.isAuthenticated">
              <q-separator inset="true"/>
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
import {getFormattedTimeBetween} from "src/helpers/TimeHelper";
import {mapGetters} from "vuex";
import {commentCollection, postRef} from "src/services/firebase/db";
import CommentList from "components/forum/comments/CommentList";
import TextEditor from "components/forum/TextEditor";

export default {
  name: "PostView",
  components: {CommentList, TextEditor},
  props: {
    id: String,
    caption: String,
    tags: Array,
    text: String,
    date: Number,
    dateEdited: Number,
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
      now: new Date().getTime(),
      username: null,
      uid: null,
      avatar: null,
      commentsActive: false,
      commentInput: '',
      commentsShown: false,
      commentsLoading: false,
      submittingComment: false,
      score: 200,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    // Display the Time since this post was created
    timeSincePostCreated() {
      return getFormattedTimeBetween(this.date, this.now)
    },
    // Display the Time since this post was edited
    timeSincePostEdited() {
      return getFormattedTimeBetween(this.dateEdited, this.now)
    },
    sanitizedComment() {
      return this.commentInput.replace(/&nbsp;/g, '').trim()
    }
  },
  methods: {
    onCommentsShowTransitionEnd() {
      this.commentsActive = true
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
          // Focus on text input
          this.$nextTick(() => {
            this.$refs.postView.scrollIntoView({block: 'start', behavior: 'smooth'});
            setTimeout(() => {
              if (this.$refs.editor) {
                this.$refs.editor.$refs.editor.focus()
              }
            }, 500)
          })
        } else {
          this.commentsShown = true
        }
      } else {
        this.commentsShown = false;
      }
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
      this.now = new Date().getTime();
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
        date: new Date().getTime(),
        user: this.currentUserRef,
        text: this.sanitizedComment,
        post: postRef(this.id)
      }).catch(reason => {
        this.$q.notify({
          type: 'negative',
          message: `Failed to post comment: ${reason}`
        })
      }).finally(() => {
        this.submittingComment = false
      })
      this.commentInput = ''
    },
  },
  created() {
    this.scheduleUpdateNow();

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
