import 'reflect-metadata';
import { expect } from 'chai';
import { UserService } from './user.service';

/**
 * Unit tests for UserService
 * Tests service methods using Mocha and Chai
 */
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const user = userService.createUser('John Doe', 'john@example.com');

      expect(user).to.have.property('id');
      expect(user.name).to.equal('John Doe');
      expect(user.email).to.equal('john@example.com');
      expect(user.createdAt).to.be.instanceof(Date);
    });

    it('should increment user IDs', () => {
      const user1 = userService.createUser('User 1', 'user1@example.com');
      const user2 = userService.createUser('User 2', 'user2@example.com');

      expect(Number(user2.id)).to.be.greaterThan(Number(user1.id));
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array initially', () => {
      const users = userService.getAllUsers();
      expect(users).to.be.an('array').that.is.empty;
    });

    it('should return all created users', () => {
      userService.createUser('User 1', 'user1@example.com');
      userService.createUser('User 2', 'user2@example.com');

      const users = userService.getAllUsers();
      expect(users).to.have.lengthOf(2);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', () => {
      const created = userService.createUser('Test User', 'test@example.com');
      const found = userService.getUserById(created.id);

      expect(found).to.deep.equal(created);
    });

    it('should return null if user not found', () => {
      const found = userService.getUserById('nonexistent');
      expect(found).to.be.null;
    });
  });

  describe('updateUser', () => {
    it('should update user fields', () => {
      const user = userService.createUser('John Doe', 'john@example.com');
      const updated = userService.updateUser(user.id, {
        name: 'Jane Doe',
      });

      expect(updated?.name).to.equal('Jane Doe');
      expect(updated?.email).to.equal('john@example.com');
    });

    it('should return null if user not found', () => {
      const result = userService.updateUser('nonexistent', { name: 'New Name' });
      expect(result).to.be.null;
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {
      const user = userService.createUser('To Delete', 'delete@example.com');
      const deleted = userService.deleteUser(user.id);

      expect(deleted).to.be.true;
      expect(userService.getUserById(user.id)).to.be.null;
    });

    it('should return false if user not found', () => {
      const deleted = userService.deleteUser('nonexistent');
      expect(deleted).to.be.false;
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', () => {
      const user = userService.createUser('Test User', 'test@example.com');
      const found = userService.findByEmail('test@example.com');

      expect(found).to.deep.equal(user);
    });

    it('should return null if email not found', () => {
      const found = userService.findByEmail('nonexistent@example.com');
      expect(found).to.be.null;
    });
  });

  describe('initialize and shutdown', () => {
    it('should initialize without errors', async () => {
      try {
        await userService.initialize();
        expect(true).to.be.true;
      } catch (error) {
        expect.fail(`Initialize should not throw: ${error}`);
      }
    });

    it('should shutdown without errors', async () => {
      try {
        await userService.shutdown();
        expect(true).to.be.true;
      } catch (error) {
        expect.fail(`Shutdown should not throw: ${error}`);
      }
    });
  });
});
