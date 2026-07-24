export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  phone: string | null;
  birth_date: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
