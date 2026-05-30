import type {
  User, Device, Product, Order, Member, IdolConfig, VoicePreset,
  KnowledgeBase, IdolRole, IdolFigure, CarouselItem, LotteryActivity,
  Venue, FlashMessage, FeedbackItem, DashboardStats, Department, ChartData,
  Message, MediaFile,
} from './types';

// ========== 仪表盘 ==========
export const mockDashboardStats: DashboardStats = {
  totalDevices: 128,
  onlineDevices: 96,
  totalOrders: 15832,
  todayOrders: 142,
  totalRevenue: 892650,
  todayRevenue: 8960,
  totalMembers: 4523,
  newMembersToday: 38,
  activeIdols: 42,
  pendingFeedback: 7,
};

export const mockRevenueChart: ChartData[] = [
  { label: '周一', value: 7600 },
  { label: '周二', value: 8200 },
  { label: '周三', value: 9100 },
  { label: '周四', value: 8800 },
  { label: '周五', value: 10500 },
  { label: '周六', value: 12300 },
  { label: '周日', value: 8960 },
];

export const mockOrderChart: ChartData[] = [
  { label: '周一', value: 120 },
  { label: '周二', value: 135 },
  { label: '周三', value: 148 },
  { label: '周四', value: 139 },
  { label: '周五', value: 165 },
  { label: '周六', value: 192 },
  { label: '周日', value: 142 },
];

export const mockDeviceStatusChart: ChartData[] = [
  { label: '在线', value: 96 },
  { label: '离线', value: 24 },
  { label: '维护', value: 5 },
  { label: '禁用', value: 3 },
];

// ========== 用户 ==========
export const mockUsers: User[] = [
  { id: 'u1', username: 'zhangsan', realName: '张三', phone: '13800001001', email: 'zhangsan@lyaidol.com', role: 'super_admin', status: 'active', tenantId: 't1', departmentId: 'd1', createdAt: '2025-01-10T08:00:00Z', lastLoginAt: '2026-05-29T14:30:00Z' },
  { id: 'u2', username: 'lisi', realName: '李四', phone: '13800001002', email: 'lisi@lyaidol.com', role: 'tenant_admin', status: 'active', tenantId: 't1', departmentId: 'd1', createdAt: '2025-02-15T10:00:00Z', lastLoginAt: '2026-05-28T09:15:00Z' },
  { id: 'u3', username: 'wangwu', realName: '王五', phone: '13800001003', email: 'wangwu@lyaidol.com', role: 'admin', status: 'active', tenantId: 't1', departmentId: 'd2', createdAt: '2025-03-01T12:00:00Z', lastLoginAt: '2026-05-27T16:45:00Z' },
  { id: 'u4', username: 'zhaoliu', realName: '赵六', phone: '13800001004', email: 'zhaoliu@lyaidol.com', role: 'operator', status: 'active', tenantId: 't1', departmentId: 'd2', createdAt: '2025-04-10T08:00:00Z', lastLoginAt: '2026-05-26T11:00:00Z' },
  { id: 'u5', username: 'sunqi', realName: '孙七', phone: '13800001005', email: 'sunqi@lyaidol.com', role: 'operator', status: 'inactive', tenantId: 't1', departmentId: 'd3', createdAt: '2025-05-20T08:00:00Z' },
];

export const mockDepartments: Department[] = [
  { id: 'd1', name: '运营部', tenantId: 't1', memberCount: 4, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'd2', name: '技术部', tenantId: 't1', memberCount: 8, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'd3', name: '市场部', tenantId: 't1', memberCount: 3, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'd4', name: '客服部', tenantId: 't1', memberCount: 5, createdAt: '2025-01-01T00:00:00Z' },
];

