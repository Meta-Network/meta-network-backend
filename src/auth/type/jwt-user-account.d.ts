export type JwtUserAccount = {
  id: number;

  user_id: number;

  account_id: string;

  platform: 'email' | string;

  created_at: Date;

  updated_at: Date;
};
