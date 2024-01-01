--
-- All SQL statements must be on a single line and end in a semicolon.
--
-- Dummy Data --
INSERT INTO dummy (created) VALUES (current_timestamp);

-- Populate Your Tables Here --
DELETE FROM person;
DELETE FROM mailboxes;
DELETE FROM mail;

INSERT INTO person(email, title, passhash) VALUES ('molly@books.com', 'Molly Member', '$2b$10$Y00XOZD/f5gBSpDusPUgU.iJufk6Nxx6gAoHRG8t2eHyGgoP2bK4y');
INSERT INTO person(email, title, passhash) VALUES ('anna@books.com', 'Anna Admin', '$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze');
INSERT INTO person(email, title, passhash) VALUES ('gary@books.com', 'Gary Green', '$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze');
INSERT INTO person(email, title, passhash) VALUES ('frank@books.com', 'Frank Fun', '$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze');

INSERT INTO mailboxes(title, email_owner) VALUES ('School', 'molly@books.com');
INSERT INTO mailboxes(title, email_owner) VALUES ('Work', 'anna@books.com');

INSERT INTO mail(details) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-01-10T06:00:04+0000", "subject": "One Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-01-20T06:00:04+0000", "subject": "Two Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-01-15T06:00:04+0000", "subject": "Three Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-01-25T06:00:04+0000", "subject": "Four Inbox", "content": "Random Context"}');

INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-02-10T06:00:04+0000", "subject": "One Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-02-20T06:00:04+0000", "subject": "Two Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-02-15T06:00:04+0000", "subject": "Three Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "molly@books.com", "name": "Molly Member"}, "received": "2022-02-25T06:00:04+0000", "subject": "Four Trash", "content": "Random Context"}', 'Trash');

INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "molly@books.com", "name": "Molly Member"}, "to": {"email": "gary@books.com", "name": "Gary Green"}, "received": "2022-03-10T06:00:04+0000", "subject": "One Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "molly@books.com", "name": "Molly Member"}, "to": {"email": "frank@books.com", "name": "Frank Fun"}, "received": "2022-03-20T06:00:04+0000", "subject": "Two Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "molly@books.com", "name": "Molly Member"}, "to": {"email": "gary@books.com", "name": "Gary Green"}, "received": "2022-03-15T06:00:04+0000", "subject": "Three Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "molly@books.com", "name": "Molly Member"}, "to": {"email": "frank@books.com", "name": "Frank Fun"}, "received": "2022-03-25T06:00:04+0000", "subject": "Four Sent", "content": "Random Context"}', 'Sent');

INSERT INTO mail(details) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-01-10T06:00:04+0000", "subject": "One Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-01-20T06:00:04+0000", "subject": "Two Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-01-15T06:00:04+0000", "subject": "Three Inbox", "content": "Random Context"}');
INSERT INTO mail(details) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-01-25T06:00:04+0000", "subject": "Four Inbox", "content": "Random Context"}');

INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-02-10T06:00:04+0000", "subject": "One Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-02-20T06:00:04+0000", "subject": "Two Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "gary@books.com", "name": "Gary Green"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-02-15T06:00:04+0000", "subject": "Three Trash", "content": "Random Context"}', 'Trash');
INSERT INTO mail(details, to_mailbox) VALUES ('{"from": {"email": "frank@books.com", "name": "Frank Fun"}, "to": {"email": "anna@books.com", "name": "Anna Admin"}, "received": "2022-02-25T06:00:04+0000", "subject": "Four Trash", "content": "Random Context"}', 'Trash');

INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "anna@books.com", "name": "Anna Admin"}, "to": {"email": "gary@books.com", "name": "Gary Green"}, "received": "2022-03-10T06:00:04+0000", "subject": "One Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "anna@books.com", "name": "Anna Admin"}, "to": {"email": "frank@books.com", "name": "Frank Fun"}, "received": "2022-03-20T06:00:04+0000", "subject": "Two Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "anna@books.com", "name": "Anna Admin"}, "to": {"email": "gary@books.com", "name": "Gary Green"}, "received": "2022-03-15T06:00:04+0000", "subject": "Three Sent", "content": "Random Context"}', 'Sent');
INSERT INTO mail(details, from_mailbox) VALUES ('{"from": {"email": "anna@books.com", "name": "Anna Admin"}, "to": {"email": "frank@books.com", "name": "Frank Fun"}, "received": "2022-03-25T06:00:04+0000", "subject": "Four Sent", "content": "Random Context"}', 'Sent');