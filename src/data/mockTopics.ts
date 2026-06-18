import { Topic } from '@/types';

export const mockTopics: Topic[] = [
  {
    id: 'topic001',
    name: '军训管理问题',
    keywords: ['军训', '体罚', '投诉', '学生'],
    clueCount: 8,
    heatLevel: 'high',
    spreadScope: 'wide',
    hasCampusAppeal: true,
    colleges: ['计算机学院', '电子信息学院', '管理学院'],
    createdAt: '2026-06-18 09:00:00',
    latestAt: '2026-06-19 15:30:00',
    trend: 'rising'
  },
  {
    id: 'topic002',
    name: '食堂价格问题',
    keywords: ['食堂', '涨价', '饭菜', '后勤'],
    clueCount: 5,
    heatLevel: 'medium',
    spreadScope: 'medium',
    hasCampusAppeal: true,
    colleges: ['经济学院', '文学院', '法学院'],
    createdAt: '2026-06-17 14:00:00',
    latestAt: '2026-06-19 11:20:00',
    trend: 'stable'
  },
  {
    id: 'topic003',
    name: '实习待遇问题',
    keywords: ['实习', '待遇', '补贴', '医院'],
    clueCount: 6,
    heatLevel: 'high',
    spreadScope: 'wide',
    hasCampusAppeal: true,
    colleges: ['医学院', '护理学院'],
    createdAt: '2026-06-16 20:00:00',
    latestAt: '2026-06-19 08:45:00',
    trend: 'rising'
  },
  {
    id: 'topic004',
    name: '选课系统问题',
    keywords: ['选课', '系统', '崩溃', '教务处'],
    clueCount: 12,
    heatLevel: 'medium',
    spreadScope: 'wide',
    hasCampusAppeal: true,
    colleges: ['计算机学院', '数学学院', '物理学院', '化学学院'],
    createdAt: '2026-06-15 08:00:00',
    latestAt: '2026-06-16 12:00:00',
    trend: 'falling'
  },
  {
    id: 'topic005',
    name: '毕业就业问题',
    keywords: ['就业', 'offer', '校招', '求职'],
    clueCount: 4,
    heatLevel: 'low',
    spreadScope: 'small',
    hasCampusAppeal: false,
    colleges: ['管理学院', '电子信息学院'],
    createdAt: '2026-06-10 15:00:00',
    latestAt: '2026-06-14 16:30:00',
    trend: 'stable'
  },
  {
    id: 'topic006',
    name: '宿舍管理问题',
    keywords: ['宿舍', '空调', '维修', '物业'],
    clueCount: 3,
    heatLevel: 'low',
    spreadScope: 'small',
    hasCampusAppeal: false,
    colleges: ['土木建筑学院', '艺术学院'],
    createdAt: '2026-06-12 10:00:00',
    latestAt: '2026-06-15 09:20:00',
    trend: 'falling'
  }
];
