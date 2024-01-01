--
-- All SQL statements must be on a single line and end in a semicolon.
--

-- Dummy table --
DROP TABLE IF EXISTS dummy;
CREATE TABLE dummy(created TIMESTAMP WITH TIME ZONE);

-- Your database schema goes here --

DROP TABLE IF EXISTS person;
CREATE TABLE person(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(32), title VARCHAR(32), passhash VARCHAR(64));

DROP TABLE IF EXISTS mailboxes;
CREATE TABLE mailboxes(title VARCHAR(32), email_owner VARCHAR(32));

DROP TABLE IF EXISTS mail;
CREATE TABLE mail(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), details jsonb, to_mailbox VARCHAR(32) DEFAULT 'Inbox', from_mailbox VARCHAR(32) DEFAULT 'Sent', to_starred boolean DEFAULT false, from_starred boolean DEFAULT false, to_opened boolean DEFAULT false, from_opened boolean DEFAULT true);
