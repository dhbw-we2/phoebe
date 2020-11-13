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
                Posted by u/{{ username }} {{ date | timeSincePost }} ago
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-space/>
          <q-card-actions class="text-right">
            <q-btn flat round
                   icon="eva-message-square-outline"
                   @click="answerComment"
            />
            <q-btn flat round
                   icon="eva-trash-2-outline"
                   v-if="uid ===currentUser.uid"
                   v-on:click="deleteThisComment"/>
          </q-card-actions>
        </q-card-section>
        <q-card-section v-html="text" class="q-pa-sm q-pb-md links-primary"/>

        <q-card-section v-if="answering">
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
import {date} from "quasar";
import {mapGetters} from "vuex";
import {commentRef, postRef} from "src/services/firebase/db";

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
      answering: false,
      commentInput: "",
      avatar: null,
      username: null,
      uid: null,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser', 'currentUserRef']),
  },
  methods: {
    AddReply() {
      this.$firestore.collection("comments").add({
        date: new Date().getTime(),
        user: this.currentUserRef,
        text: this.commentInput,
        parentComment: commentRef(this.id),
        post: postRef(this.post)
      }).catch(function (error) {
        console.error("Error adding comment to firebase: ", error);
      });
      this.commentInput = ''
      this.answering = false
    },
    answerComment() {
      this.answering = !this.answering
    },
    deleteThisComment() {
      this.$q.dialog({
        title: 'Delete comment',
        message: 'Do you really want to delete this comment?',
        position: "top",
        cancel: "No",
        ok: 'Yes',
        color: 'primary'
      }).onOk(() => {
        commentRef(this.id).delete().then(() => {
          this.$emit('comment-deleted', this.id)
        });
      })
    },
    checkForSubComments() {
      let subComments = false
      this.hasSubComments = false
      this.allComments.every((comment) => {
        if (comment.parentComment && comment.parentComment.id === this.id) {
          subComments = true;
          return true
        } else {
          return true
        }
      })
      this.hasSubComments = subComments
    }
  },
  created() {
    if (this.userRef) {
      this.userRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data()
          this.username = data.username
          this.avatar = data.profilePicture
          this.uid = data.uid
        }
      })
      this.checkForSubComments()
    }
  },
  watch: {
    allComments() {
      this.checkForSubComments()
    }
  },
  filters: {
    // Display the Time since this post was created
    timeSincePost(value) {
      let unit = "";
      let dateNow = Date.now();
      let result = dateNow - value;

      // Why i used ifs https://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
      if (result < 60000) unit = 'seconds';
      else if (result < 3600000) unit = 'minutes';
      else if (result < 86400000) unit = 'hours';
      else if (result < 2592000000) unit = 'days';
      else if (result < 31536000000) unit = 'months';
      else if (result >= 31536000000) unit = 'years';

      return date.getDateDiff(dateNow, value, unit) + " " + unit
    }
  },
}
</script>
