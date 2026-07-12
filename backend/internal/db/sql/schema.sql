CREATE TABLE slots (
    id          SERIAL PRIMARY KEY,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
    id          SERIAL PRIMARY KEY,
    slot_id     INTEGER NOT NULL REFERENCES slots(id),
    user_name   TEXT NOT NULL,
    user_email  TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email  TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name  TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    role  TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);