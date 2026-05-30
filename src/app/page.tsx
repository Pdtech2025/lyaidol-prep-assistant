'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  User, Device, Product, Order, Member, IdolConfig, VoicePreset,
  KnowledgeBase, IdolRole, IdolFigure, CarouselItem, LotteryActivity,
  Venue, FlashMessage, FeedbackItem, DashboardStats, Department,
} from '@/lib/types';
import {
  mockUsers, mockDevices, mockProducts, mockOrders, mockMembers,
  mockIdolConfigs, mockVoicePresets, mockKnowledgeBases, mockIdolRoles,
  mockIdolFigures, mockCarousels, mockLotteries, mockVenues,
  mockFlashMessages, mockFeedbacks, mockDashboardStats, mockDepartments,
  mockRevenueChart, mockOrderChart, mockDeviceStatusChart,
} from '@/lib/mock-data';

// ========== 导航配置 ==========
type ViewId = 'dashboard' | 'users' | 'devices' | 'products' | 'orders' | 'members' | 'feedback'
  | 'idol' | 'voice' | 'knowledge' | 'roles' | 'figures' | 'ui-style'
  | 'lottery' | 'flash' | 'messages' | 'venues'
  | 'carousel' | 'miniapp' | 'settings' | 'system';

interface NavGroup {
  label: string;
  items: { id: ViewId; label: string; icon: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: '概览', items: [{ id: 'dashboard', label: '数据看板', icon: '📊' }] },
  { label: '用户与权限', items: [
    { id: 'users', label: '成员管理', icon: '👥' },
  ]},
  { label: '设备管理', items: [
    { id: 'devices', label: '设备列表', icon: '📺' },
  ]},
  { label: '商品内容', items: [
    { id: 'products', label: '商品列表', icon: '🛒' },
    { id: 'carousel', label: '轮播图管理', icon: '🖼' },
  ]},
  { label: '订单管理', items: [
    { id: 'orders', label: '订单列表', icon: '📋' },
  ]},
  { label: '会员管理', items: [
    { id: 'members', label: '会员列表', icon: '⭐' },
    { id: 'feedback', label: '意见反馈', icon: '💬' },
  ]},
  { label: '智能Aidol', items: [
    { id: 'idol', label: 'idol配置', icon: '🤖' },
    { id: 'voice', label: '音色管理', icon: '🎙' },
    { id: 'knowledge', label: '知识库', icon: '📚' },
    { id: 'roles', label: '角色人设', icon: '🎭' },
    { id: 'figures', label: '形象管理', icon: '🖼' },
    { id: 'ui-style', label: 'UI风格', icon: '🎨' },
  ]},
  { label: '应援管理', items: [
    { id: 'lottery', label: '抽奖活动', icon: '🎰' },
    { id: 'flash', label: '爆闪消息', icon: '⚡' },
    { id: 'messages', label: '消息推送', icon: '📨' },
    { id: 'venues', label: '场馆管理', icon: '🏟' },
  ]},
  { label: '系统', items: [
    { id: 'miniapp', label: '小程序管理', icon: '📱' },
    { id: 'settings', label: '系统配置', icon: '⚙' },
    { id: 'system', label: '运维中心', icon: '🔧' },
  ]},
];

// ========== 工具函数 ==========
const statusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400', online: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-emerald-500/20 text-emerald-400', paid: 'bg-emerald-500/20 text-emerald-400',
    ready: 'bg-emerald-500/20 text-emerald-400', resolved: 'bg-emerald-500/20 text-emerald-400',
    inactive: 'bg-zinc-500/20 text-zinc-400', offline: 'bg-zinc-500/20 text-zinc-400',
    draft: 'bg-zinc-500/20 text-zinc-400', ended: 'bg-zinc-500/20 text-zinc-400',
    pending: 'bg-amber-500/20 text-amber-400', maintenance: 'bg-amber-500/20 text-amber-400',
    processing: 'bg-amber-500/20 text-amber-400', training: 'bg-amber-500/20 text-amber-400',
    disabled: 'bg-red-500/20 text-red-400', refunded: 'bg-red-500/20 text-red-400',
    error: 'bg-red-500/20 text-red-400', locked: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return map[status] || 'bg-zinc-500/20 text-zinc-400';
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: '启用', inactive: '停用', online: '在线', offline: '离线',
    maintenance: '维护中', disabled: '已禁用', draft: '草稿',
    pending: '待处理', paid: '已支付', completed: '已完成',
    refunded: '已退款', cancelled: '已取消', processing: '处理中',
    resolved: '已解决', ready: '就绪', training: '训练中',
    error: '异常', ended: '已结束', locked: '已锁定',
  };
  return map[status] || status;
};

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    super_admin: '超级管理员', tenant_admin: '租户管理员', admin: '管理员', operator: '操作员',
  };
  return map[role] || role;
};

