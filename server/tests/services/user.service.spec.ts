import mongoose from 'mongoose';
import UserModel from '../../models/users.model';
import {
  deleteUserByUsername,
  getUserByEmail,
  getUserByGoogleId,
  getUserByUsername,
  getUsersList,
  loginUser,
  loginWithGoogle,
  removeSocketBySocketId,
  saveUser,
  updateUser,
} from '../../services/user.service';
import * as util from '../../services/user.service';
import { GoogleCredentials, SafeDatabaseUser, User, UserCredentials } from '../../types/types';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeDatabaseUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const retrievedUser = (await getUserByUsername(user.username)) as SafeDatabaseUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });
});

describe('getUserByGoogleId', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const retrievedUser = (await getUserByGoogleId(user.googleId ?? '')) as SafeDatabaseUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const getUserError = await getUserByGoogleId(user.googleId ?? '');

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

    const getUserError = await getUserByGoogleId(user.googleId ?? '');

    expect('error' in getUserError).toBe(true);
  });
});

describe('getUserByEmail', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');
    const retrievedUser = (await getUserByEmail(user.username)) as SafeDatabaseUser;
    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');
    const getUserError = await getUserByEmail(user.username);
    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');
    const getUserError = await getUserByEmail(user.username);
    expect('error' in getUserError).toBe(true);
  });
});

describe('getUsersList', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the users', async () => {
    mockingoose(UserModel).toReturn([safeUser], 'find');

    const retrievedUsers = (await getUsersList()) as SafeDatabaseUser[];

    expect(retrievedUsers[0].username).toEqual(safeUser.username);
    expect(retrievedUsers[0].dateJoined).toEqual(safeUser.dateJoined);
  });

  it('should throw an error if the users cannot be found', async () => {
    mockingoose(UserModel).toReturn(null, 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    mockingoose(UserModel).toReturn(new Error('Error finding document'), 'find');

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password || '',
    };

    const loggedInUser = (await loginUser(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.username).toEqual(user.username);
    expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return the user if the password fails', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: 'wrongPassword',
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });

  it('should return the user is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');

    const credentials: UserCredentials = {
      username: 'wrongUsername',
      password: user.password || '',
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error deleting object'), 'findOneAndDelete');

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });
});

describe('removeSocketBySocketId', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    const socketId = '12345';
    const updatedUser: SafeDatabaseUser = {
      ...safeUser,
      socketId: '',
    };

    mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

    const result = (await removeSocketBySocketId(socketId)) as SafeDatabaseUser;

    expect(result.socketId).toEqual('');
  });

  it('should throw an error if the username is not found', async () => {
    const socketId = '12345';

    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const updatedError = await removeSocketBySocketId(socketId);

    expect('error' in updatedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    const socketId = '12345';

    mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

    const updatedError = await removeSocketBySocketId(socketId);

    expect('error' in updatedError).toBe(true);
  });
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeDatabaseUser = {
    _id: new mongoose.Types.ObjectId(),
    username: user.username,
    dateJoined: user.dateJoined,
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

    const result = (await updateUser(user.username, updates)) as SafeDatabaseUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should update the biography if the user is found', async () => {
    const newBio = 'This is a new biography';
    // Make a new partial updates object just for biography
    const biographyUpdates: Partial<User> = { biography: newBio };

    // Mock the DB to return a safe user (i.e., no password in results)
    mockingoose(UserModel).toReturn({ ...safeUpdatedUser, biography: newBio }, 'findOneAndUpdate');

    const result = await updateUser(user.username, biographyUpdates);

    // Check that the result is a SafeUser and the biography got updated
    if ('username' in result) {
      expect(result.biography).toEqual(newBio);
    } else {
      throw new Error('Expected a safe user, got an error object.');
    }
  });

  it('should return an error if biography update fails because user not found', async () => {
    // Simulate user not found
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

    const newBio = 'No user found test';
    const biographyUpdates: Partial<User> = { biography: newBio };
    const updatedError = await updateUser(user.username, biographyUpdates);

    expect('error' in updatedError).toBe(true);
  });
});

