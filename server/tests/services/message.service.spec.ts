import mongoose from 'mongoose';
import MessageModel from '../../models/messages.model';
import UserModel from '../../models/users.model';
import { getMessages, saveMessage, voteOnPoll } from '../../services/message.service';
import { Message, DatabaseMessage } from '../../types/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1: Message = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
  type: 'global',
};

const message2: Message = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
  type: 'global',
};

const pollMessage: DatabaseMessage = {
  _id: new mongoose.Types.ObjectId(),
  msg: 'POLL',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-06'),
  type: 'poll',
  poll: {
    question: 'Test question?',
    options: [{ optionText: 'Option 1' }, { optionText: 'Option 2' }],
    votes: new Map(),
  },
};

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    const mockMessage: Message = {
      msg: 'Hey!',
      msgFrom: 'userX',
      msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
      type: 'direct',
    };

    it('should create a message successfully if user exists', async () => {
      // Mock the user existence check
      mockingoose(UserModel).toReturn(
        { _id: new mongoose.Types.ObjectId(), username: 'userX' },
        'findOne',
      );
      // Mock the created message
      const mockCreatedMsg = {
        _id: new mongoose.Types.ObjectId(),
        ...mockMessage,
      };
      mockingoose(MessageModel).toReturn(mockCreatedMsg, 'create');
      const result = await saveMessage(mockMessage);
      expect(result).toMatchObject({
        msg: 'Hey!',
        msgFrom: 'userX',
        msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
        type: 'direct',
      });
    });

    it('should return an error if user does not exist', async () => {
      // No user found
      mockingoose(UserModel).toReturn(null, 'findOne');
      const result = await saveMessage(mockMessage);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message sender is invalid');
      }
    });

    it('should return an error if message creation fails', async () => {
      mockingoose(UserModel).toReturn({ _id: 'someUserId' }, 'findOne');
      jest.spyOn(MessageModel, 'create').mockRejectedValueOnce(new Error('Create failed'));
      const result = await saveMessage(mockMessage);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Error when saving a message');
      }
    });
  });

  describe('getMessages', () => {
    it('should return all messages, sorted by date', async () => {
      mockingoose(MessageModel).toReturn([message2, message1], 'find');
      const messages = await getMessages();
      expect(messages).toMatchObject([message1, message2]);
    });

    it('should return an empty array if error when retrieving messages', async () => {
      jest
        .spyOn(MessageModel, 'find')
        .mockRejectedValueOnce(new Error('Error retrieving documents'));
      const messages = await getMessages();
      expect(messages).toEqual([]);
    });
  });

  describe('voteOnPoll', () => {
    it('should successfully add a vote to a poll', async () => {
      // Mock finding the poll message
      mockingoose(MessageModel).toReturn(pollMessage, 'findOne');

      // Mock the updated poll message
      const updatedPollMessage = {
        ...pollMessage,
        poll: {
          ...pollMessage.poll,
          votes: new Map([['testUser', 1]]),
        },
      };
      mockingoose(MessageModel).toReturn(updatedPollMessage, 'findOneAndUpdate');

      const result = await voteOnPoll(pollMessage._id.toString(), 1, 'testUser');
      expect(result).toMatchObject({
        _id: pollMessage._id,
        type: 'poll',
      });
    });

    it('should return error when message is not found', async () => {
      mockingoose(MessageModel).toReturn(null, 'findOne');

      const result = await voteOnPoll('nonexistentId', 0, 'testUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });

    it('should return error when message is not a poll', async () => {
      const nonPollMessage = {
        ...message1,
        _id: new mongoose.Types.ObjectId(),
      };
      mockingoose(MessageModel).toReturn(nonPollMessage, 'findOne');

      const result = await voteOnPoll(nonPollMessage._id.toString(), 0, 'testUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message is not a poll');
      }
    });

    it('should return error when poll update fails', async () => {
      mockingoose(MessageModel).toReturn(pollMessage, 'findOne');
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await voteOnPoll(pollMessage._id.toString(), 0, 'testUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error updating poll votes');
      }
    });

    it('should handle case when poll is undefined', async () => {
      const messageWithoutPoll = {
        ...pollMessage,
        poll: undefined,
      };
      mockingoose(MessageModel).toReturn(messageWithoutPoll, 'findOne');

      const result = await voteOnPoll(pollMessage._id.toString(), 0, 'testUser');
      expect('error' in result).toBe(true);
    });

    it('should handle case when poll votes map is undefined', async () => {
      const pollWithoutVotes = {
        ...pollMessage,
        poll: {
          question: 'Test question?',
          options: [{ optionText: 'Option 1' }, { optionText: 'Option 2' }],
          // votes field is missing
        },
      };

      mockingoose(MessageModel).toReturn(pollWithoutVotes, 'findOne');

      const updatedPollMessage = {
        ...pollWithoutVotes,
        poll: {
          ...pollWithoutVotes.poll,
          votes: new Map([['testUser', 0]]),
        },
      };
      mockingoose(MessageModel).toReturn(updatedPollMessage, 'findOneAndUpdate');

      const result = await voteOnPoll(pollMessage._id.toString(), 0, 'testUser');
      expect(result).toMatchObject({
        _id: pollMessage._id,
        type: 'poll',
      });
    });

    it('should handle database error during find operation', async () => {
      jest.spyOn(MessageModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const result = await voteOnPoll('someId', 0, 'testUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error when voting on poll');
      }
    });
  });
});
