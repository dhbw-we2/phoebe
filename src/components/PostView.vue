<template>
  <q-slide-transition>
    <q-card class="card-post-text q-mb-md" flat bordered v-show="visible">
      <q-card-section horizontal>
        <q-card-actions vertical class="justify-around">
          <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
          <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
        </q-card-actions>

        <q-separator vertical inset="true"/>

        <q-card-section vertical class="q-pa-sm">
          <q-card-section class="q-pa-sm">
            <q-item class="q-pa-sm q-pb-md">
              <q-item-section avatar>
                <q-avatar v-if="avatar">
                  <q-img :src="avatar" alt="Avatar"/>
                </q-avatar>
                <q-avatar v-else round color="primary" icon="eva-person-outline" text-color="white"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <span v-for="tag in tags" class="text-primary"> #{{ tag }}</span>
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
        <q-btn flat round icon="eva-message-square-outline"/>
        <q-btn flat round icon="eva-save-outline"/>
        <q-btn flat round icon="eva-more-horizontal-outline"/>
        <q-space/>
        <div v-if="dateEdited" class="text-overline"> (edited {{ timeSincePostEdited }} ago)</div>
        <q-btn flat round icon="eva-edit-2-outline" v-if="postedByCurrentUser()" v-on:click="editPost"/>
        <q-btn flat round icon="eva-trash-2-outline" v-if="postedByCurrentUser()" v-on:click="deletePost"/>
      </q-card-actions>
    </q-card>
  </q-slide-transition>
</template>

<script>
import {date} from "quasar";
import {mapGetters} from "vuex";

export default {
  name: "PostView",
  props: {
    id: String,
    caption: String,
    tags: Array,
    text: String,
    date: Number,
    dateEdited: Number,
    uid: String,
  },
  data() {
    return {
      visible: true,
      now: new Date().getTime(),
      username: null,
      avatar: null,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
    // Display the Time since this post was created
    timeSincePostCreated() {
      return this.getFormattedTimeBetween(this.date, this.now)
    },
    // Display the Time since this post was edited
    timeSincePostEdited() {
      return this.getFormattedTimeBetween(this.dateEdited, this.now)
    }
  },
  methods: {
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
        this.$firestore.collection("posts").doc(this.id).delete().then(() => {
          // this.$emit('post-deleted')
        });
      })
    },
    getFormattedTimeBetween(startTime, finishTime) {
      let unit = "";
      let result = finishTime - startTime;

      // Why i used ifs https://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
      if (result < 60000) unit = 'seconds';
      else if (result < 3600000) unit = 'minutes';
      else if (result < 86400000) unit = 'hours';
      else if (result < 2592000000) unit = 'days';
      else if (result < 31536000000) unit = 'months';
      else if (result >= 31536000000) unit = 'years';

      return date.getDateDiff(finishTime, startTime, unit) + " " + unit
    },
    updateNow() {
      this.now = new Date().getTime();
      this.scheduleUpdateNow();
    },
    scheduleUpdateNow() {
      setTimeout(this.updateNow, 1000);
    },
    userHasAvatar() {
      this.$firestore.collection('users').doc(this.uid).get().then(doc => {
        if (doc.profilePicture) {
          this.avatar = doc.profilePicture
          return true
        } else {
          return false
        }
      })
    },
    postedByCurrentUser(){
      if(this.currentUser){
        if(this.uid === this.currentUser.uid){
          return true;
        }
      }
      return false
    }
  },
  created() {
    this.scheduleUpdateNow();

    // Get Username and Avatar from Database
    this.$firestore.collection('users').doc(this.uid).get().then(doc => {
      if(doc.exists){
        const data = doc.data()
        this.username = data.username
        this.avatar = data.profilePicture
      }
    })
  }
}
</script>
