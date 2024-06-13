import { atom } from 'recoil';

export const multiplierState = atom<number>({
  key: 'multiplierState',
  default: 1.0,
});

export const gameStatusState = atom<'waiting' | 'crashed'>({
  key: 'gameStatusState',
  default: 'waiting',
});
