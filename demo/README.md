# web/public

Static assets served at the site root by Vite (e.g. this folder's `bgm.mp3` is
available at `/bgm.mp3`).

## Background music — `bgm.mp3`

The animated comic ("▶ Animated comic" in Watch) loops a single background
track while it narrates each cut. Drop your own mp3 here named exactly:

```
web/public/bgm.mp3
```

It is referenced by `BGM_SRC = '/bgm.mp3'` in `web/src/components/Watch.tsx` and
plays at low volume (0.18), looping, tied to the play/pause control. If the file
is absent, playback still works — there is simply no background music.
