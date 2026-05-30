// ========== 基础实体 ==========

export interface User {
  id: string;
  username: string;
  realName: string;
  phone: string;
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'admin' | 'operator';
  status: 'active' | 'inactive' | 'locked';
  tenantId: string;
  departmentId: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Department {
  id: string;
  name: string;
  tenantId: string;
  memberCount: number;
  createdAt: string;
}

export interface Device {
  id: string;
  sn: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance' | 'disabled';
  merchantId: string;
  merchantName: string;
  location: string;
  lastOnlineAt?: string;
  firmwareVersion: string;
  otaVersion: string;
  bindingCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive' | 'draft';
  salesCount: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  userName: string;
  deviceId: string;
  deviceName: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  paidAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Member {
  id: string;
  nickname: string;
  phone: string;
  level: number;
  points: number;
  totalSpent: number;
  visitCount: number;
  lastVisitAt?: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  content: string;
  contactInfo?: string;
  status: 'pending' | 'processing' | 'resolved';
  reply?: string;
  createdAt: string;
}

// ========== 智能Aidol ==========

export interface IdolConfig {
  id: string;
  name: string;
  speakerId: string;
  speakerName: string;
  roleId: string;
  roleName: string;
  figureId: string;
  figureName: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  promptStyle: string;
  language: string;
  emotionEnabled: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface VoicePreset {
  id: string;
  speakerId: string;
  name: string;
  category: string;
  type: 'preset' | 'custom';
  description?: string;
  sampleUrl?: string;
  tags?: string[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'document' | 'qa';
  documentCount: number;
  status: 'ready' | 'training' | 'error';
  createdAt: string;
}

export interface IdolRole {
  id: string;
  name: string;
  version: number;
  personality: string;
  promptTemplate: string;
  language: string;
  status: 'active' | 'draft';
  createdAt: string;
}

export interface IdolFigure {
  id: string;
  name: string;
  videoUrl: string;
  states: {
    enter: string;
    listen: string;
    speak: string;
    interact: string;
    idle: string;
    exit: string;
  };
  emotionZones?: {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// ========== 应援子系统 ==========

export interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface LotteryActivity {
  id: string;
  name: string;
  type: 'wheel' | 'scratch' | 'box';
  startTime: string;
  endTime: string;
  status: 'active' | 'inactive' | 'ended';
  participantCount: number;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  devices: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FlashMessage {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'animation';
  duration: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'promotion' | 'notification' | 'interaction';
  target: 'all' | 'device' | 'user';
  targetId?: string;
  targetName?: string;
  targetType?: 'all' | 'device' | 'member';
  status: 'sent' | 'scheduled' | 'draft';
  isRead?: boolean;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  url: string;
  bucket: string;
  uploader?: string;
  bindType?: 'product' | 'idol' | 'device' | 'none';
  bindTarget?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ========== 仪表盘 ==========

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalMembers: number;
  newMembersToday: number;
  activeIdols: number;
  pendingFeedback: number;
}

export interface ChartData {
  label: string;
  value: number;
}

// ========== 语音/音色 ==========

export interface VoiceItem {
  id: string;
  speakerId: string;
  name: string;
  category: string;
  type: 'preset' | 'custom';
  description?: string;
  tags?: string[];
  sampleUrl?: string;
  createdAt?: string;
}

export const PRESET_VOICES: VoiceItem[] = [
  { id: 'v1', speakerId: 'zh_female_xiaohe_uranus_bigtts', name: '小荷', category: '通用', type: 'preset' },
  { id: 'v2', speakerId: 'zh_female_vv_uranus_bigtts', name: '薇薇', category: '通用', type: 'preset', description: '中英双语' },
  { id: 'v3', speakerId: 'zh_male_m191_uranus_bigtts', name: '云舟', category: '通用', type: 'preset' },
  { id: 'v4', speakerId: 'zh_male_taocheng_uranus_bigtts', name: '晓天', category: '通用', type: 'preset' },
  { id: 'v5', speakerId: 'zh_female_xueayi_saturn_bigtts', name: '儿童有声', category: '有声书', type: 'preset' },
  { id: 'v6', speakerId: 'zh_male_dayi_saturn_bigtts', name: '大毅', category: '视频配音', type: 'preset' },
  { id: 'v7', speakerId: 'zh_female_mizai_saturn_bigtts', name: '米仔', category: '视频配音', type: 'preset' },
  { id: 'v8', speakerId: 'zh_female_jitangnv_saturn_bigtts', name: '激励女', category: '视频配音', type: 'preset' },
  { id: 'v9', speakerId: 'zh_female_meilinvyou_saturn_bigtts', name: '魅力女友', category: '视频配音', type: 'preset' },
  { id: 'v10', speakerId: 'zh_female_shuanglinv_saturn_bigtts', name: '爽利女', category: '视频配音', type: 'preset' },
  { id: 'v11', speakerId: 'zh_male_ruyinan_saturn_bigtts', name: '儒雅男', category: '视频配音', type: 'preset' },
  { id: 'v12', speakerId: 'zh_female_keainvsheng_mars_bigtts', name: '可爱女生', category: '角色扮演', type: 'preset' },
  { id: 'v13', speakerId: 'zh_female_tiaopigongzhu_mars_bigtts', name: '调皮公主', category: '角色扮演', type: 'preset' },
  { id: 'v14', speakerId: 'zh_male_shuanglangshaonian_mars_bigtts', name: '爽朗少年', category: '角色扮演', type: 'preset' },
  { id: 'v15', speakerId: 'zh_male_tiancaitongzhuo_mars_bigtts', name: '天才同桌', category: '角色扮演', type: 'preset' },
  { id: 'v16', speakerId: 'zh_female_cancan_mars_bigtts', name: '灿灿', category: '角色扮演', type: 'preset' },
];

// ========== 设置 ==========

export interface AppSettings {
  llm: { provider?: string; model?: string; baseUrl?: string; apiKey?: string };
  voice: { speaker: string; speechRate: number; loudnessRate: number; audioFormat: string; sampleRate: number };
  backend: { baseUrl?: string; token?: string };
  storage: { autoSave: boolean };
}

export const DEFAULT_SETTINGS: AppSettings = {
  llm: { provider: 'builtin', model: 'doubao-seed-2-0-pro-260215' },
  voice: { speaker: 'zh_female_xiaohe_uranus_bigtts', speechRate: 0, loudnessRate: 0, audioFormat: 'mp3', sampleRate: 24000 },
  backend: { baseUrl: 'https://lyaidol.leyard.com', token: '' },
  storage: { autoSave: true },
};

// ========== 通用 ==========

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
