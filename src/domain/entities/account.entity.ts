export class Account {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

