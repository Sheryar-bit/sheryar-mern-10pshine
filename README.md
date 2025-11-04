# sheryar-mern-10pshine

This repository contains a MERN-style notes application developed as part of the 10Pearls Shine Internship. Switch to branch (develop) to see the latest code. 

Overview
--------
A modern notes app with secure authentication, CRUD operations, real-time synchronization (Socket.IO), import/export, and advanced search and filters.

Quick links
-----------
- Project root: `sheryar-mern-10pshine/`
- Backend: `backend/`
- Frontend: `frontend/`

Key features
------------
- JWT-authenticated users (login/register)
- Create, read, update, delete notes
- Real-time updates using Socket.IO (note create/update/delete/import)
- Export notes to `.txt` (human readable) and JSON
- Import notes from `.txt`, `.docx`, or JSON (bulk)
- Client-side instant search and filters (role, date range)
- Toast notifications and responsive UI

Run locally (short)
-------------------
1. Backend

```powershell
cd backend
npm install
copy .env.example .env   # create your env with DB/JWT settings
npm start
# or: npx nodemon app.js
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

Environment variables (backend)
------------------------------
Create `backend/.env` with at minimum:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=notesdb
JWT_SECRET=your_jwt_secret
```

Important concepts
------------------
- Socket.IO: the server authenticates sockets using the same `JWT_SECRET`. Clients connect with `io(SERVER, { auth: { token } })`.
- Rooms: each user is joined to `user:{userId}` for targeted emits.
- Import/export: frontend parses files (.txt/.docx/.json) and sends a validated `notes` array to `POST /api/notes/import`.

API summary
-----------
- `POST /api/auth/register` — register (returns JWT)
- `POST /api/auth/login` — login (returns JWT)
- `GET /api/notes` — list user notes
- `POST /api/notes` — create note
- `PUT /api/notes/:id` — update note
- `DELETE /api/notes/:id` — delete note
- `GET /api/notes/search` — server-side search/filter
- `GET /api/notes/export` — return notes JSON for download
- `POST /api/notes/import` — import notes (body: { notes: [...] })

Socket events (server → client)
-------------------------------
- `note:created` — payload: note object
- `note:updated` — payload: note object
- `note:deleted` — payload: { id }
- `notes:imported` — payload: { notes: [...] }

Testing
-------
- Backend: Mocha/Chai (run inside `backend/`)
- Frontend: Jest + React Testing Library (run inside `frontend/`)

Notes about this repo
---------------------
- This project was developed for the **10Pearls Shine Internship** program. Include this line in any PR descriptions if required.
- The frontend was updated to remove the Admin role from dropdowns; existing admin-marked notes in the DB are not modified by that change.

If you can't find the README in your editor, open this path in your code editor:

`c:\Users\alish\OneDrive\Desktop\10Pearls\sheryar-mern-10pshine\README.md`

If you'd like, I can also add sample import files (`SAMPLE_NOTES_IMPORT.txt` and `.json`) to the project root and a short "Try it" commands block tailored to PowerShell.

---

DETAILED README
===============

Note: The section below expands the quick overview into a full detailed README for documentation and reviewers.

Project summary
---------------
This project is a notes application built using a modern JavaScript stack. It includes:

- Secure user authentication with JWT
- CRUD note operations (create, read, update, delete)
- Real-time synchronization using Socket.IO so multiple tabs or users see updates immediately
- Import/export functionality for data portability (.txt, .docx, .json supported)
- Advanced client-side search and filters (role, date range)
- Notifications and a responsive UI

Goals
-----
- Demonstrate full-stack capabilities in a MERN-style app
- Show real-time collaboration patterns using Socket.IO
- Provide robust import/export and filtering to support real workflows

Features (detailed)
-------------------

1. Authentication & Security
	- JWT-based login and registration
	- Passwords hashed with bcrypt
	- All protected endpoints require `Authorization: Bearer <token>`
	- Socket.IO handshake uses the same JWT for authentication

2. Notes CRUD
	- Create notes with title, content, and role
	- Edit and delete notes
	- Metadata (created_at) stored with notes

3. Real-Time
	- Socket.IO server authenticates clients and places them into `user:{userId}` rooms
	- Server emits events: `note:created`, `note:updated`, `note:deleted`, `notes:imported`
	- Frontend listens and updates UI instantly without polling

4. Import & Export
	- Export: Frontend fetches notes JSON and creates a human-readable `.txt` or downloads JSON
	- Import: Frontend supports `.txt`, `.docx`, and `.json` files. It parses uploaded files, validates note objects, and posts `{ notes: [...] }` to `POST /api/notes/import`
	- Backend expects an array of note objects and inserts them in batch

