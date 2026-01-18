Frontend (React)                Backend (Django)              Database (PostgreSQL)
     │                               │                              │
     │  1. User enters email/password │                              │
     │     in Login form              │                              │
     │                                │                              │
     │  2. POST /api/auth/login/      │                              │
     │────────────────────────────────>│                              │
     │     { email, password }        │                              │
     │                                │                              │
     │                                │  3. Query user by email      │
     │                                │──────────────────────────────>│
     │                                │                              │
     │                                │  4. Return user record       │
     │                                │<──────────────────────────────│
     │                                │     (with hashed password)   │
     │                                │                              │
     │                                │  5. Verify password hash     │
     │                                │     matches                  │
     │                                │                              │
     │                                │  6. Generate JWT tokens:     │
     │                                │     - Access token (15 min)  │
     │                                │     - Refresh token (7 days) │
     │                                │                              │
     │  7. Receive tokens             │                              │
     │<────────────────────────────────│                              │
     │     { access: "eyJ...",        │                              │
     │       refresh: "eyJ..." }      │                              │
     │                                │                              │
     │  8. Store access token in      │                              │
     │     localStorage               │                              │
     │                                │                              │
     │  9. Redirect to /dashboard     │                              │
     │                                │                              │