import type { LucideIcon } from 'lucide-react-native';

export type SubCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  subs: SubCategory[];
};
