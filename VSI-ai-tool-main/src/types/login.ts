export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  plan: string;
  avatarUrl?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