function Badge({ status }: { status: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}>{statusLabel(status)}</span>;
}

function StatCard({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function DataTable<T>({ data, columns, keyField }: {
  data: T[];
  columns: { key: string; title: string; render?: (row: T) => React.ReactNode }[];
  keyField: keyof T;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-foreground whitespace-nowrap">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">暂无数据</div>
      )}
    </div>
  );
}

function BarChart({ data, color = '#3b82f6' }: { data: { label: string; value: number }[]; color?: string }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">{d.value}</span>
          <div
            className="w-full rounded-t transition-all duration-300"
            style={{ height: `${(d.value / maxVal) * 100}%`, backgroundColor: color, minHeight: 4 }}
          />
          <span className="text-xs text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ========== 页面视图 ==========

function DashboardView() {
  const stats = mockDashboardStats;
  return (
    <div>
      <PageHeader title="数据看板" desc="Lyaidol B端云平台运营概览" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="设备总数" value={stats.totalDevices} sub={`在线 ${stats.onlineDevices}`} color="text-blue-400" />
        <StatCard title="今日订单" value={stats.todayOrders} sub={`累计 ${stats.totalOrders}`} color="text-emerald-400" />
        <StatCard title="今日营收" value={`¥${stats.todayRevenue.toLocaleString()}`} sub={`累计 ¥${stats.totalRevenue.toLocaleString()}`} color="text-amber-400" />
        <StatCard title="今日新增会员" value={stats.newMembersToday} sub={`累计 ${stats.totalMembers}`} color="text-purple-400" />
        <StatCard title="活跃idol" value={stats.activeIdols} sub={`待处理反馈 ${stats.pendingFeedback}`} color="text-cyan-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-border bg-card p-4 md:col-span-2">
          <h3 className="text-sm font-medium text-foreground mb-4">近7日营收趋势</h3>
          <BarChart data={mockRevenueChart} color="#3b82f6" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">设备状态分布</h3>
          <BarChart data={mockDeviceStatusChart} color="#06b6d4" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">近7日订单趋势</h3>
          <BarChart data={mockOrderChart} color="#22c55e" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">最近反馈</h3>
          <div className="space-y-3">
            {mockFeedbacks.slice(0, 4).map((fb) => (
              <div key={fb.id} className="flex items-start gap-3">
                <Badge status={fb.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{fb.content}</p>
                  <p className="text-xs text-muted-foreground">{fb.userName} · {new Date(fb.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersView() {
  const [tab, setTab] = useState<'members' | 'roles' | 'departments'>('members');
  return (
    <div>
      <PageHeader title="用户与权限管理" desc="成员管理、角色权限、部门管理" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加成员</button>
      } />
      <div className="flex gap-2 mb-4">
        {([['members', '成员管理'], ['roles', '角色权限'], ['departments', '部门管理']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${tab === id ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{label}</button>
        ))}
      </div>
      {tab === 'members' && (
        <DataTable data={mockUsers} keyField="id" columns={[
          { key: 'realName', title: '姓名' },
          { key: 'username', title: '用户名' },
          { key: 'phone', title: '手机号' },
          { key: 'role', title: '角色', render: (r) => roleLabel(r.role) },
          { key: 'departmentId', title: '部门', render: (r) => mockDepartments.find(d => d.id === r.departmentId)?.name || '-' },
          { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
          { key: 'lastLoginAt', title: '最后登录', render: (r) => r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : '-' },
        ]} />
      )}
      {tab === 'roles' && (
        <DataTable data={[{ id: 'r1', name: '超级管理员', desc: '拥有全部权限', memberCount: 1 }, { id: 'r2', name: '租户管理员', desc: '管理租户下所有功能', memberCount: 3 }, { id: 'r3', name: '管理员', desc: '管理指定模块', memberCount: 8 }, { id: 'r4', name: '操作员', desc: '仅查看和基础操作', memberCount: 8 }]} keyField="id" columns={[
          { key: 'name', title: '角色名' },
          { key: 'desc', title: '描述' },
          { key: 'memberCount', title: '成员数' },
        ]} />
      )}
      {tab === 'departments' && (
        <DataTable data={mockDepartments} keyField="id" columns={[
          { key: 'name', title: '部门名称' },
          { key: 'memberCount', title: '成员数' },
          { key: 'createdAt', title: '创建时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]} />
      )}
    </div>
  );
}

function DevicesView() {
  return (
    <div>
      <PageHeader title="设备管理" desc="设备列表、OTA升级、开机动画" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加设备</button>
      } />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="在线" value={mockDevices.filter(d => d.status === 'online').length} color="text-emerald-400" />
        <StatCard title="离线" value={mockDevices.filter(d => d.status === 'offline').length} color="text-zinc-400" />
        <StatCard title="维护中" value={mockDevices.filter(d => d.status === 'maintenance').length} color="text-amber-400" />
        <StatCard title="已禁用" value={mockDevices.filter(d => d.status === 'disabled').length} color="text-red-400" />
      </div>
      <DataTable data={mockDevices} keyField="id" columns={[
        { key: 'sn', title: 'SN号' },
        { key: 'name', title: '设备名称' },
        { key: 'model', title: '型号' },
        { key: 'merchantName', title: '归属商户' },
        { key: 'location', title: '位置' },
        { key: 'firmwareVersion', title: '固件版本' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'lastOnlineAt', title: '最后在线', render: (r) => r.lastOnlineAt ? new Date(r.lastOnlineAt).toLocaleDateString() : '-' },
      ]} />
    </div>
  );
}

function ProductsView() {
  return (
    <div>
      <PageHeader title="商品管理" desc="商品列表、上下架管理" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加商品</button>
      } />
      <DataTable data={mockProducts} keyField="id" columns={[
        { key: 'name', title: '商品名称' },
        { key: 'category', title: '分类' },
        { key: 'price', title: '价格', render: (r) => `¥${r.price}` },
        { key: 'salesCount', title: '销量' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', title: '创建时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ]} />
    </div>
  );
}

function CarouselView() {
  return (
    <div>
      <PageHeader title="轮播图管理" desc="小程序首页轮播图配置" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加轮播图</button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCarousels.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="h-32 bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
              {item.title} 轮播图
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                <Badge status={item.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">排序: {item.sort}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div>
      <PageHeader title="订单管理" desc="投喂订单记录" />
      <DataTable data={mockOrders} keyField="id" columns={[
        { key: 'orderNo', title: '订单号' },
        { key: 'userName', title: '用户' },
        { key: 'deviceName', title: '设备' },
        { key: 'totalAmount', title: '金额', render: (r) => `¥${r.totalAmount}` },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', title: '创建时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        { key: 'paidAt', title: '支付时间', render: (r) => r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '-' },
      ]} />
    </div>
  );
}

function MembersView() {
  return (
    <div>
      <PageHeader title="会员管理" desc="小程序C端用户管理" />
      <DataTable data={mockMembers} keyField="id" columns={[
        { key: 'nickname', title: '昵称' },
        { key: 'phone', title: '手机号' },
        { key: 'level', title: '等级', render: (r) => `Lv.${r.level}` },
        { key: 'points', title: '积分' },
        { key: 'totalSpent', title: '累计消费', render: (r) => `¥${r.totalSpent}` },
        { key: 'visitCount', title: '访问次数' },
        { key: 'lastVisitAt', title: '最近访问', render: (r) => r.lastVisitAt ? new Date(r.lastVisitAt).toLocaleDateString() : '-' },
      ]} />
    </div>
  );
}

function FeedbackView() {
  return (
    <div>
      <PageHeader title="意见反馈" desc="用户反馈处理" />
      <DataTable data={mockFeedbacks} keyField="id" columns={[
        { key: 'userName', title: '用户' },
        { key: 'content', title: '反馈内容' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'reply', title: '回复', render: (r) => r.reply || <span className="text-muted-foreground">未回复</span> },
        { key: 'createdAt', title: '提交时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ]} />
    </div>
  );
}

function IdolConfigView() {
  return (
    <div>
      <PageHeader title="智能Aidol配置" desc="关联音色+角色+形象+知识库，一体化下发设备" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">新增配置</button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockIdolConfigs.map((config) => (
          <div key={config.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{config.name}</h3>
              <Badge status={config.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">音色：</span><span className="text-foreground">{config.speakerName}</span></div>
              <div><span className="text-muted-foreground">角色：</span><span className="text-foreground">{config.roleName}</span></div>
              <div><span className="text-muted-foreground">形象：</span><span className="text-foreground">{config.figureName}</span></div>
              <div><span className="text-muted-foreground">知识库：</span><span className="text-foreground">{config.knowledgeBaseName}</span></div>
              <div><span className="text-muted-foreground">风格：</span><span className="text-foreground">{config.promptStyle}</span></div>
              <div><span className="text-muted-foreground">情绪互动：</span><span className="text-foreground">{config.emotionEnabled ? '开启' : '关闭'}</span></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">编辑</button>
              <button className="px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80">下发设备</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceView() {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? mockVoicePresets : mockVoicePresets.filter(v => v.category === filter);
  const categories = [...new Set(mockVoicePresets.map(v => v.category))];
  return (
    <div>
      <PageHeader title="音色管理" desc="预设音色与自定义音色管理" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加自定义音色</button>
      } />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>全部</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-sm rounded-lg ${filter === c ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-lg border border-border bg-card p-3 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">{v.name}</span>
              <Badge status={v.type === 'preset' ? 'active' : 'inactive'} />
            </div>
            <div className="text-xs text-muted-foreground">{v.category} · {v.speakerId.substring(0, 20)}...</div>
            {v.description && <div className="text-xs text-muted-foreground mt-1">{v.description}</div>}
            <button className="mt-2 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80">试听</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeView() {
  return (
    <div>
      <PageHeader title="知识库管理" desc="文档型与QA问答型知识库" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">创建知识库</button>
      } />
      <DataTable data={mockKnowledgeBases} keyField="id" columns={[
        { key: 'name', title: '名称' },
        { key: 'type', title: '类型', render: (r) => r.type === 'document' ? '文档型' : 'QA问答型' },
        { key: 'documentCount', title: '文档数' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', title: '创建时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ]} />
    </div>
  );
}

function RolesView() {
  return (
    <div>
      <PageHeader title="角色人设管理" desc="idol角色设定、提示词风格、多语言" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">新建角色</button>
      } />
      <DataTable data={mockIdolRoles} keyField="id" columns={[
        { key: 'name', title: '角色名' },
        { key: 'version', title: '版本', render: (r) => `v${r.version}` },
        { key: 'personality', title: '性格' },
        { key: 'language', title: '语言' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', title: '创建时间', render: (r) => new Date(r.createdAt).toLocaleDateString() },
      ]} />
    </div>
  );
}

function FiguresView() {
  return (
    <div>
      <PageHeader title="形象管理" desc="idol视频帧形象、6种状态机、情绪互动热区" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">上传形象</button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockIdolFigures.map((fig) => (
          <div key={fig.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{fig.name}</h3>
              <Badge status={fig.status} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">6种状态：进场/聆听/说话/互动/待机/离场</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(fig.states).map(([state, label]) => (
                <span key={state} className="px-1.5 py-0.5 text-xs bg-muted rounded text-foreground">{label}</span>
              ))}
            </div>
            {fig.emotionZones && (
              <div className="text-xs text-muted-foreground">情绪互动区: {fig.emotionZones.map(z => z.name).join(', ')}</div>
            )}
            <button className="mt-2 px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80">编辑热区</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UIStyleView() {
  return (
    <div>
      <PageHeader title="UI风格设置" desc="C端小程序主题配置下发" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">主题色配置</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">主色调</span>
              <div className="w-8 h-8 rounded bg-blue-500" />
              <span className="text-sm text-foreground">#3b82f6</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">强调色</span>
              <div className="w-8 h-8 rounded bg-cyan-500" />
              <span className="text-sm text-foreground">#06b6d4</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">背景色</span>
              <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700" />
              <span className="text-sm text-foreground">#18181b</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">功能开关</h3>
          <div className="space-y-3">
            {['投喂功能', '互动功能', '抽奖功能', '爆闪消息'].map(name => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{name}</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LotteryView() {
  return (
    <div>
      <PageHeader title="抽奖活动" desc="大转盘/刮刮卡/盲盒" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">创建活动</button>
      } />
      <DataTable data={mockLotteries} keyField="id" columns={[
        { key: 'name', title: '活动名称' },
        { key: 'type', title: '类型', render: (r) => ({ wheel: '大转盘', scratch: '刮刮卡', box: '盲盒' } as Record<string, string>)[r.type] || r.type },
        { key: 'participantCount', title: '参与人数' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
        { key: 'startTime', title: '开始时间', render: (r) => new Date(r.startTime).toLocaleDateString() },
        { key: 'endTime', title: '结束时间', render: (r) => new Date(r.endTime).toLocaleDateString() },
      ]} />
    </div>
  );
}

function FlashView() {
  return (
    <div>
      <PageHeader title="爆闪消息" desc="设备端即时消息推送" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">新建消息</button>
      } />
      <DataTable data={mockFlashMessages} keyField="id" columns={[
        { key: 'title', title: '标题' },
        { key: 'content', title: '内容' },
        { key: 'type', title: '类型', render: (r) => ({ text: '文本', image: '图片', animation: '动画' } as Record<string, string>)[r.type] || r.type },
        { key: 'duration', title: '时长(秒)' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
      ]} />
    </div>
  );
}

function MessagesView() {
  return (
    <div>
      <PageHeader title="消息推送" desc="C端用户消息推送管理" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">发送消息</button>
      } />
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        消息推送功能开发中...
      </div>
    </div>
  );
}

function VenuesView() {
  return (
    <div>
      <PageHeader title="场馆管理" desc="场馆信息与设备关联" action={
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">添加场馆</button>
      } />
      <DataTable data={mockVenues} keyField="id" columns={[
        { key: 'name', title: '场馆名称' },
        { key: 'address', title: '地址' },
        { key: 'capacity', title: '容纳人数' },
        { key: 'devices', title: '关联设备数' },
        { key: 'status', title: '状态', render: (r) => <Badge status={r.status} /> },
      ]} />
    </div>
  );
}

function MiniappView() {
  return (
    <div>
      <PageHeader title="小程序管理" desc="域名绑定、备案号配置" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">域名配置</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">小程序域名</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="https://mini.lyaidol.com" readOnly />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">API域名</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="https://api.lyaidol.com" readOnly />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">备案信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">ICP备案号</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="京ICP备2024XXXXXX号" readOnly />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">小程序AppID</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="wx1234567890abcdef" readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <PageHeader title="系统配置" desc="通用系统参数配置" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">基础配置</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">平台名称</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="Lyaidol B端云平台" readOnly />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">API Base URL</label>
              <input className="w-full mt-1 px-3 py-2 bg-muted/30 border border-border rounded text-sm text-foreground" defaultValue="https://lyaidol.leyard.com" readOnly />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">安全配置</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">密码复杂度要求</span>
              <span className="text-xs text-muted-foreground">8位+数字+特殊字符</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">登录失败锁定</span>
              <span className="text-xs text-muted-foreground">5次后锁定30分钟</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">数据加密</span>
              <span className="text-xs text-muted-foreground">AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemView() {
  return (
    <div>
      <PageHeader title="运维中心" desc="RESTful规范、灰度发包、版本管理" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="API版本" value="v1.2.0" sub="RESTful规范" color="text-blue-400" />
        <StatCard title="固件版本" value="v2.3.0" sub="灰度发布中" color="text-emerald-400" />
        <StatCard title="系统运行" value="99.9%" sub="最近30天可用性" color="text-amber-400" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">灰度发布策略</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">v2.3.0 → 商户1~5号</span>
            <Badge status="active" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">v2.2.0 → 全量设备</span>
            <Badge status="completed" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">v2.1.0 → 已废弃</span>
            <Badge status="inactive" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 视图路由 ==========
const VIEW_MAP: Record<ViewId, () => React.ReactNode> = {
  dashboard: DashboardView,
  users: UsersView,
  devices: DevicesView,
  products: ProductsView,
  carousel: CarouselView,
  orders: OrdersView,
  members: MembersView,
  feedback: FeedbackView,
  idol: IdolConfigView,
  voice: VoiceView,
  knowledge: KnowledgeView,
  roles: RolesView,
  figures: FiguresView,
  'ui-style': UIStyleView,
  lottery: LotteryView,
  flash: FlashView,
  messages: MessagesView,
  venues: VenuesView,
  miniapp: MiniappView,
  settings: SettingsView,
  system: SystemView,
};

// ========== 主应用 ==========
export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ViewComponent = VIEW_MAP[currentView] || DashboardView;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 侧边栏 */}
      <aside className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <div className="flex items-center h-14 px-4 border-b border-border">
          {!sidebarCollapsed && <span className="text-sm font-bold text-foreground tracking-wide">Lyaidol</span>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`ml-auto p-1 rounded hover:bg-muted text-muted-foreground ${sidebarCollapsed ? 'mx-auto ml-0' : ''}`}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {!sidebarCollapsed && (
                <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{group.label}</div>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="text-base">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">管</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">管理员</div>
                <div className="text-xs text-muted-foreground">租户管理员</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl">
          <ViewComponent />
        </div>
      </main>
    </div>
  );
}
