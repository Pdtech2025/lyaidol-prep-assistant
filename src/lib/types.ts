export interface DocumentData {
  id: string;
  title: string;
  content: string;
  stats: {
    totalLines: number;
    totalChars: number;
    modules: number;
    apis: number;
  };
  createdAt: string;
}

export interface VoiceItem {
  id: string;
  speakerId: string;
  name: string;
  category: string;
  type: "preset" | "custom";
  tags?: string[];
  description?: string;
  sampleUrl?: string;
}

export interface SettingsData {
  llm: {
    provider: "builtin" | "custom";
    baseUrl?: string;
    apiKey?: string;
    model: string;
  };
  voice: {
    speaker: string;
    speechRate: number;
    loudnessRate: number;
    audioFormat: "mp3" | "pcm" | "ogg_opus";
    sampleRate: number;
  };
  backend: {
    baseUrl: string;
    token: string;
  };
  storage: {
    autoSave: boolean;
  };
}

export const DEFAULT_SETTINGS: SettingsData = {
  llm: {
    provider: "builtin",
    model: "doubao-seed-2-0-pro-260215",
  },
  voice: {
    speaker: "zh_female_xiaohe_uranus_bigtts",
    speechRate: 0,
    loudnessRate: 0,
    audioFormat: "mp3",
    sampleRate: 24000,
  },
  backend: {
    baseUrl: "https://lyaidol.leyard.com",
    token: "",
  },
  storage: {
    autoSave: true,
  },
};

export const PRESET_VOICES: VoiceItem[] = [
  { id: "v1", speakerId: "zh_female_xiaohe_uranus_bigtts", name: "小荷", category: "通用", type: "preset" },
  { id: "v2", speakerId: "zh_female_vv_uranus_bigtts", name: "薇薇", category: "通用", type: "preset", description: "中英双语" },
  { id: "v3", speakerId: "zh_male_m191_uranus_bigtts", name: "云舟", category: "通用", type: "preset" },
  { id: "v4", speakerId: "zh_male_taocheng_uranus_bigtts", name: "晓天", category: "通用", type: "preset" },
  { id: "v5", speakerId: "zh_female_xueayi_saturn_bigtts", name: "儿童有声", category: "有声书", type: "preset" },
  { id: "v6", speakerId: "zh_male_dayi_saturn_bigtts", name: "大毅", category: "视频配音", type: "preset" },
  { id: "v7", speakerId: "zh_female_mizai_saturn_bigtts", name: "米仔", category: "视频配音", type: "preset" },
  { id: "v8", speakerId: "zh_female_jitangnv_saturn_bigtts", name: "激励女", category: "视频配音", type: "preset" },
  { id: "v9", speakerId: "zh_female_meilinvyou_saturn_bigtts", name: "魅力女友", category: "视频配音", type: "preset" },
  { id: "v10", speakerId: "zh_female_santongyongns_saturn_bigtts", name: "爽利女", category: "视频配音", type: "preset" },
  { id: "v11", speakerId: "zh_male_ruyayichen_saturn_bigtts", name: "儒雅男", category: "视频配音", type: "preset" },
  { id: "v12", speakerId: "saturn_zh_female_keainvsheng_tob", name: "可爱女生", category: "角色扮演", type: "preset" },
  { id: "v13", speakerId: "saturn_zh_female_tiaopigongzhu_tob", name: "调皮公主", category: "角色扮演", type: "preset" },
  { id: "v14", speakerId: "saturn_zh_male_shuanglangshaonian_tob", name: "爽朗少年", category: "角色扮演", type: "preset" },
  { id: "v15", speakerId: "saturn_zh_male_tiancaitongzhuo_tob", name: "天才同桌", category: "角色扮演", type: "preset" },
  { id: "v16", speakerId: "saturn_zh_female_cancan_tob", name: "灿灿", category: "角色扮演", type: "preset" },
];

export interface ChecklistGroup {
  title: string;
  tasks: ChecklistTask[];
}

export interface ChecklistTask {
  id: string;
  content: string;
  priority: "high" | "medium" | "low";
  checked: boolean;
}
