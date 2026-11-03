-- Where each lead came from: the website form or the chatbot.
ALTER TABLE enquiries ADD COLUMN source TEXT NOT NULL DEFAULT 'website';
ALTER TABLE applications ADD COLUMN source TEXT NOT NULL DEFAULT 'website';
