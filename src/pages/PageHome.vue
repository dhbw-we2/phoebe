<template>
  <q-page class="constrain q-pa-md">
    <q-card
      v-for="post in posts"
      :key="post.id"
      class="card-post-text q-mb-md"
      flat
      bordered
    >
      <q-card-section vertical>
        <q-card-section class="q-pt-xs">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
              </q-avatar>
            </q-item-section>

            <q-item-section >
              <q-item-label> r/{{ post.thread }} </q-item-label>
              <q-item-label class="text-overline">Posted by u/{{ post.user }} {{ post.date | timeSincePost }} ago</q-item-label>
            </q-item-section>

            <q-item-section >

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
          <q-item-section> {{ post.link }}</q-item-section>
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions align="stretch">
        <q-btn flat round icon="eva-message-square-outline" />
        <q-btn flat round icon="eva-paper-plane-outline" />
        <q-btn flat round icon="eva-save-outline" />
        <q-btn flat round icon="eva-more-horizontal-outline" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { date } from 'quasar'
export default {
  name: 'PageHome',
  data() {
    return {
      posts: [
        {
          id: 1,
          user: "idegaf",
          thread: "funny",
          caption: 'Look at my new playlist on spotify',
          link: 'https://open.spotify.com/playlist/52tpcZzLHOTbPelf1zuo78?si=Ob9CMproTrGaI9r5l-FRCg',
          date: 1602674046530,
        },
        {
          id: 2,
          caption: 'Look at my new playlist on spotify',
          link: 'https://open.spotify.com/playlist/52tpcZzLHOTbPelf1zuo78?si=Ob9CMproTrGaI9r5l-FRCg',
          date: 1602672109947,
        },
        {
          id: 3,
          caption: 'Look at my new playlist on spotify',
          link: 'https://open.spotify.com/playlist/52tpcZzLHOTbPelf1zuo78?si=Ob9CMproTrGaI9r5l-FRCg',
          date: 1602672109947,
        },
        {
          id: 4,
          caption: 'Look at my new playlist on spotify',
          link: 'https://open.spotify.com/playlist/52tpcZzLHOTbPelf1zuo78?si=Ob9CMproTrGaI9r5l-FRCg',
          date: 1602672109947,
        }
      ]
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
      else if (result < 2592000000 ) unit = 'months';
      else if (result < 31536000000 ) unit = 'years';

      return date.getDateDiff(dateNow, value, unit) + " " + unit
    }
  }
}
</script>


