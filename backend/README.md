# Backend (Express + MySQL)

Quick start:

1. Install dependencies

```powershell
npm install
```

2. Start the server

```powershell
node app.js
```

API endpoints:

- POST /api/auth/register  - { fullName, email, password, role }
- POST /api/auth/login     - { email, password }  -> returns { token }

Notes (protected - send Authorization: Bearer <token>):
- POST /api/notes          - { title, content, role }
- GET /api/notes           - list notes for logged-in user
- PUT /api/notes/:id       - update
- DELETE /api/notes/:id    - delete

Example register:

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"fullName":"Test","email":"a@b.com","password":"pass123"}'
```

Example login:

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"pass123"}'
```

Use the returned token with `Authorization: Bearer <token>` for notes endpoints.
