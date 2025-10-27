
export const USERS_KEY = ['users'] as const;
export const USER_KEY = (id: number) => [...USERS_KEY, id] as const;