describe('loginWithGoogle', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'getUserByGoogleId');

    const credentials: GoogleCredentials = {
      googleId: user.googleId || '',
      email: user.password || '',
    };

    const loggedInUser = (await loginWithGoogle(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.googleId).toEqual(user.googleId);
  });

  it('should return the user if authentication fails but email login works', async () => {
    mockingoose(UserModel).toReturn({ error: 'whoops' }, 'getUserByGoogleId');

    const credentials: GoogleCredentials = {
      googleId: user.googleId || '',
      email: user.password || '',
    };

    const loggedInUser = (await loginWithGoogle(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.googleId).toEqual(user.googleId);
  });

  it('should return a new user if authentication by google id and email fails', async () => {
    mockingoose(UserModel).toReturn(null, 'getUserByGoogleId');
    mockingoose(UserModel).toReturn(null, 'getUserByEmail');

    const credentials: GoogleCredentials = {
      googleId: user.googleId || '',
      email: user.password || '',
    };

    const loggedInUser = (await loginWithGoogle(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.googleId).toEqual(user.googleId);
  });

  it('should return an error if authentication by google id and email fails and saving a new user fails', async () => {
    mockingoose(UserModel).toReturn(null, 'getUserByGoogleId');
    mockingoose(UserModel).toReturn(null, 'getUserByEmail');
    jest.spyOn(UserModel, 'create').mockRejectedValueOnce(() => ({
      error: 'Error saving document',
    }));

    const credentials: GoogleCredentials = {
      googleId: user.googleId || '',
      email: user.password || '',
    };

    const loggedInUser = await loginWithGoogle(credentials);

    expect('error' in loggedInUser).toBe(true);
  });

  it('should update existing user with Google ID and avatar if email matches', async () => {
    const mockUserFromEmail = {
      ...safeUser,
      googleId: undefined,
      avatarUrl: 'http://example.com/old-avatar.png',
    };

    const updatedUser = {
      ...mockUserFromEmail,
      googleId: 'google-xyz',
      avatarUrl: 'http://example.com/new-avatar.png',
    };

    jest.spyOn(util, 'getUserByGoogleId').mockResolvedValue({ error: 'User not found' });

    jest.spyOn(util, 'getUserByEmail').mockResolvedValue(mockUserFromEmail);

    jest.spyOn(util, 'updateUser').mockResolvedValue(updatedUser);

    const googleCredentials = {
      googleId: 'google-xyz',
      email: mockUserFromEmail.email || '',
      picture: 'http://example.com/new-avatar.png',
    };

    const result = await loginWithGoogle(googleCredentials);

    expect(result).toEqual(updatedUser);
    expect('error' in result).toBe(false);
  });

  it('should return an error if updating user with Google ID fails', async () => {
    const mockUserFromEmail = {
      ...safeUser,
      googleId: undefined,
      avatarUrl: 'http://example.com/old-avatar.png',
    };

    // Step 1: No user found by Google ID
    jest.spyOn(util, 'getUserByGoogleId').mockResolvedValue({ error: 'User not found' });

    // Step 2: User found by email
    jest.spyOn(util, 'getUserByEmail').mockResolvedValue(mockUserFromEmail);

    // Step 3: Simulate update failure
    jest
      .spyOn(util, 'updateUser')
      .mockResolvedValue({ error: 'Failed to update user with Google ID' });

    const googleCredentials = {
      googleId: 'google-xyz',
      email: mockUserFromEmail.email || '',
      picture: 'http://example.com/new-avatar.png',
    };

    const result = await loginWithGoogle(googleCredentials);

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Failed to update user with Google ID');
    } else {
      throw new Error('Expected result to be an error, but got a user object instead.');
    }
  });
});
