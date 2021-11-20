import { makeAutoObservable } from 'mobx';

export class AccessToken {
  value: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  set(newValue: string) {
    this.value = newValue;
  }
}

let globalAccessToken: AccessToken | null = null;

export const useAccessToken = () => {
  const accessToken = globalAccessToken ?? new AccessToken();
  globalAccessToken = accessToken;
  return accessToken;
};
