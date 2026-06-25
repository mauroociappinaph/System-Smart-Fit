import { UserRegistered } from '../events/user-registered.event';

export enum UserGoal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_MUSCLE = 'GAIN_MUSCLE',
  IMPROVE_ENDURANCE = 'IMPROVE_ENDURANCE',
  MAINTAIN_FITNESS = 'MAINTAIN_FITNESS',
}

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _weightKg: number,
    private readonly _heightCm: number,
    private readonly _birthDate: number,
    private readonly _goal: UserGoal,
    private readonly _registeredAt: number,
  ) {}

  public get id(): string { return this._id; }
  public get name(): string { return this._name; }
  public get weightKg(): number { return this._weightKg; }
  public get heightCm(): number { return this._heightCm; }
  public get birthDate(): number { return this._birthDate; }
  public get goal(): UserGoal { return this._goal; }
  public get registeredAt(): number { return this._registeredAt; }

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
    if (!Object.values(UserGoal).includes(goal)) {
      throw new Error(`User: invalid goal "${goal}"`);
    }

    const entity = new User(id, name, weightKg, heightCm, birthDate, goal, registeredAt);

    const event = new UserRegistered(eventId, id, registeredAt, {
      name,
      weightKg,
      heightCm,
      birthDate,
      goal,
    });

    return { entity, event };
  }
}
