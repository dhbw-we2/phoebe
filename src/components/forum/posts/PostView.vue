<template>
  <q-slide-transition>
    <q-card class="card-post-text q-mb-md" flat bordered v-show="visible">
      <q-card-section horizontal>
        <q-card-actions vertical class="justify-center">
            <q-btn flat round icon="eva-arrow-ios-upward-outline" class="q-mb-lg"/>
            <q-btn flat round icon="eva-arrow-ios-downward-outline" class="q-mt-lg"/>
        </q-card-actions>

        <q-separator vertical inset="true"/>

        <q-card-section vertical class="q-pa-sm">
          <q-card-section class="q-pa-sm">
            <q-item class="q-pa-sm q-pb-md">
              <q-item-section avatar>
                <q-avatar v-if="avatar" size="50px">
                  <q-img :src="avatar" alt="Avatar"/>
                </q-avatar>
                <q-avatar size="50px" v-else round color="primary" icon="eva-person-outline" text-color="white"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <span v-for="tag in tags" class="text-primary cursor-pointer"
                        @click="$emit('tag-clicked', tag)"> #{{ tag }}</span>
                </q-item-label>
                <q-item-label class="text-overline">
                  Posted by u/{{ username }} {{ timeSincePostCreated }} ago
                </q-item-label>
              </q-item-section>
            </q-item>
            <div class="text-h5 q-pa-sm">{{ caption }}</div>
            <q-card-section v-html="text" class="q-pa-sm q-pb-md links-primary"/>
          </q-card-section>
        </q-card-section>
      </q-card-section>

      <q-separator/>

      <q-card-actions align="stretch">
        <q-btn flat round icon="eva-heart-outline"/>
        <q-btn flat round
               v-on:click="showHideComments"
               icon="eva-message-square-outline"
               :loading="commentsLoading"/>
        <q-btn flat round
               icon="eva-save-outline"/>
        <q-btn flat round
               icon="eva-more-horizontal-outline"/>
        <q-space/>
        <div v-if="dateEdited" class="text-overline"> (edited {{ timeSincePostEdited }} ago)</div>
        <q-btn flat round icon="eva-edit-2-outline" v-if="postedByCurrentUser() && !preview" v-on:click="editPost"/>
        <q-btn flat round icon="eva-trash-2-outline" v-if="postedByCurrentUser() && !preview" v-on:click="deletePost"/>
      </q-card-actions>
      <q-slide-transition appear :duration=300>
        <div v-if="commentsActive" v-show="commentsShown">
          <q-separator/>
          <q-card-section v-if="$store.state.auth.isAuthenticated">
            <text-editor
              placeholderText="Very interesting Comment"
              :text-input.sync="commentInput">
            </text-editor>
            <q-card-actions align="stretch">
              <q-space/>
              <q-btn
                unelevated rounded
                color=positive
                label="POST COMMENT"
                icon="eva-message-circle-outline"
                type="submit"
                @click="addComment"
                :loading="submittingComment">
                <template v-slot:loading>
                  <q-spinner-dots/>
                </template>
              </q-btn>
            </q-card-actions>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <comment-list ref="commentList"
                          :post="id"
                          @comments-loaded="commentsLoaded"/>
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </q-slide-transition>
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
    preview: Boolean
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
    }
  },
  methods: {
    commentsLoaded() {
      this.commentsShown = true
      this.commentsLoading = false
    },
    showHideComments() {
      if (!this.commentsShown) {
        if (!this.commentsActive) {
          this.commentsLoading = true
          this.commentsActive = true
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
      this.submittingComment = true
      commentCollection().add({
        date: new Date().getTime(),
        user: this.currentUserRef,
        text: this.commentInput,
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
    }
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
  },
}
</script>
