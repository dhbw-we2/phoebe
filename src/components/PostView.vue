<template>
  <q-card class="card-post-text q-mb-md" flat bordered>
    <q-card-section vertical>
      <q-card-section class="q-pt-xs">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Avatar"/>
            </q-avatar>
          </q-item-section>

          <q-item-section >
            <q-item-label>
              <span v-for="tag in tags"> #{{ tag }}</span>
            </q-item-label>
            <q-item-label class="text-overline">Posted by u/me now  </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              disable
              color="blue-6"
              label="Join +"
            />
          </q-item-section>
        </q-item>

        <div class="text-h5 q-mt-sm q-mb-xs">{{ captionInput }}</div>
      </q-card-section>
      <q-card-section v-html="textInput" class="col-5"/>
    </q-card-section>

    <q-separator />

    <q-card-actions align="stretch">
      <q-btn flat disable round icon="eva-heart-outline" />
      <q-btn flat disable round icon="eva-message-square-outline" />
      <q-btn flat disable round icon="eva-save-outline" />
      <q-btn flat disable round icon="eva-more-horizontal-outline" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
name: "PostView"
}
</script>
