<template >
  <div class="q-pl-md">
    <q-card-section horizontal>
      <q-card-actions vertical class="justify-around">
        <q-btn flat round icon="eva-arrow-ios-upward-outline" />
        <q-btn flat round icon="eva-arrow-ios-downward-outline" />
      </q-card-actions>

      <q-separator vertical inset="true" />
      <q-card-section vertical class="q-pa-sm">
        <q-card-section horizontal>
          <q-item class="q-pa-sm q-pb-md" vertical>
            <q-item-section avatar>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption">
                Posted by u/{{ user }} {{ date | timeSincePost }} ago
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
                   v-if="user === this.$fb.auth().currentUser.email"
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
              label="post comment"
              icon="eva-message-circle-outline"
              type="submit"
              v-on:click="addComment"/>
          </q-card-actions>
        </q-card-section>

      </q-card-section>
    </q-card-section>
    <q-separator/>
    <q-card-section
          class="q-pa-sm">
      <comment-list
        @deleteComment="deleteCommentFromTree"
        v-if="hasComments"
        :commentsFromParent="comments">
      </comment-list>
    </q-card-section>
  </div>
</template>

<script>
import {date} from "quasar";

export default {
  name: "comment",
  components: {
    TextEditor: () => import('components/textEditor'),
    CommentList: () => import('components/CommentList')
  },
  props: {
    id: String,
    text: String,
    user: String,
    date: Number,
    dateEdited: undefined,
    comments: Array,
  },
  data() {
    return {
      hasComments: false,
      answering: false,
      commentInput:"",
    }
  },
  methods: {
    addComment(){
      this.$firestore.collection("comments").add({
        date: new Date().getTime(),
        user: this.$fb.auth().currentUser.email,
        comments: [],
        text: this.commentInput,
      })
        .then(docRef => {
          this.comments.push(docRef.id)
          this.$firestore.collection("comments").doc(this.id).update(
            {comments: this.comments}
          )
        })
        .catch(function(error) {
          console.error("Error adding comment to firebase: ", error);
        });
      this.commentInput = []
      this.$forceUpdate();
    },
    deleteCommentFromTree(CommentList){
      this.comments = CommentList
      this.$firestore.collection("comments").doc(this.id).update(
        {comments: this.comments}
      )
    },
    checkComments(){
      if(this.comments){
        this.hasComments = this.comments.length >= 1;
      }
    },
    answerComment(){
      this.answering = !this.answering
    },
    deleteThisComment(){
      this.$q.dialog({
        title: 'Delete comment',
        message: 'Do you really want to delete this comment?',
        position: "top",
        cancel: "No",
        ok: 'Yes',
        color: 'primary'
      }).onOk(() => {
        this.$firestore.collection("comments").doc(this.id).delete().then(() => {
           this.$emit('comment-deleted', this.id)
        });
      })
    },
  },
  watch:{
    comments: function () {
      this.hasComments = this.comments.length >= 1;
    }
  },
  created() {
    this.checkComments();
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
