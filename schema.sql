CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app TEXT NOT NULL UNIQUE,
    totalProjectGenerated INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projectGeneratedStats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statId INTEGER NOT NULL,
    framework TEXT NOT NULL,
    genCount INTEGER DEFAULT 0,
    FOREIGN KEY (statId) REFERENCES stats(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS update_stats_timestamp
AFTER UPDATE ON stats
FOR EACH ROW
BEGIN
    UPDATE stats SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
