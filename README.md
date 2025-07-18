## Getting Started

Follow instructions in the User Manual of our final project [report](https://docs.google.com/document/d/1Owfundkk6FYjnnHgYOPXYIzI8_D23WNO1a1wOq7sxe8/edit?tab=t.0) to set up a local development environment or deploy to Render.

## Codebase Folder Structure

- `client`: Contains the frontend application code, responsible for the user interface and interacting with the backend. This directory includes all React components and related assets.
- `server`: Contains the backend application code, handling the logic, APIs, and database interactions. It serves requests from the client and processes data accordingly.
- `shared`: Contains all shared type definitions that are used by both the client and server. This helps maintain consistency and reduces duplication of code between the two folders. The type definitions are imported and shared within each folder's `types/types.ts` file.

## Database Architecture

The schemas for the database are documented in the directory `server/models/schema`.

## API Routes

### `/answer`

| Endpoint   | Method | Description      |
| ---------- | ------ | ---------------- |
| /addAnswer | POST   | Add a new answer |

### `/comment`

| Endpoint    | Method | Description       |
| ----------- | ------ | ----------------- |
| /addComment | POST   | Add a new comment |

### `/messaging`

| Endpoint     | Method | Description           |
| ------------ | ------ | --------------------- |
| /addMessage  | POST   | Add a new message     |
| /getMessages | GET    | Retrieve all messages |
| /voteOnPoll  | PATCH  | Add a vote to a poll  |

### `/question`

| Endpoint          | Method | Description                     |
| ----------------- | ------ | ------------------------------- |
| /getQuestion      | GET    | Fetch questions by filter       |
| /getQuestionById/ | GET    | Fetch a specific question by ID |
| /addQuestion      | POST   | Add a new question              |
| /upvoteQuestion   | POST   | Upvote a question               |
| /downvoteQuestion | POST   | Downvote a question             |

### `/tag`

| Endpoint                   | Method | Description                                   |
| -------------------------- | ------ | --------------------------------------------- |
| /getTagsWithQuestionNumber | GET    | Fetch tags along with the number of questions |
| /getTagByName/             | GET    | Fetch a specific tag by name                  |

### `/user`

| Endpoint         | Method | Description                    |
| ---------------- | ------ | ------------------------------ |
| /signup          | POST   | Create a new user account      |
| /login           | POST   | Log in as a user               |
| /resetPassword   | PATCH  | Reset user password            |
| /getUser/        | GET    | Fetch user details by username |
| /getUsers        | GET    | Fetch all users                |
| /deleteUser/     | DELETE | Delete a user by username      |
| /updateBiography | PATCH  | Update user biography          |
| /updateSocket    | PATCH  | Update user's socket ID        |

### `/chat`

| Endpoint                    | Method | Description                                                                 |
| --------------------------- | ------ | --------------------------------------------------------------------------- |
| /createChat                 | POST   | Create a new chat.                                                          |
| /:chatId/addMessage         | POST   | Add a new message to an existing chat.                                      |
| /:chatId`                   | GET    | Retrieve a chat by its ID, optionally populating participants and messages. |
| /:chatId/addParticipant     | POST   | Add a new participant to an existing chat.                                  |
| /getChatsByUser/:username   | GET    | Retrieve all chats for a specific user based on their username.             |
| /:chatId/changeUserRole     | PATCH  | Change a user's permissions                                                 |
| /:chatId/message/:messageId | DELETE | Delete a message from a chat                                                |

### `/games`

| Endpoint | Method | Description           |
| -------- | ------ | --------------------- |
| /create  | POST   | Create a new game     |
| /join    | POST   | Join an existing game |
| /leave   | POST   | Leave a game          |
| /games   | GET    | Retrieve all games    |

### `/whiteboard`

| Endpoint        | Method | Description                        |
| --------------- | ------ | ---------------------------------- |
| /addWhiteboard  | POST   | Create a new whiteboard            |
| /:uniqueLink    | GET    | Retrieve a whiteboard by its id    |
| /byOwner/:owner | GET    | Retrieve a whiteboard by its owner |
| /:uniqueLink    | DELETE | Delete a whiteboard                |

## Running Stryker Mutation Testing

Mutation testing helps you measure the effectiveness of your tests by introducing small changes (mutations) to your code and checking if your tests catch them. To run mutation testing with Stryker, use the following command in `server/`:

```sh
npm run stryker
```

{ : .note } In case you face an "out of memory" error while running Stryker, use the following command to increase the memory allocation to 4GB for Node.js:

```sh
node --max-old-space-size=4096 ./node_modules/.bin/stryker run
```
