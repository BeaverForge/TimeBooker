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
