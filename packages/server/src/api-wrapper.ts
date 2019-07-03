import { LoginBody, DateSchemaWithoutID, DateType, DateSchema, YearSettingType } from '../shared/types/api';

class API {
  private AUTH_API = '/api/auth';
  private DATES_API = `/api/${this.version}/`;
  private changes: object[] = [];

  constructor(public readonly version: string) {}

  public async login(username: string, password: string) {
    const credentials: LoginBody = { username, password };
    const response = await fetch(`${this.AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Your username or password was incorrect.');
      }
      throw new Error('Please check your internet connection.');
    }
  }

  public async logout() {
    const response = await fetch(`${this.AUTH_API}/logout`, { method: 'POST' });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('You are already logged out. Refresh the page.');
      }
      throw new Error('There was a problem logging out.');
    }
  }

  public async getDates(year: string, type: string): Promise<DateSchema[]> {
    const response = await fetch(`${this.DATES_API}/dates?year=${year}&type=${type}`);
    if (!response.ok) {
      throw new Error('There was a problem getting dates.');
    }
    return response.json();
  }

  public addDates(dates: DateSchemaWithoutID[]) {
    const insertions = dates.map((date) => ({ insertOne: { document: date } }));
    this.changes.push(...insertions);
  }

  public removeDate(type: DateType, year: string, date: string) {
    const deletion = { deleteOne: { filter: { type, year, date } } };
    this.changes.push(deletion);
  }

  public editSetting(type: YearSettingType, year: string, setting: DateSchemaWithoutID) {
    const update = {
      updateOne: {
        filter: { type, year },
        update: { $set: setting },
        upsert: true,
      },
    };
    this.changes.push(update);
  }

  public async commitDateChanges() {
    const hasChanges = this.changes.length > 0;
    if (hasChanges) {
      const response = await fetch(`${this.DATES_API}/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.changes),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not authorized to modify dates.');
        }
        throw new Error('There was a problem saving your changes.');
      }
      this.changes = [];
    }
    return hasChanges;
  }
}

export default new API('/v3');
