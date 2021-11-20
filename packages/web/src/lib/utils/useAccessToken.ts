import { makeAutoObservable } from 'mobx';

export class AccessToken {
  value: string | null = null;
  expiry: Date | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  set(newValue: string, newExpiry: Date) {
    this.value = newValue;
    this.expiry = newExpiry;
  }
}

let globalAccessToken: AccessToken | null = null;

export const useAccessToken = () => {
  const accessToken = globalAccessToken ?? new AccessToken();
  globalAccessToken = accessToken;
  return accessToken;
};
