import {
  Award,
  Clock,
  Globe,
  Heart,
  Leaf,
  Package,
  ShieldCheck,
  Star,
  ThumbsUp,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Truck,
  Users,
  Heart,
  Star,
  Zap,
  Award,
  Package,
  ThumbsUp,
  Clock,
  Leaf,
  Globe,
};

export const availableIcons = Object.keys(iconMap);
