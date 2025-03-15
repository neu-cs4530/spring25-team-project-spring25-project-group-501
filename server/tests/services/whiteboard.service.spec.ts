import WhiteboardModel from '../../models/whiteboard.model';
import {
  saveWhiteboard,
  getWhiteboardByLink,
  getWhiteBoardsByOwner,
  updateWhiteboard,
  deleteWhiteboardByLink,
} from '../../services/whiteboard.service';
import { whiteboard, whiteboard2 } from '../mockData.models';
import { Whiteboard } from '@fake-stack-overflow/shared';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Whiteboard model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveWhiteboard', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved whiteboard', async () => {
      mockingoose(WhiteboardModel).toReturn(whiteboard, 'create');

      const savedWhiteboard = (await saveWhiteboard(whiteboard)) as Whiteboard;

      expect(savedWhiteboard._id).toBeDefined();
      expect(savedWhiteboard.owner).toEqual(whiteboard.owner);
      expect(savedWhiteboard.title).toEqual(whiteboard.title);
      expect(savedWhiteboard.dateCreated).toEqual(whiteboard.dateCreated);
      expect(savedWhiteboard.content).toEqual(whiteboard.content);
      expect(savedWhiteboard.uniqueLink).toEqual(whiteboard.uniqueLink);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(WhiteboardModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveWhiteboard(whiteboard);

      expect('error' in saveError).toBe(true);
    });
  });

  describe('getWhiteboardByLink', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the matching whiteboard', async () => {
      mockingoose(WhiteboardModel).toReturn(whiteboard, 'findOne');

      const retrievedWhiteboard = (await getWhiteboardByLink(whiteboard.uniqueLink)) as Whiteboard;

      expect(retrievedWhiteboard.owner).toEqual(whiteboard.owner);
      expect(retrievedWhiteboard.title).toEqual(whiteboard.title);
      expect(retrievedWhiteboard.dateCreated).toEqual(whiteboard.dateCreated);
      expect(retrievedWhiteboard.content).toEqual(whiteboard.content);
      expect(retrievedWhiteboard.uniqueLink).toEqual(whiteboard.uniqueLink);
    });

    it('should throw an error if whiteboard not found', async () => {
      mockingoose(WhiteboardModel).toReturn(null, 'findOne');

      const getError = await getWhiteboardByLink(whiteboard.uniqueLink);

      expect('error' in getError).toBe(true);
    });
  });

  describe('getWhiteBoardsByOwner', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the matching whiteboards', async () => {
      mockingoose(WhiteboardModel).toReturn([whiteboard, whiteboard2], 'find');

      const retrievedWhiteboards = await getWhiteBoardsByOwner(whiteboard.owner);

      expect(retrievedWhiteboards.length).toEqual(2);
      expect(retrievedWhiteboards[0].owner).toEqual(whiteboard.owner);
      expect(retrievedWhiteboards[1].owner).toEqual(whiteboard.owner);
      expect(retrievedWhiteboards[0].title).toEqual(whiteboard.title);
      expect(retrievedWhiteboards[1].title).toEqual(whiteboard2.title);
      expect(retrievedWhiteboards[0].dateCreated).toEqual(whiteboard.dateCreated);
      expect(retrievedWhiteboards[1].dateCreated).toEqual(whiteboard2.dateCreated);
      expect(retrievedWhiteboards[0].content).toEqual(whiteboard.content);
      expect(retrievedWhiteboards[1].content).toEqual(whiteboard2.content);
      expect(retrievedWhiteboards[0].uniqueLink).toEqual(whiteboard.uniqueLink);
      expect(retrievedWhiteboards[1].uniqueLink).toEqual(whiteboard2.uniqueLink);
    });

    it('should return an empty array if no whiteboards found', async () => {
      mockingoose(WhiteboardModel).toReturn(null, 'find');

      const retrievedWhiteboards = await getWhiteBoardsByOwner(whiteboard.owner);

      expect(retrievedWhiteboards.length).toEqual(0);
    });
  });

  describe('updateWhiteboard', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the updated whiteboard', async () => {
      const updatedWhiteboard: Whiteboard = {
        ...whiteboard,
        content: whiteboard2.content,
      };

      mockingoose(WhiteboardModel).toReturn(updatedWhiteboard, 'findOneAndUpdate');

      const result = (await updateWhiteboard(whiteboard.uniqueLink, {
        content: whiteboard2.content,
      })) as Whiteboard;

      expect(result.owner).toEqual(whiteboard.owner);
      expect(result.title).toEqual(whiteboard.title);
      expect(result.dateCreated).toEqual(whiteboard.dateCreated);
      expect(result.content).toEqual(whiteboard2.content);
      expect(result.uniqueLink).toEqual(whiteboard.uniqueLink);
    });

    it('should throw an error if whiteboard not found', async () => {
      mockingoose(WhiteboardModel).toReturn(null, 'findOneAndUpdate');

      const updateError = await updateWhiteboard(whiteboard.uniqueLink, whiteboard2);

      expect('error' in updateError).toBe(true);
    });
  });

  describe('deleteWhiteboardByLink', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the deleted whiteboard', async () => {
      mockingoose(WhiteboardModel).toReturn(whiteboard, 'findOneAndDelete');

      const result = (await deleteWhiteboardByLink(whiteboard.uniqueLink)) as Whiteboard;

      expect(result.owner).toEqual(whiteboard.owner);
      expect(result.title).toEqual(whiteboard.title);
      expect(result.dateCreated).toEqual(whiteboard.dateCreated);
      expect(result.content).toEqual(whiteboard.content);
      expect(result.uniqueLink).toEqual(whiteboard.uniqueLink);
    });

    it('should throw an error if whiteboard not found', async () => {
      mockingoose(WhiteboardModel).toReturn(null, 'findOneAndDelete');

      const deleteError = await deleteWhiteboardByLink(whiteboard.uniqueLink);

      expect('error' in deleteError).toBe(true);
    });
  });
});
