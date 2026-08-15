export interface FeatureItemData {
  id: string;
  title: string;
  description: string;
  iconName: 'target' | 'analytics' | 'shield';
}

export interface StatItemData {
  value: string;
  label: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  plan: string;
}
