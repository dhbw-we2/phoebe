<p align="center">
  <img src="./src/assets/spreddit-logo.svg" alt="spreddit logo" width=20%>
</p>

# spreddit - spread your music!

## Was kann man damit machen?
- Nutzermanagement mit Login (Verknüpfung Spotify (o.ä.) Account)
- Forum mit Erstellen eigener Threads zum Austausch unter Nutzern
- An-Pin-Funktion einzelner Threads für personalisierten Feed
- Benachrichtigungen für neue Releases (Anbindung an Kalender)
- Playlist Erstellung (anhand Empfehlungen nach Stimmungstags)
- Playlist Generierung aus irgendwas (bspw. Fokus auf spezielle Lizenzen)

## Für wen ist diese Anwendung?
- Musik und Podcastfans aller Altersgruppen

## Was ist der Mehrwert der App?
-  Austausch zwischen Musikfans
- Benachrichtigungen zu Künstlern/Genres und automatische Erinnerung über Kalender für Releases
- Auf Lizenzen spezialisierte Musik Playlist (für bspw. Content Creator)
- Podcast Austausch/Vorschlag von anderen Nutzern über gewisse Themen

## Development
### Installation
To install all dependencies defined in `package.json` run

`npm install`

In order to connect to the *firebase* instance, rename `.quasar.env.empty.json` to `.quasar.env.json` and fill in the `FIREBASE_CONFIG` variable.
You can find the firebase config object in the firebase web console under project settings -> General -> Your apps -> spreddit -> Firebase SDK Snippet -> Config.

Example excerpt of `.quasar.env.json`
```json
{
"development": {
    "ENV_TYPE": "Running Development",
    "ENV_DEV": "Development",
    "FIREBASE_CONFIG": {
      "apiKey": "xxx",
      "authDomain": "xxx",
      "databaseURL": "xxx",
      "projectId": "xxx",
      "storageBucket": "xxx",
      "messagingSenderId": "xxx",
      "appId": "xxx",
      "measurementId": "xxx"
    }
  }
}
```

### Running the app
To start the development server run

`npm run dev`
