import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

// Map of icon name strings to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // Common icons
  Home: LucideIcons.Home,
  Link: LucideIcons.Link,
  ExternalLink: LucideIcons.ExternalLink,
  Globe: LucideIcons.Globe,
  FileText: LucideIcons.FileText,
  File: LucideIcons.File,
  Folder: LucideIcons.Folder,
  Image: LucideIcons.Image,
  Settings: LucideIcons.Settings,
  Users: LucideIcons.Users,
  User: LucideIcons.User,
  Mail: LucideIcons.Mail,
  Phone: LucideIcons.Phone,
  MapPin: LucideIcons.MapPin,
  Calendar: LucideIcons.Calendar,
  Clock: LucideIcons.Clock,
  Bell: LucideIcons.Bell,
  Search: LucideIcons.Search,
  Plus: LucideIcons.Plus,
  Minus: LucideIcons.Minus,
  Check: LucideIcons.Check,
  X: LucideIcons.X,
  ChevronDown: LucideIcons.ChevronDown,
  ChevronUp: LucideIcons.ChevronUp,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  Menu: LucideIcons.Menu,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  MoreVertical: LucideIcons.MoreVertical,
  
  // Service/Government related
  Building: LucideIcons.Building,
  Building2: LucideIcons.Building2,
  Landmark: LucideIcons.Landmark,
  Scale: LucideIcons.Scale,
  Briefcase: LucideIcons.Briefcase,
  Gavel: LucideIcons.Gavel,
  Shield: LucideIcons.Shield,
  ShieldCheck: LucideIcons.ShieldCheck,
  FileCheck: LucideIcons.FileCheck,
  FileSearch: LucideIcons.FileSearch,
  FilePlus: LucideIcons.FilePlus,
  ClipboardList: LucideIcons.ClipboardList,
  ClipboardCheck: LucideIcons.ClipboardCheck,
  ScrollText: LucideIcons.ScrollText,
  BookOpen: LucideIcons.BookOpen,
  GraduationCap: LucideIcons.GraduationCap,
  Award: LucideIcons.Award,
  
  // Health related
  Heart: LucideIcons.Heart,
  HeartPulse: LucideIcons.HeartPulse,
  Stethoscope: LucideIcons.Stethoscope,
  Activity: LucideIcons.Activity,
  
  // Nature/Environment
  Leaf: LucideIcons.Leaf,
  TreeDeciduous: LucideIcons.TreeDeciduous,
  Sun: LucideIcons.Sun,
  Cloud: LucideIcons.Cloud,
  Droplets: LucideIcons.Droplets,
  
  // Communication
  MessageSquare: LucideIcons.MessageSquare,
  MessageCircle: LucideIcons.MessageCircle,
  Send: LucideIcons.Send,
  Inbox: LucideIcons.Inbox,
  
  // Media
  Camera: LucideIcons.Camera,
  Video: LucideIcons.Video,
  Music: LucideIcons.Music,
  Headphones: LucideIcons.Headphones,
  
  // Actions
  Download: LucideIcons.Download,
  Upload: LucideIcons.Upload,
  Share: LucideIcons.Share,
  Share2: LucideIcons.Share2,
  Copy: LucideIcons.Copy,
  Edit: LucideIcons.Edit,
  Trash: LucideIcons.Trash,
  Trash2: LucideIcons.Trash2,
  Save: LucideIcons.Save,
  Printer: LucideIcons.Printer,
  
  // Status
  CheckCircle: LucideIcons.CheckCircle,
  XCircle: LucideIcons.XCircle,
  AlertCircle: LucideIcons.AlertCircle,
  AlertTriangle: LucideIcons.AlertTriangle,
  Info: LucideIcons.Info,
  HelpCircle: LucideIcons.HelpCircle,
  
  // Navigation
  ArrowUp: LucideIcons.ArrowUp,
  ArrowDown: LucideIcons.ArrowDown,
  ArrowLeft: LucideIcons.ArrowLeft,
  ArrowRight: LucideIcons.ArrowRight,
  CornerDownRight: LucideIcons.CornerDownRight,
  
  // Social
  Facebook: LucideIcons.Facebook,
  Twitter: LucideIcons.Twitter,
  Instagram: LucideIcons.Instagram,
  Youtube: LucideIcons.Youtube,
  Linkedin: LucideIcons.Linkedin,
  Github: LucideIcons.Github,
  
  // Tech
  Wifi: LucideIcons.Wifi,
  WifiOff: LucideIcons.WifiOff,
  Smartphone: LucideIcons.Smartphone,
  Monitor: LucideIcons.Monitor,
  Laptop: LucideIcons.Laptop,
  Server: LucideIcons.Server,
  Database: LucideIcons.Database,
  
  // Finance
  DollarSign: LucideIcons.DollarSign,
  CreditCard: LucideIcons.CreditCard,
  Wallet: LucideIcons.Wallet,
  Receipt: LucideIcons.Receipt,
  PiggyBank: LucideIcons.PiggyBank,
  
  // Transport
  Car: LucideIcons.Car,
  Bus: LucideIcons.Bus,
  Bike: LucideIcons.Bike,
  Plane: LucideIcons.Plane,
  Ship: LucideIcons.Ship,
  Train: LucideIcons.Train,
  
  // Misc
  Tag: LucideIcons.Tag,
  Tags: LucideIcons.Tags,
  Star: LucideIcons.Star,
  Flag: LucideIcons.Flag,
  Bookmark: LucideIcons.Bookmark,
  Pin: LucideIcons.Pin,
  Lock: LucideIcons.Lock,
  Unlock: LucideIcons.Unlock,
  Key: LucideIcons.Key,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  MousePointer: LucideIcons.MousePointer,
  Zap: LucideIcons.Zap,
  Target: LucideIcons.Target,
  Compass: LucideIcons.Compass,
  Map: LucideIcons.Map,
  Navigation: LucideIcons.Navigation,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Grid: LucideIcons.Grid,
  List: LucideIcons.List,
  Table: LucideIcons.Table,
  Columns: LucideIcons.Columns,
  Rows: LucideIcons.Rows,
  BarChart: LucideIcons.BarChart,
  BarChart2: LucideIcons.BarChart2,
  LineChart: LucideIcons.LineChart,
  PieChart: LucideIcons.PieChart,
  TrendingUp: LucideIcons.TrendingUp,
  TrendingDown: LucideIcons.TrendingDown,
  Newspaper: LucideIcons.Newspaper,
  Megaphone: LucideIcons.Megaphone,
  HandHelping: LucideIcons.HandHelping,
  HelpingHand: LucideIcons.HelpingHand,
  UserCheck: LucideIcons.UserCheck,
  UserPlus: LucideIcons.UserPlus,
  UserMinus: LucideIcons.UserMinus,
  UserX: LucideIcons.UserX,
  UsersRound: LucideIcons.UsersRound,
  UserRound: LucideIcons.UserRound,
  CircleUser: LucideIcons.CircleUser,
  Contact: LucideIcons.Contact,
  IdCard: LucideIcons.IdCard,
  BadgeCheck: LucideIcons.BadgeCheck,
  BadgeInfo: LucideIcons.BadgeInfo,
  BadgeAlert: LucideIcons.BadgeAlert,
  CircleDollarSign: LucideIcons.CircleDollarSign,
  Coins: LucideIcons.Coins,
  Banknote: LucideIcons.Banknote,
  HandCoins: LucideIcons.HandCoins,
  Handshake: LucideIcons.Handshake,
  Construction: LucideIcons.Construction,
  Hammer: LucideIcons.Hammer,
  Wrench: LucideIcons.Wrench,
  ScanLine: LucideIcons.ScanLine,
  QrCode: LucideIcons.QrCode,
  SquareStack: LucideIcons.SquareStack,
  Layers: LucideIcons.Layers,
  Package: LucideIcons.Package,
  Box: LucideIcons.Box,
  Archive: LucideIcons.Archive,
  FolderOpen: LucideIcons.FolderOpen,
  FolderCheck: LucideIcons.FolderCheck,
  FileCode: LucideIcons.FileCode,
  FileCog: LucideIcons.FileCog,
  FileHeart: LucideIcons.FileHeart,
  FileWarning: LucideIcons.FileWarning,
  Files: LucideIcons.Files,
  FilePen: LucideIcons.FilePen,
};

// Get all available icon names for use in dropdowns/selectors
export const availableIcons = Object.keys(iconMap).sort();

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const DynamicIcon = forwardRef<SVGSVGElement, DynamicIconProps>(
  ({ name, className = "", size, strokeWidth }, ref) => {
    const IconComponent = iconMap[name] || LucideIcons.FileText;
    
    return (
      <IconComponent 
        ref={ref}
        className={className} 
        size={size}
        strokeWidth={strokeWidth}
      />
    );
  }
);

DynamicIcon.displayName = "DynamicIcon";

export default DynamicIcon;
