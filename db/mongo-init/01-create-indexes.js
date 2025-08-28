(function() {
  const targetDb = db;

  print(`Creating indexes on database: ${targetDb.getName()}`);

  targetDb.meetings.createIndex({ meeting_id: 1 }, { unique: true });
  targetDb.meetings.createIndex({ status: 1, created_at: 1 });

  targetDb.phrases.createIndex({ phrase_id: 1 }, { unique: true });
  targetDb.phrases.createIndex({ meeting_id: 1, created_at: 1 });
  targetDb.phrases.createIndex({ phrase: "text" }, { default_language: "none" });

  print("Index creation complete.");
})();