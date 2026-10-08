-- Accounts (Google sign-in), sessions, and Garage Stories with photos and upvotes.
-- Times are Unix epoch milliseconds.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  -- Public username, chosen on first sign-in. NULL until the account is set up.
  handle TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  -- SHA-256 of the cookie token, so a leaked table cannot be replayed.
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX sessions_user_id ON sessions(user_id);

CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  vehicle TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX stories_top ON stories(upvotes DESC, created_at DESC);
CREATE INDEX stories_new ON stories(created_at DESC);
CREATE INDEX stories_user_id ON stories(user_id);

CREATE TABLE story_photos (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  position INTEGER NOT NULL
);
CREATE INDEX story_photos_story_id ON story_photos(story_id, position);

CREATE TABLE story_votes (
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (story_id, user_id)
);
