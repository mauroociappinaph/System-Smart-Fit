import { UserRegistered } from '../events/user-registered.event';

export enum UserGoal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_MUSCLE = 'GAIN_MUSCLE',
  IMPROVE_ENDURANCE = 'IMPROVE_ENDURANCE',
  MAINTAIN_FITNESS = 'MAINTAIN_FITNESS',
}

export enum UserRole {
  USER = 'USER',
}

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _weightKg: number,
    private readonly _heightCm: number,
    private readonly _birthDate: number,
    private readonly _goal: UserGoal,
    private readonly _role: UserRole,
    private readonly _registeredAt: number,
  ) {}

  public get id(): string { return this._id; }
  public get name(): string { return this._name; }
  public get weightKg(): number { return this._weightKg; }
  public get heightCm(): number { return this._heightCm; }
  public get birthDate(): number { return this._birthDate; }
  public get goal(): UserGoal { return this._goal; }
  public get role(): UserRole { return this._role; }
  public get registeredAt(): number { return this._registeredAt; }

  /**
   * Reconstitute a User from persisted data (bypasses factory logic).
   * Intended for repository adapters only — no domain events are emitted.
   */
  public static reconstitute(options: {
    id: string;
    name: string;
    weightKg: number;
    heightCm: number;
    birthDate: number;
    goal: UserGoal;
    role: UserRole;
    registeredAt: number;
  }): User {
    return new User(
      options.id,
      options.name,
      options.weightKg,
      options.heightCm,
      options.birthDate,
      options.goal,
      options.role,
      options.registeredAt,
    );
  }

  /**
   * Factory method — creates a new User profile and its corresponding domain event.
   * IDs and timestamps must be injected to preserve domain purity.
   */
  public static register(
    id: string,
    eventId: string,
    name: string,
    weightKg: number,
    heightCm: number,
    birthDate: number,
    goal: UserGoal,
    role: UserRole,
    registeredAt: number,
  ): { entity: User; event: UserRegistered } {
    if (!name?.trim()) {
      throw new Error('User: name is required');
    }
    if (weightKg <= 0) {
      throw new Error('User: weightKg must be positive');
    }
    if (heightCm <= 0) {
      throw new Error('User: heightCm must be positive');
    }
    if (birthDate >= registeredAt) {
      throw new Error('User: birthDate must be before registration date');
    }
    if (birthDate <= 0) {
      throw new Error('User: birthDate must be a positive timestamp');
    }
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    if (registeredAt - birthDate < ONE_YEAR_MS) {
      throw new Error('User: user must be at least 1 year old');
    }
    const ONE_HUNDRED_TWENTY_YEARS_MS = 120 * 365 * 24 * 60 * 60 * 1000;
    if (registeredAt - birthDate > ONE_HUNDRED_TWENTY_YEARS_MS) {
      throw new Error('User: birthDate cannot be more than 120 years ago');
    }
    if (!Object.values(UserGoal).includes(goal)) {
      throw new Error(`User: invalid goal "${goal}"`);
    }
    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`User: invalid role "${role}"`);
    }

    const entity = new User(id, name, weightKg, heightCm, birthDate, goal, role, registeredAt);

    const event = new UserRegistered(eventId, id, registeredAt, {
      name,
      weightKg,
      heightCm,
      birthDate,
      goal,
      role,
    });

    return { entity, event };
  }
}
