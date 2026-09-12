# Campus Connect

A social media platform for university communities — feed (with image posts), groups, people search, connections, and real-time direct messaging.

**Stack:** React (Vite) · Node/Express · MongoDB · Socket.io

## Project structure

```
campus-connect/
  server/     Express API + Socket.io real-time layer
  client/     React (Vite) frontend
```

## Features in this scaffold

1. **Auth** — signup/login with JWT, open signup (university verification deferred to a later phase)
2. **Feed** — create/like/comment on posts, attach an image, public feed + per-group feeds
3. **Groups** — department/club/course groups, join/leave
4. **People search** — find users by name/email/university, send connection requests, start a DM
5. **Connections + DMs** — friend requests, real-time messaging via Socket.io

---

## Prerequisites

Install these before you start:

- **Node.js 18+** and npm — check with `node -v` and `npm -v`
- **MongoDB** — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (get a connection string), **or**
  - MongoDB running locally (`mongodb://localhost:27017`)
- **VS Code** with the built-in terminal (`` Ctrl+` `` / `` Cmd+` ``)

---

## Running it in VS Code

Unzip the project and open the `campus-connect` folder in VS Code (`File > Open Folder…`). You'll run the backend and frontend in **two separate terminals** — open a second terminal with the `+` icon or `` Ctrl+Shift+` ``.

### Terminal 1 — Backend

```bash
cd server
npm install
cp .env.example .env
```

Now open `server/.env` in the editor and set:
- `MONGO_URI` — your Atlas connection string or `mongodb://localhost:27017/campus-connect`
- `JWT_SECRET` — any long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to generate one)

Then start the API:

```bash
npm run dev
```

You should see `MongoDB connected: ...` and `Campus Connect API running on port 5000`. Verify it's alive:

```bash
curl http://localhost:5000/api/health
```

### Terminal 2 — Frontend

```bash
cd client
npm install
npm run dev
```

Vite will print a local URL — open **http://localhost:5173** in your browser. It proxies all `/api` and upload requests to the backend on port 5000 (see `client/vite.config.js`), so both servers need to be running.

### Try it end-to-end

1. Sign up a user at `/signup`
2. Post to the feed — attach an image with "Add image"
3. Create a group under **Groups**, join it, post inside it
4. Go to **People**, search for a second account (sign up one in an incognito window), send a connection request, then click **Message**
5. Chat in real time at `/messages/:id` — open both browser sessions side by side to watch messages arrive live

To stop either server, click into its terminal and press `Ctrl+C`.

---

## Environment variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |

## Uploaded images

Post images and (via API) avatars are saved to `server/uploads/` and served statically at `http://localhost:5000/uploads/<filename>`. This folder is git-ignored — fine for local dev, but swap for S3/Cloudinary before deploying anywhere with ephemeral or multi-instance hosting (`server/config/upload.js` is the only file you'd need to change).

## Roadmap (not yet built)

- Avatar upload UI (API endpoint `POST /api/uploads/avatar` already exists — needs a profile page)
- Notifications (new likes, comments, messages, group activity)
- University email verification flow
- Moderation/reporting
- Pagination UI for feed (API already supports `page`/`limit`)

## Notes for the next engineer

- Passwords are hashed with bcrypt in a Mongoose pre-save hook (`server/models/User.js`)
- Socket connections authenticate with the same JWT as REST (`server/sockets/chatSocket.js`)
- Feed queries are indexed by `createdAt` and `group + createdAt` (`server/models/Post.js`) — if you add infinite scroll, use cursor-based pagination instead of skip/limit once the feed grows large
- Group text search uses a Mongo text index (`name`, `description`); user search uses a case-insensitive regex — fine for MVP, revisit both if you need fuzzy/typo-tolerant search at scale
- Image uploads are capped at 5MB and restricted to jpeg/jpg/png/gif/webp (`server/config/upload.js`)
