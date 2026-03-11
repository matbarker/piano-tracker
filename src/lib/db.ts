import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Default to a local data.db file if no environment variable is provided
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'data.db');

let db: Database.Database | null = null;

export function getDb() {
    if (db) return db;

    // Ensure the directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH, { verbose: console.log });
    db.pragma('journal_mode = WAL');

    // Initialize schema
    initDb(db);

    return db;
}

function initDb(database: Database.Database) {
    // Create exercises table
    database.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_deleted INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      category TEXT DEFAULT 'technique',
      priority INTEGER DEFAULT 0
    )
  `);

    // Run simple migration for existing databases
    try {
        database.prepare('SELECT category FROM exercises LIMIT 1').get();
    } catch {
        database.exec(`
            ALTER TABLE exercises ADD COLUMN category TEXT DEFAULT 'technique';
            ALTER TABLE exercises ADD COLUMN priority INTEGER DEFAULT 0;
        `);
    }

    try {
        database.prepare('SELECT is_deleted FROM exercises LIMIT 1').get();
    } catch {
        database.exec(`
            ALTER TABLE exercises ADD COLUMN is_deleted INTEGER DEFAULT 0;
            ALTER TABLE exercises ADD COLUMN is_archived INTEGER DEFAULT 0;
        `);
    }

    // Create practice_sessions table
    database.exec(`
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      practiced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )
  `);

    // Create an index for faster lookups
    database.exec(`
    CREATE INDEX IF NOT EXISTS idx_practice_sessions_exercise_id ON practice_sessions(exercise_id);
  `);
}
