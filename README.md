<p align="center">
  <img src="./src/assets/spreddit-logo.svg" alt="spreddit logo" width=20%>
</p>

# spreddit - spread your music!

## Beschreibung
### Unique Selling Proposition

Unsere Web-App bietet Ihnen ein Musik-fokussierten News Aggregator mit integrierter Spotify Anbindung. 
Es erlaubt dem Nutzer einen Austausch über Lieder, Playlists, Alben, Künstler und Podcasts.

### Was kann man damit machen?

- Der Nutzer kann sich einen Account erstellen und individuell gestalten
- Der Nutzer kann einen Spotify Account mit seinem Account verbinden
- Der Nutzer kann Posts erstellen, bestehend aus:
    - Titel
    - Text
    - Lied, Playlist, Album, Künstler oder Podcast
    - Tags (Kategorien/Themen des Posts)
    - Automatisch generierte Nutzerinformationen
- Der Nutzer kann unter Posts einer Diskussion in den Kommentaren beitreten
- Der Nutzer kann sich durch das Markieren von Tags einen personalisierten Feed erstellen
- Der Nutzer erhält Benachrichtigungen falls für seine Themen ein neuer Post vorhanden ist

### Für wen ist diese Anwendung?
Diese App ist für Musik und Podcastfans aller Altersgruppen.

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
