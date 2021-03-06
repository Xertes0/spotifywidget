# Spotify Widget

Works on Linux and Windows.
MacOS was NOT tested.

![Preview](https://i.imgur.com/KYJ3Nes.png)

# Running

After cloning the repository run these commands to install the dependencies:

```
npm install
```

For building:

```
yarn install
```

You can start the application with the following command:

```
npm run start
```

For debugging purposes use:

```
npm run dev
```

# Command line arguments

All of the arguments are optional

```
--dev Developer mode Default with "npm run dev"
--skip-config-screen Skip configuration window
--config-path=<path> Path to the configuration path Default=HOME/.config/spotifywidget/config.json
```

# Building

For Linux:

```
npm run build
```

For Windows:

```
npm run build_win
```

All configurations:

```
npm run build_all
```
