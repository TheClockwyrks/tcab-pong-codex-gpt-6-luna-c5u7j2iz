# Carom

Carom is a browser based paddle duel about timing, spin, and bank shots. Play a solo match against the computer or share the keyboard in local Versus. Rally through two fixed obstacles, curve shots with paddle motion, and win by reaching 11 points with a two point lead.

## Install

```sh
npm ci
```

## Run in development

```sh
npm run dev
```

## Build for production

```sh
npm run build
```

The static site is written to `dist/` and can be served from the root of any static file server.

## Controls

- **Solo:** `W` / `S` or `↑` / `↓` move your left paddle. The AI controls the right paddle.
- **Versus:** Player one uses `W` / `S`; player two uses `↑` / `↓`.
- **Menus:** `↑` / `↓` choose, `Enter` or `Space` confirms, and `Escape` goes back or pauses.
- **Pause:** `P` or `Escape` opens the pause menu; use the same keys to resume.
- **Sound:** `M` toggles audio.

Mouse and touch work on menu items. On touch screens, use the on-screen paddle controls.
