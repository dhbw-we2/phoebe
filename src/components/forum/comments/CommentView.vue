<template>
  <div class="q-pl-md">
    <q-card-section horizontal>
      <q-card-actions vertical class="justify-around">
        <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
        <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
      </q-card-actions>

      <q-separator vertical inset="true"/>
      <q-card-section vertical class="q-pa-sm">
        <q-card-section horizontal>
          <q-item class="q-pa-sm q-pb-md" vertical>
            <q-item-section avatar>
              <q-avatar v-if="avatar" size="50px">
                <q-img :src="avatar" alt="Avatar"/>
              </q-avatar>
              <q-avatar size="50px" v-else round color="primary" icon="eva-person-outline" text-color="white"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption">
                Posted by u/{{ (username ? username : '[deleted]') }} {{ timeSinceCommentCreated }} ago
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-space/>
          <q-card-actions class="text-right">
            <q-btn flat round
                   icon="eva-message-square-outline"
                   @click="replyToComment"
                   v-if="$store.state.auth.isAuthenticated && (text !== undefined)"
            />
            <q-btn flat round
                   icon="eva-trash-2-outline"
                   v-if="postedByCurrentUser()"
                   v-on:click="deleteComment"/>
          </q-card-actions>
        </q-card-section>
        <q-card-section v-html="(text ? text : '[removed]')" class="q-pa-sm q-pb-md links-primary"/>

        <q-card-section v-if="replying">
          <text-editor
            placeholderText="Very interesting Comment"
            @changeText="commentInput = $event">
          </text-editor>
          <q-card-actions align="stretch">
            <q-space/>
            <q-btn
              unelevated rounded
              color=positive
              label="REPLY"
              icon="eva-message-circle-outline"
              type="submit"
              @click="AddReply"/>
          </q-card-actions>
        </q-card-section>
      </q-card-section>
    </q-card-section>
    <q-separator/>
    <q-card-section
      class="q-pa-sm">
      <comment-list
        v-if="hasSubComments"
        :post="post"
        :comment-id="id"
        :inherited-comments="allComments"/>
    </q-card-section>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import {commentCollection, commentRef, postRef} from "src/services/firebase/db";
import {getFormattedTimeBetween} from "src/helpers/TimeHelper";
import * as firebase from 'firebase/app';

export default {
  name: "CommentView",
  components: {
    TextEditor: () => import('components/forum/TextEditor'),
    CommentList: () => import('components/forum/comments/CommentList')
  },
  props: {
    id: String,
    text: String,
    userRef: Object,
    date: Number,
    dateEdited: undefined,
    allComments: Array,
    post: String,
  },
  data() {
    return {
      hasSubComments: false,
      replying: false,
      commentInput: "",
      avatar: null,
      username: null,
      uid: null,
      now: new Date().getTime(),
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
    // Display the Time since this post was created
    timeSinceCommentCreated() {
      return getFormattedTimeBetween(this.date, this.now)
    },
    // Display the Time since this post was edited
    timeSinceCommentEdited() {
      return getFormattedTimeBetween(this.dateEdited, this.now)
    }
  },
  methods: {
    AddReply() {
      commentCollection().add({
        date: new Date().getTime(),
        user: this.currentUserRef,
        text: this.commentInput,
        parentComment: commentRef(this.id),
        post: postRef(this.post)
      }).catch(function (error) {
        console.error("Error adding comment to firebase: ", error);
      });
      this.commentInput = ''
      this.replying = false
    },
    replyToComment() {
      this.replying = !this.replying
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
                user: firebase.firestore.FieldValue.delete(),
                text: firebase.firestore.FieldValue.delete(),
                dateEdited: firebase.firestore.FieldValue.delete(),
              })
            }
          })
        } else {
          commentRef(this.id).delete();
        }
      })
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
      if (this.currentUser) {
        return this.uid === this.currentUser.uid;
      }
    },
  },
  created() {
    this.scheduleUpdateNow()
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
