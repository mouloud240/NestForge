import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserService } from '../../../core/user/v1/user.service.js';
import { User } from '../../../core/user/entities/user.entity.js';

/**
 * DataLoader for User entity to solve N+1 query problem
 *
 * Batches and caches User queries within a single GraphQL request
 * to prevent multiple database calls for the same user.
 */
@Injectable()
export class UserDataLoader {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new DataLoader instance for batching user queries by ID
   *
   * Must be called once per GraphQL request to ensure proper caching scope
   *
   * @returns DataLoader instance for User entities
   */
  createLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(
      async (userIds: readonly string[]) => {
        // DataLoader batches all load() calls in the same event loop tick,
        // then this function resolves them in the order the IDs were given
        const users = await Promise.all(
          userIds.map((id) => this.userService.findById(id)),
        );

        return users;
      },
      {
        // Cache results within the same request
        cache: true,
        // Batch multiple load() calls in the same event loop tick
        batch: true,
      },
    );
  }
}