5. Search & Filters
	- Client-side instant search across title + content
	- Role-based and date-range filters
	- Filters combine together and update results immediately

6. Notifications & UX
	- Toast notifications for success/error/info
	- Responsive layout and dark/light mode support

Tech stack (detailed)
---------------------

Backend
- Node.js + Express
- Socket.IO (real-time)
- MySQL (mysql2) — relational data store
- JWT (jsonwebtoken) for auth
- Pino for structured logging
- Testing: Mocha + Chai + Sinon

Frontend
- React (Vite)
- Socket.IO client
- Axios for HTTP
- Lucide-react icons
- Jest + React Testing Library for unit tests

Project structure (annotated)
-----------------------------

```
sheryar-mern-10pshine/
├── backend/
│   ├── config/        # DB and logger setup
│   ├── controllers/   # Route handlers (notes, auth)
│   ├── models/        # Database queries
│   ├── routes/        # Express routes
│   ├── middleware/    # auth.js and common middlewares
│   ├── socket.js      # Socket.IO initialization & helpers
│   └── app.js         # Express server entry (wrapped in http.Server)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ # Dashboard, Auth, NoteEditor, UI
│   │   ├── hooks/      # useSocket, others
│   │   └── Style/      # CSS modules
├── FEATURES_GUIDE.md
├── QUICKSTART.md
└── README.md
```

Environment variables
---------------------
Place a `.env` file inside `backend/` with values appropriate for your environment.

Minimum recommended variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=notesdb
JWT_SECRET=your_jwt_secret
```

Running the app locally (PowerShell examples)
-------------------------------------------

1) Backend install & run

```powershell
cd c:\Users\alish\OneDrive\Desktop\10Pearls\sheryar-mern-10pshine\backend
npm install
copy .env.example .env  # adjust values
npm start
# or for hot reload during development:
npx nodemon app.js
```

2) Frontend install & run

```powershell
cd c:\Users\alish\OneDrive\Desktop\10Pearls\sheryar-mern-10pshine\frontend
npm install
npm run dev
```

API reference (summary)
-----------------------

Authentication

- `POST /api/auth/register` — register new user (body: email, password, role)
- `POST /api/auth/login` — returns JWT

Notes

- `GET /api/notes` — get notes for authenticated user
- `POST /api/notes` — create a new note
- `PUT /api/notes/:id` — update an existing note
- `DELETE /api/notes/:id` — delete a note
- `GET /api/notes/search` — server-side search and filters (optional)
- `GET /api/notes/export` — returns JSON payload of notes (frontend converts to .txt or JSON download)
- `POST /api/notes/import` — accepts `{ notes: [...] }` array to bulk create notes

Socket.IO events (server → client)
---------------------------------

- `note:created` — sent with the created note object
- `note:updated` — sent with the updated note object
- `note:deleted` — sent with `{ id }` of deleted note
- `notes:imported` — sent after bulk import with `{ notes: [...] }`

Client connection pattern
-------------------------

Clients connect like:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000', { auth: { token } });
```

The server verifies the token during handshake and assigns the socket to `user:{userId}`.

Import/export formats
---------------------

Export flow:
- Frontend calls `GET /api/notes/export` to receive JSON array
- Frontend formats it into a `.txt` file (human-readable) or directly downloads JSON

Import flow:
- Frontend accepts `.txt`, `.docx`, or `.json` files
- It parses `.txt` via structured sections (Title/Role/Content) or falls back to paragraph splitting
- For `.docx` the current frontend decodes text and attempts parsing (for robust Word parsing consider `mammoth` on server or client)
- After parsing, the frontend POSTs `{ notes: [...] }` to `/api/notes/import`

Testing
-------

- Backend: run tests with Mocha/Chai in `backend/` (e.g. `npm test`)
- Frontend: run Jest tests in `frontend/` (e.g. `npm test`)

Troubleshooting (common)
------------------------

- `TokenExpiredError` — your JWT expired; re-login to obtain a fresh token.
- Socket.IO auth errors — make sure `JWT_SECRET` is the same in env and socket code.
- Import issues — use the exported `.txt` as the canonical format; check browser console for debug logs created by the parser.

Contribution & PR guidance
-------------------------

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Add tests for new behavior
4. Commit and push
5. Open PR with description and testing steps

License & attribution
---------------------

This project was created as part of the **10Pearls Shine Internship** program. Please include this attribution when opening PRs for review.

