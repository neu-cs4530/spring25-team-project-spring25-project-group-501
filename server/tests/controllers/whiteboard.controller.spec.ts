import supertest from 'supertest';
import { Whiteboard } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as util from '../../services/whiteboard.service';

const saveWhiteboardSpy = jest.spyOn(util, 'saveWhiteboard');
const getWhiteboardByLinkSpy = jest.spyOn(util, 'getWhiteboardByLink');
const getWhiteBoardsByOwnerSpy = jest.spyOn(util, 'getWhiteBoardsByOwner');
const deleteWhiteboardByLinkSpy = jest.spyOn(util, 'deleteWhiteboardByLink');

describe('Test whiteboardController', () => {
  describe('POST /addWhiteboard', () => {
    it('should create a new whiteboard', async () => {
      const newWhiteboard = {
        owner: 'testOwner',
        title: 'testTitle',
        content: 'testContent',
        uniqueLink: 'testUniqueLink',
        accessType: 'public',
      };

      saveWhiteboardSpy.mockResolvedValue(newWhiteboard as Whiteboard);

      const response = await supertest(app).post('/whiteboard/addWhiteboard').send(newWhiteboard);

      expect(response.body).toEqual(newWhiteboard);
      expect(response.status).toBe(201);
    });

    it('should return 400 if request is invalid', async () => {
      const invalidWhiteboard = {
        owner: 'testOwner',
        title: 'testTitle',
        content: 'testContent',
      };

      const response = await supertest(app)
        .post('/whiteboard/addWhiteboard')
        .send(invalidWhiteboard)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 500 if there is an error saving the whiteboard', async () => {
      const newWhiteboard = {
        owner: 'testOwner',
        title: 'testTitle',
        content: 'testContent',
        uniqueLink: 'testUniqueLink',
        accessType: 'public',
      };

      saveWhiteboardSpy.mockResolvedValue({ error: 'Error saving whiteboard' });

      const response = await supertest(app)
        .post('/whiteboard/addWhiteboard')
        .send(newWhiteboard)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create whiteboard' });
    });
  });

  describe('GET /whiteboard/:uniqueLink', () => {
    it('should return the whiteboard if it exists', async () => {
      const whiteboard = {
        owner: 'testOwner',
        title: 'testTitle',
        content: 'testContent',
        uniqueLink: 'testUniqueLink',
        accessType: 'public',
      };

      getWhiteboardByLinkSpy.mockResolvedValue(whiteboard as Whiteboard);

      const response = await supertest(app).get('/whiteboard/testUniqueLink').expect(200);

      expect(response.body).toEqual(whiteboard);
    });

    it('should return 500 if there is an error retrieving the whiteboard', async () => {
      getWhiteboardByLinkSpy.mockResolvedValue({ error: 'Error retrieving whiteboard' });

      const response = await supertest(app).get('/whiteboard/testUniqueLink').expect(500);

      expect(response.body).toEqual({ error: 'Failed to retrieve whiteboard' });
    });
  });

  describe('GET /whiteboard/By/:owner', () => {
    it('should return all whiteboards owned by the user', async () => {
      const whiteboards = [
        {
          owner: 'testOwner',
          title: 'testTitle',
          content: 'testContent',
          uniqueLink: 'testUniqueLink1',
          accessType: 'public',
        },
        {
          owner: 'testOwner',
          title: 'testTitle2',
          content: 'testContent2',
          uniqueLink: 'testUniqueLink2',
          accessType: 'private',
        },
      ];

      getWhiteBoardsByOwnerSpy.mockResolvedValue(whiteboards as Whiteboard[]);

      const response = await supertest(app).get('/whiteboard/byOwner/testOwner').expect(200);

      expect(response.body).toEqual(whiteboards);
    });

    it('should return []] if there is an error retrieving the whiteboards', async () => {
      // getWhiteboardsByOwner should throw an explicit error
      getWhiteBoardsByOwnerSpy.mockResolvedValue([]);

      const response = await supertest(app).get('/whiteboard/byOwner/testOwner');

      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /whiteboard/:uniqueLink', () => {
    it('should delete the whiteboard if it exists', async () => {
      const whiteboard = {
        owner: 'testOwner',
        title: 'testTitle',
        content: 'testContent',
        uniqueLink: 'testUniqueLink',
        accessType: 'public',
      };

      deleteWhiteboardByLinkSpy.mockResolvedValue(whiteboard as Whiteboard);

      const response = await supertest(app).delete('/whiteboard/testUniqueLink').expect(200);

      expect(response.body).toEqual({});
    });

    it('should return 500 if there is an error deleting the whiteboard', async () => {
      deleteWhiteboardByLinkSpy.mockResolvedValue({ error: 'Error deleting whiteboard' });

      const response = await supertest(app).delete('/whiteboard/testUniqueLink').expect(500);

      expect(response.body).toEqual({ error: 'Failed to delete whiteboard' });
    });
  });
});
