import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Message collection.
 *
 * This schema defines a message that can optionally include a poll.
 * For poll messages:
 * - poll.question is the poll prompt.
 * - poll.options is an array of options (each with an optionText).
 * - poll.votes is a Map that records each user's vote by storing the option index.
 *   This ensures that each user can vote only once. Changing a vote simply involves
 *   updating the stored option index for that user.
 */
const messageSchema: Schema = new Schema(
  {
    msg: {
      type: String,
    },
    msgFrom: {
      type: String,
    },
    msgDateTime: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['global', 'direct', 'poll'],
    },
    poll: {
      question: {
        type: String,
      },
      options: [
        {
          optionText: {
            type: String,
          },
        },
      ],
      // votes Map: keys are usernames, values are the index of the option the user voted for.
      votes: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  },
  { collection: 'Message' },
);

export default messageSchema;
