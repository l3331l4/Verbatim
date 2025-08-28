(function() {
  const targetDb = db;

  const meetingId = "00000000-0000-0000-0000-000000000001";
  print(`Seeding demo meeting (${meetingId})...`);

  db.meetings.updateOne(
    { meeting_id: meetingId },
    { $setOnInsert: {
        meeting_id: meetingId,
        title: "Demo Meeting",
        created_at: new Date(),
        status: "active"
     }},
    { upsert: true }
  );

  db.phrases.updateOne(
    { phrase_id: "00000000-0000-0000-0000-000000000010" },
    { $setOnInsert: {
        phrase_id: "00000000-0000-0000-0000-000000000010",
        meeting_id: meetingId,
        phrase: "Welcome to the demo meeting.",
        processed: false,
        created_at: new Date()
     }},
    { upsert: true }
  );

  print("Demo seed complete.");
})();