// ========== 设备 ==========
export const mockDevices: Device[] = [
  { id: 'dev1', sn: 'LYD-2025-0001', name: '1号机', model: 'LYD-X1', status: 'online', merchantId: 'm1', merchantName: '乐元互动旗舰店', location: '朝阳大悦城3F', lastOnlineAt: '2026-05-30T10:00:00Z', firmwareVersion: 'v2.2.0', otaVersion: 'v2.3.0', bindingCount: 156, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'dev2', sn: 'LYD-2025-0002', name: '2号机', model: 'LYD-X1', status: 'online', merchantId: 'm1', merchantName: '乐元互动旗舰店', location: '朝阳大悦城3F', lastOnlineAt: '2026-05-30T09:30:00Z', firmwareVersion: 'v2.2.0', otaVersion: 'v2.3.0', bindingCount: 203, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'dev3', sn: 'LYD-2025-0003', name: '3号机', model: 'LYD-X2', status: 'offline', merchantId: 'm2', merchantName: '蓝色港湾店', location: '蓝色港湾B1', lastOnlineAt: '2026-05-28T18:00:00Z', firmwareVersion: 'v2.2.0', otaVersion: 'v2.3.0', bindingCount: 89, createdAt: '2025-04-15T00:00:00Z' },
  { id: 'dev4', sn: 'LYD-2025-0004', name: '4号机', model: 'LYD-X2', status: 'maintenance', merchantId: 'm2', merchantName: '蓝色港湾店', location: '蓝色港湾B1', firmwareVersion: 'v2.1.0', otaVersion: 'v2.3.0', bindingCount: 67, createdAt: '2025-05-01T00:00:00Z' },
  { id: 'dev5', sn: 'LYD-2025-0005', name: '5号机', model: 'LYD-X1', status: 'online', merchantId: 'm3', merchantName: '三里屯店', location: '三里屯太古里2F', lastOnlineAt: '2026-05-30T10:15:00Z', firmwareVersion: 'v2.3.0', otaVersion: 'v2.3.0', bindingCount: 312, createdAt: '2025-06-01T00:00:00Z' },
  { id: 'dev6', sn: 'LYD-2025-0006', name: '6号机', model: 'LYD-X1', status: 'disabled', merchantId: 'm4', merchantName: '合生汇店', location: '合生汇4F', firmwareVersion: 'v2.0.0', otaVersion: 'v2.3.0', bindingCount: 0, createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 商品 ==========
export const mockProducts: Product[] = [
  { id: 'p1', name: '投喂-零食礼包', category: '投喂', price: 29.9, status: 'active', salesCount: 3420, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'p2', name: '投喂-豪华套餐', category: '投喂', price: 99.9, status: 'active', salesCount: 1856, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'p3', name: '互动-深情告白', category: '互动', price: 19.9, status: 'active', salesCount: 5230, createdAt: '2025-04-01T00:00:00Z' },
  { id: 'p4', name: '互动-生日祝福', category: '互动', price: 49.9, status: 'active', salesCount: 2110, createdAt: '2025-04-01T00:00:00Z' },
  { id: 'p5', name: '应援-应援棒', category: '应援', price: 59.9, status: 'draft', salesCount: 0, createdAt: '2025-05-01T00:00:00Z' },
];

// ========== 订单 ==========
export const mockOrders: Order[] = [
  { id: 'o1', orderNo: 'ORD20260530001', userId: 'u10', userName: '小明', deviceId: 'dev1', deviceName: '1号机', totalAmount: 29.9, status: 'paid', items: [{ productId: 'p1', productName: '投喂-零食礼包', quantity: 1, price: 29.9 }], createdAt: '2026-05-30T09:00:00Z', paidAt: '2026-05-30T09:01:00Z' },
  { id: 'o2', orderNo: 'ORD20260530002', userId: 'u11', userName: '小红', deviceId: 'dev2', deviceName: '2号机', totalAmount: 99.9, status: 'completed', items: [{ productId: 'p2', productName: '投喂-豪华套餐', quantity: 1, price: 99.9 }], createdAt: '2026-05-30T09:15:00Z', paidAt: '2026-05-30T09:16:00Z' },
  { id: 'o3', orderNo: 'ORD20260530003', userId: 'u12', userName: '小刚', deviceId: 'dev5', deviceName: '5号机', totalAmount: 19.9, status: 'pending', items: [{ productId: 'p3', productName: '互动-深情告白', quantity: 1, price: 19.9 }], createdAt: '2026-05-30T09:30:00Z' },
  { id: 'o4', orderNo: 'ORD20260530004', userId: 'u13', userName: '小丽', deviceId: 'dev1', deviceName: '1号机', totalAmount: 49.9, status: 'refunded', items: [{ productId: 'p4', productName: '互动-生日祝福', quantity: 1, price: 49.9 }], createdAt: '2026-05-30T08:00:00Z', paidAt: '2026-05-30T08:01:00Z' },
];

// ========== 会员 ==========
export const mockMembers: Member[] = [
  { id: 'm1', nickname: '元气少女', phone: '138****1001', level: 5, points: 2340, totalSpent: 1280, visitCount: 45, lastVisitAt: '2026-05-30T09:00:00Z', createdAt: '2025-03-01T00:00:00Z' },
  { id: 'm2', nickname: '追星少年', phone: '138****1002', level: 3, points: 890, totalSpent: 560, visitCount: 23, lastVisitAt: '2026-05-29T18:00:00Z', createdAt: '2025-05-15T00:00:00Z' },
  { id: 'm3', nickname: '乐元粉丝', phone: '138****1003', level: 4, points: 1560, totalSpent: 920, visitCount: 38, lastVisitAt: '2026-05-28T20:00:00Z', createdAt: '2025-04-01T00:00:00Z' },
];

// ========== 反馈 ==========
export const mockFeedbacks: FeedbackItem[] = [
  { id: 'fb1', userId: 'm1', userName: '元气少女', content: '投喂后idol没有反应，等待时间太长', contactInfo: '138****1001', status: 'pending', createdAt: '2026-05-30T08:00:00Z' },
  { id: 'fb2', userId: 'm2', userName: '追星少年', content: '互动功能很好玩，希望能增加更多互动方式', status: 'resolved', reply: '感谢反馈，我们正在开发更多互动模式', createdAt: '2026-05-29T14:00:00Z' },
  { id: 'fb3', userId: 'm3', userName: '乐元粉丝', content: '会员积分兑换功能什么时候上线？', status: 'processing', createdAt: '2026-05-28T16:00:00Z' },
  { id: 'fb4', userId: 'm1', userName: '元气少女', content: '音色切换后声音延迟较大', status: 'pending', createdAt: '2026-05-30T09:30:00Z' },
];

// ========== Idol配置 ==========
export const mockIdolConfigs: IdolConfig[] = [
  { id: 'idol1', name: '元气少女-朝阳店', speakerId: 'zh_female_xiaohe_uranus_bigtts', speakerName: '小荷', roleId: 'role1', roleName: '元气少女', figureId: 'fig1', figureName: '元气少女-日系风', knowledgeBaseId: 'kb1', knowledgeBaseName: '品牌知识库', promptStyle: '活泼可爱', language: 'zh-CN', emotionEnabled: true, status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'idol2', name: '知性御姐-三里屯店', speakerId: 'zh_female_cancan_uranus_bigtts', speakerName: '灿灿', roleId: 'role2', roleName: '知性御姐', figureId: 'fig2', figureName: '御姐-都市风', knowledgeBaseId: 'kb2', knowledgeBaseName: '产品知识库', promptStyle: '温柔知性', language: 'zh-CN', emotionEnabled: true, status: 'active', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'idol3', name: '酷帅少年-蓝色港湾', speakerId: 'zh_male_taocheng_uranus_bigtts', speakerName: '晓天', roleId: 'role3', roleName: '爽朗少年', figureId: 'fig3', figureName: '少年-运动风', knowledgeBaseId: 'kb1', knowledgeBaseName: '品牌知识库', promptStyle: '爽朗幽默', language: 'zh-CN', emotionEnabled: false, status: 'inactive', createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 音色 ==========
export const mockVoicePresets: VoicePreset[] = [
  { id: 'v1', speakerId: 'zh_female_xiaohe_uranus_bigtts', name: '小荷', category: '通用', type: 'preset' },
  { id: 'v2', speakerId: 'zh_female_vv_uranus_bigtts', name: '薇薇', category: '通用', type: 'preset', description: '中英双语' },
  { id: 'v3', speakerId: 'zh_male_m191_uranus_bigtts', name: '云舟', category: '通用', type: 'preset' },
  { id: 'v4', speakerId: 'zh_male_taocheng_uranus_bigtts', name: '晓天', category: '通用', type: 'preset' },
  { id: 'v5', speakerId: 'zh_female_xueayi_saturn_bigtts', name: '儿童有声', category: '有声书', type: 'preset' },
  { id: 'v6', speakerId: 'zh_male_dayi_saturn_bigtts', name: '大毅', category: '视频配音', type: 'preset' },
  { id: 'v7', speakerId: 'zh_female_mizai_saturn_bigtts', name: '米仔', category: '视频配音', type: 'preset' },
  { id: 'v8', speakerId: 'zh_female_jitangnv_saturn_bigtts', name: '激励女', category: '视频配音', type: 'preset' },
  { id: 'v9', speakerId: 'zh_female_meilinvyou_saturn_bigtts', name: '魅力女友', category: '角色扮演', type: 'preset' },
  { id: 'v10', speakerId: 'zh_female_keainvsheng_saturn_bigtts', name: '可爱女生', category: '角色扮演', type: 'preset' },
  { id: 'v11', speakerId: 'zh_female_cancan_uranus_bigtts', name: '灿灿', category: '角色扮演', type: 'preset' },
  { id: 'v12', speakerId: 'zh_male_shuanglangshaonian_saturn_bigtts', name: '爽朗少年', category: '角色扮演', type: 'preset' },
  { id: 'v13', speakerId: 'zh_male_tiancaitongzhuo_saturn_bigtts', name: '天才同桌', category: '角色扮演', type: 'preset' },
  { id: 'v14', speakerId: 'custom_001', name: '品牌定制音', category: '自定义', type: 'custom', description: '品牌专属音色', tags: ['品牌'] },
];

// ========== 知识库 ==========
export const mockKnowledgeBases: KnowledgeBase[] = [
  { id: 'kb1', name: '品牌知识库', type: 'document', documentCount: 23, status: 'ready', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'kb2', name: '产品知识库', type: 'document', documentCount: 15, status: 'ready', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'kb3', name: 'FAQ问答库', type: 'qa', documentCount: 156, status: 'ready', createdAt: '2025-07-01T00:00:00Z' },
  { id: 'kb4', name: '新品介绍库', type: 'document', documentCount: 8, status: 'training', createdAt: '2025-08-01T00:00:00Z' },
];

// ========== 角色人设 ==========
export const mockIdolRoles: IdolRole[] = [
  { id: 'role1', name: '元气少女', version: 3, personality: '活泼可爱、充满活力、喜欢和粉丝互动', promptTemplate: '你是元气少女，总是充满活力地回应粉丝...', language: 'zh-CN', status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'role2', name: '知性御姐', version: 2, personality: '温柔知性、善解人意、偶尔撒娇', promptTemplate: '你是知性御姐，温柔地回应...', language: 'zh-CN', status: 'active', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'role3', name: '爽朗少年', version: 1, personality: '阳光帅气、幽默风趣、酷爱运动', promptTemplate: '你是爽朗少年...', language: 'zh-CN', status: 'draft', createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 形象 ==========
export const mockIdolFigures: IdolFigure[] = [
  { id: 'fig1', name: '元气少女-日系风', videoUrl: '', states: { enter: '进场', listen: '聆听', speak: '说话', interact: '互动', idle: '待机', exit: '离场' }, emotionZones: [{ name: '头部', x: 0.3, y: 0.1, width: 0.4, height: 0.3 }, { name: '手部', x: 0.1, y: 0.5, width: 0.25, height: 0.3 }, { name: '全身', x: 0.2, y: 0.2, width: 0.6, height: 0.7 }], status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'fig2', name: '御姐-都市风', videoUrl: '', states: { enter: '进场', listen: '聆听', speak: '说话', interact: '互动', idle: '待机', exit: '离场' }, emotionZones: [{ name: '头部', x: 0.35, y: 0.05, width: 0.3, height: 0.25 }], status: 'active', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'fig3', name: '少年-运动风', videoUrl: '', states: { enter: '进场', listen: '聆听', speak: '说话', interact: '互动', idle: '待机', exit: '离场' }, status: 'inactive', createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 轮播图 ==========
export const mockCarousels: CarouselItem[] = [
  { id: 'c1', title: '新品首发', imageUrl: '', linkUrl: '/products/new', sort: 1, status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'c2', title: '限时活动', imageUrl: '', linkUrl: '/activities/summer', sort: 2, status: 'active', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'c3', title: '会员特权', imageUrl: '', linkUrl: '/membership', sort: 3, status: 'active', createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 抽奖 ==========
export const mockLotteries: LotteryActivity[] = [
  { id: 'l1', name: '夏季大转盘', type: 'wheel', startTime: '2026-06-01T00:00:00Z', endTime: '2026-06-30T23:59:59Z', status: 'active', participantCount: 892, createdAt: '2026-05-20T00:00:00Z' },
  { id: 'l2', name: '刮刮乐-品牌日', type: 'scratch', startTime: '2026-05-01T00:00:00Z', endTime: '2026-05-31T23:59:59Z', status: 'active', participantCount: 1230, createdAt: '2026-04-20T00:00:00Z' },
  { id: 'l3', name: '盲盒惊喜', type: 'box', startTime: '2026-04-01T00:00:00Z', endTime: '2026-04-30T23:59:59Z', status: 'ended', participantCount: 567, createdAt: '2026-03-20T00:00:00Z' },
];

// ========== 场馆 ==========
export const mockVenues: Venue[] = [
  { id: 'v1', name: '朝阳大悦城体验店', address: '北京市朝阳区朝阳大悦城3F', capacity: 50, devices: 2, status: 'active', createdAt: '2025-03-01T00:00:00Z' },
  { id: 'v2', name: '蓝色港湾旗舰店', address: '北京市朝阳区蓝色港湾B1', capacity: 80, devices: 2, status: 'active', createdAt: '2025-04-01T00:00:00Z' },
  { id: 'v3', name: '三里屯体验中心', address: '北京市朝阳区三里屯太古里2F', capacity: 60, devices: 1, status: 'active', createdAt: '2025-05-01T00:00:00Z' },
];

// ========== 爆闪消息 ==========
export const mockFlashMessages: FlashMessage[] = [
  { id: 'f1', title: '欢迎光临', content: '欢迎来到Lyaidol互动体验！', type: 'text', duration: 5, status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'f2', title: '生日快乐', content: '今天是你的生日，idol为你送上祝福！', type: 'animation', duration: 10, status: 'active', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'f3', title: '新品上线', content: '全新互动模式上线啦！', type: 'image', duration: 8, status: 'inactive', createdAt: '2025-07-01T00:00:00Z' },
];

// ========== 消息推送 ==========
export const mockMessages: Message[] = [
  { id: 'm1', title: '系统维护通知', content: '平台将于本周六凌晨2:00-4:00进行系统维护，届时设备将暂停服务', type: 'system', target: 'all', targetType: 'all', status: 'sent', isRead: false, sentAt: '2025-06-20T10:00:00Z', createdAt: '2025-06-19T15:00:00Z' },
  { id: 'm2', title: '618特别活动', content: '618期间投喂享双倍积分！活动时间6月16日-6月20日', type: 'promotion', target: 'all', targetType: 'all', status: 'sent', isRead: true, sentAt: '2025-06-16T00:00:00Z', createdAt: '2025-06-15T10:00:00Z' },
  { id: 'm3', title: '设备离线提醒', content: '设备"蓝色港湾1号机"已离线超过2小时，请检查网络连接', type: 'notification', target: 'device', targetId: 'd1', targetName: '蓝色港湾1号机', targetType: 'device', status: 'sent', isRead: false, sentAt: '2025-06-22T08:30:00Z', createdAt: '2025-06-22T08:30:00Z' },
  { id: 'm4', title: '会员互动消息', content: '会员张三对idol发送了互动消息', type: 'interaction', target: 'user', targetId: 'u3', targetName: '张三', targetType: 'member', status: 'sent', isRead: false, sentAt: '2025-06-22T12:00:00Z', createdAt: '2025-06-22T12:00:00Z' },
  { id: 'm5', title: '暑期促销预告', content: '暑期即将到来，准备推出系列促销活动方案', type: 'promotion', target: 'all', targetType: 'all', status: 'scheduled', isRead: true, scheduledAt: '2025-07-01T00:00:00Z', createdAt: '2025-06-25T10:00:00Z' },
  { id: 'm6', title: '新功能上线通知', content: '知识库管理功能已上线，支持QA问答型知识库配置', type: 'system', target: 'all', targetType: 'all', status: 'draft', isRead: true, createdAt: '2025-06-28T14:00:00Z' },
  { id: 'm7', title: '设备异常告警', content: '设备"朝阳大悦城3号机"CPU温度过高，建议检查散热', type: 'notification', target: 'device', targetId: 'd3', targetName: '朝阳大悦城3号机', targetType: 'device', status: 'sent', isRead: false, sentAt: '2025-06-23T09:15:00Z', createdAt: '2025-06-23T09:15:00Z' },
];

export const mockMediaFiles: MediaFile[] = [
  { id: 'f1', name: 'idol_avatar_001.png', type: 'image', size: 256000, url: '/placeholder.png', bucket: 'idol-avatars', uploader: 'admin', bindType: 'idol', bindTarget: 'r1', uploadedAt: '2025-06-15T10:30:00Z', uploadedBy: 'admin' },
  { id: 'f2', name: 'boot_animation.mp4', type: 'video', size: 15360000, url: '/placeholder.mp4', bucket: 'boot-animations', uploader: 'admin', bindType: 'device', bindTarget: 'd1', uploadedAt: '2025-06-14T08:20:00Z', uploadedBy: 'admin' },
  { id: 'f3', name: 'product_banner.jpg', type: 'image', size: 512000, url: '/placeholder.jpg', bucket: 'product-images', uploader: 'operator1', bindType: 'product', bindTarget: 'p1', uploadedAt: '2025-06-13T16:45:00Z', uploadedBy: 'operator1' },
  { id: 'f4', name: 'idol_voice_sample.wav', type: 'audio', size: 1024000, url: '/placeholder.wav', bucket: 'voice-samples', uploader: 'admin', bindType: 'idol', bindTarget: 'v1', uploadedAt: '2025-06-12T09:15:00Z', uploadedBy: 'admin' },
  { id: 'f5', name: 'venue_map.png', type: 'image', size: 380000, url: '/placeholder.png', bucket: 'venue-images', uploader: 'operator1', bindType: 'none', uploadedAt: '2025-06-11T14:00:00Z', uploadedBy: 'operator1' },
  { id: 'f6', name: 'promo_video.mp4', type: 'video', size: 25600000, url: '/placeholder.mp4', bucket: 'product-images', uploader: 'admin', bindType: 'product', bindTarget: 'p2', uploadedAt: '2025-06-10T11:30:00Z', uploadedBy: 'admin' },
  { id: 'f7', name: 'lottery_bg.jpg', type: 'image', size: 180000, url: '/placeholder.jpg', bucket: 'lottery-assets', uploader: 'operator1', bindType: 'none', uploadedAt: '2025-06-09T08:45:00Z', uploadedBy: 'operator1' },
  { id: 'f8', name: 'flash_message_bg.png', type: 'image', size: 420000, url: '/placeholder.png', bucket: 'flash-assets', uploader: 'admin', bindType: 'none', uploadedAt: '2025-06-08T13:20:00Z', uploadedBy: 'admin' },
];
