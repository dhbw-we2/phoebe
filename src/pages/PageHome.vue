<template>
  <q-page class="constrain q-pa-md">
    <template v-if="!loadingPosts && posts.length">
      <q-card v-for="post in posts" :key="post.id" class="card-post-text q-mb-md" flat bordered>
        <q-card-section vertical>
          <q-card-section class="q-pt-xs">
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label> r/{{ post.forum }}</q-item-label>
                <q-item-label class="text-overline">Posted by u/{{ post.user }} {{ post.date | timeSincePost }} ago
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  color="blue-6"
                  label="Join +"
                />
              </q-item-section>
            </q-item>

            <div class="text-h5 q-mt-sm q-mb-xs">{{ post.caption }}</div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            {{ post.text }}
            <a :href="post.link" target="_blank" rel="noopener" class="doc-link">Click here</a>
          </q-card-section>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="stretch">
          <q-btn flat round icon="eva-heart-outline"/>
          <q-btn flat round icon="eva-message-square-outline"/>
          <q-btn flat round icon="eva-save-outline"/>
          <q-btn flat round icon="eva-more-horizontal-outline"/>
        </q-card-actions>
      </q-card>
    </template>
    <template v-else-if="!loadingPosts && !posts.length">
      <h5 class="text-center text-grey">Nothing to see here.</h5>
    </template>
    <template v-else>
      <pageloading-posts/>
    </template>
  </q-page>
</template>

<script>
import {date} from 'quasar'
import PageloadingPosts from "pages/PageloadingPosts";

export default {
  name: 'PageHome',
  components: {PageloadingPosts},
  data() {
    return {
      posts: [],
      loadingPosts: false,
    }
  },
  component: {
    'loadingScreen': require('pages/PageloadingPosts.vue').default
  },
  methods: {
    getPosts() {
      this.loadingPosts = true
      this.$firestore.collection("posts").get().then(snapshot => {
        if (snapshot.empty && snapshot.metadata.fromCache) {
          throw new Error('empty response');
        }
        snapshot.forEach((doc) => {
          this.posts.push(doc.data())
        })
      }).catch(err => {
        this.$q.notify({
          message: 'Firebase Connection Failed!',
          type: 'negative'
        })
      }).finally(() => {
        this.loadingPosts = false
      })
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
  }
  , created() {
    this.getPosts()
  }
}
</script>


