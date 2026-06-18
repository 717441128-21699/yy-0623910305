import dayjs from 'dayjs';
import { HeatLevel, SpreadScope, SourceType, ClueStatus, FeedbackResult } from '@/types';

export const formatTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const getRelativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(date);
};

export const getHeatLevelText = (level: HeatLevel): string => {
  const map = {
    high: '高热度',
    medium: '中热度',
    low: '低热度',
    normal: '正常'
  };
  return map[level];
};

export const getHeatLevelColor = (level: HeatLevel): string => {
  const map = {
    high: '#f53f3f',
    medium: '#ff7d00',
    low: '#ffaa00',
    normal: '#00b42a'
  };
  return map[level];
};

export const getSpreadScopeText = (scope: SpreadScope): string => {
  const map = {
    wide: '大范围扩散',
    medium: '中等范围',
    small: '小范围'
  };
  return map[scope];
};

export const getSpreadScopeColor = (scope: SpreadScope): string => {
  const map = {
    wide: '#f53f3f',
    medium: '#ff7d00',
    small: '#0fc6c2'
  };
  return map[scope];
};

export const getSourceTypeText = (type: SourceType): string => {
  const map = {
    campus: '校内来源',
    external: '校外来源'
  };
  return map[type];
};

export const getSourceTypeColor = (type: SourceType): string => {
  const map = {
    campus: '#722ed1',
    external: '#86909c'
  };
  return map[type];
};

export const getClueStatusText = (status: ClueStatus): string => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    done: '已完成',
    closed: '已关闭'
  };
  return map[status];
};

export const getClueStatusColor = (status: ClueStatus): string => {
  const map = {
    pending: '#ff7d00',
    processing: '#165dff',
    done: '#00b42a',
    closed: '#86909c'
  };
  return map[status];
};

export const getFeedbackResultText = (result: FeedbackResult): string => {
  const map = {
    truth: '属实',
    misinformation: '误传',
    communicated: '已沟通',
    needs_response: '需学校回应',
    pending: '待反馈'
  };
  return map[result];
};

export const getFeedbackResultColor = (result: FeedbackResult): string => {
  const map = {
    truth: '#f53f3f',
    misinformation: '#00b42a',
    communicated: '#165dff',
    needs_response: '#ff7d00',
    pending: '#86909c'
  };
  return map[result];
};

export const getTrendText = (trend: 'rising' | 'stable' | 'falling'): string => {
  const map = {
    rising: '热度上升',
    stable: '热度平稳',
    falling: '热度下降'
  };
  return map[trend];
};

export const getTrendColor = (trend: 'rising' | 'stable' | 'falling'): string => {
  const map = {
    rising: '#f53f3f',
    stable: '#ff7d00',
    falling: '#00b42a'
  };
  return map[trend];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const colleges = [
  { id: '1', name: '马克思主义学院' },
  { id: '2', name: '文学院' },
  { id: '3', name: '历史学院' },
  { id: '4', name: '哲学院' },
  { id: '5', name: '法学院' },
  { id: '6', name: '经济学院' },
  { id: '7', name: '管理学院' },
  { id: '8', name: '外国语学院' },
  { id: '9', name: '数学学院' },
  { id: '10', name: '物理学院' },
  { id: '11', name: '化学学院' },
  { id: '12', name: '计算机学院' },
  { id: '13', name: '电子信息学院' },
  { id: '14', name: '土木建筑学院' },
  { id: '15', name: '医学院' },
  { id: '16', name: '艺术学院' },
  { id: '17', name: '体育学院' },
  { id: '18', name: '教育学院' }
];

export const suggestedKeywords = [
  '军训', '开学', '选课', '考试', '毕业', '就业',
  '宿舍', '食堂', '学费', '奖学金', '助学金',
  '疫情', '防控', '隔离', '网课',
  '学生会', '社团', '活动',
  '辅导员', '书记', '校长',
  '投诉', '维权', '抗议',
  '政策', '规定', '制度'
];
