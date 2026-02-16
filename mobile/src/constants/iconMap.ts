import type { LucideIcon } from 'lucide-react-native';
import {
  // Categorias
  Siren,
  House,
  Monitor,
  Scissors,
  GraduationCap,
  Car,
  PartyPopper,
  // Subcategorias
  Paintbrush,
  BrickWall,
  Layers,
  PanelTop,
  Flower2,
  Bug,
  Smartphone,
  Laptop,
  Wifi,
  Hand,
  Palette,
  Heart,
  BookOpen,
  Languages,
  Music,
  Dumbbell,
  Wrench,
  Truck,
  Droplets,
  BatteryCharging,
  Camera,
  Disc3,
  UtensilsCrossed,
  Gift,
  // Extras (seed antigo)
  Zap,
  Sparkles,
  Hammer,
  Lightbulb,
  Home,
  Armchair,
  // Fallback
  HelpCircle,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  // Categorias
  Siren,
  House,
  Monitor,
  Scissors,
  GraduationCap,
  Car,
  PartyPopper,
  // Subcategorias
  Paintbrush,
  BrickWall,
  Layers,
  PanelTop,
  Flower2,
  Bug,
  Smartphone,
  Laptop,
  Wifi,
  Hand,
  Palette,
  Heart,
  BookOpen,
  Languages,
  Music,
  Dumbbell,
  Wrench,
  Truck,
  Droplets,
  BatteryCharging,
  Camera,
  Disc3,
  UtensilsCrossed,
  Gift,
  // Extras
  Zap,
  Sparkles,
  Hammer,
  Lightbulb,
  Home,
  Armchair,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return HelpCircle;
  return ICON_MAP[name] || HelpCircle;
}
