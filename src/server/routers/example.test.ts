import { expect } from 'chai';
import { ServicesContext } from '../services';
import { UserService } from '../services/user.service';
import { exampleRouter } from './example';

/**
 * Unit tests for the example router
 * Tests tRPC procedures using Mocha and Chai
 */
describe('Example Router', () => {
  // Create a mock context for testing
  function createMockContext() {
    // Note: Tests need services to be initialized first
    // For now, create a minimal mock context
    return {
      req: undefined,
      headers: undefined,
      services: {
        user: ServicesContext.lookup(UserService),
      },
    };
  }

  describe('hello query', () => {
    it('should return greeting without name', async () => {
      const caller = exampleRouter.createCaller(createMockContext());
      const result = await caller.hello({});

      expect(result.message).to.equal('Hello World!');
    });

    it('should return greeting with name', async () => {
      const caller = exampleRouter.createCaller(createMockContext());
      const result = await caller.hello({ name: 'Alice' });

      expect(result.message).to.equal('Hello Alice!');
    });
  });

  describe('add mutation', () => {
    it('should add two numbers', async () => {
      const caller = exampleRouter.createCaller(createMockContext());
      const result = await caller.add({ a: 5, b: 3 });

      expect(result.result).to.equal(8);
    });

    it('should handle negative numbers', async () => {
      const caller = exampleRouter.createCaller(createMockContext());
      const result = await caller.add({ a: -5, b: 3 });

      expect(result.result).to.equal(-2);
    });

    it('should handle decimals', async () => {
      const caller = exampleRouter.createCaller(createMockContext());
      const result = await caller.add({ a: 2.5, b: 1.5 });

      expect(result.result).to.equal(4);
    });
  });
});
