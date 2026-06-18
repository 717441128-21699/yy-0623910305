import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Clue, Topic, FeedbackTask, HeatLevel, SpreadScope, SourceType, OperationLog } from '@/types';
import { mockClues } from '@/data/mockClues';
import { mockTopics } from '@/data/mockTopics';
import { mockFeedbackTasks } from '@/data/mockFeedback';
import { generateId } from '@/utils';
import dayjs from 'dayjs';

interface AppContextType {
  clues: Clue[];
  topics: Topic[];
  tasks: FeedbackTask[];
  currentUser: {
    id: string;
    name: string;
    role: 'student' | 'teacher' | 'counselor' | 'admin';
    collegeId?: string;
  };
  addClue: (clue: Omit<Clue, 'id' | 'createdAt' | 'status' | 'reporterId' | 'reporterName' | 'reporterRole' | 'heatLevel' | 'sourceType' | 'spreadScope' | 'hasCampusAppeal' | 'topicId' | 'topicName'>) => string;
  assignTask: (clueId: string, counselorId: string, counselorName: string, deadline: string) => void;
  submitFeedback: (taskId: string, result: 'truth' | 'misinformation' | 'communicated' | 'needs_response', note: string) => void;
  getClueById: (id: string) => Clue | undefined;
  getTopicById: (id: string) => Topic | undefined;
  getTaskById: (id: string) => FeedbackTask | undefined;
  getOperationLogs: (clueId: string) => OperationLog[];
  getCluesByTopic: (topicId: string) => Clue[];
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const aggregateClueToTopic = (clue: Omit<Clue, 'id' | 'createdAt' | 'status' | 'reporterId' | 'reporterName' | 'reporterRole' | 'heatLevel' | 'sourceType' | 'spreadScope' | 'hasCampusAppeal'> & { id: string; heatLevel: HeatLevel; spreadScope: SpreadScope; hasCampusAppeal: boolean; sourceType: SourceType; createdAt: string }, existingTopics: Topic[]): { topicId: string; topicName: string; updatedTopics: Topic[] } => {
  let matchedTopic: Topic | null = null;
  let maxMatchCount = 0;

  for (const topic of existingTopics) {
    const matchCount = clue.keywords.filter(kw =>
      topic.keywords.some(tkw => tkw.includes(kw) || kw.includes(tkw))
    ).length;
    if (matchCount > maxMatchCount && matchCount >= 1) {
      maxMatchCount = matchCount;
      matchedTopic = topic;
    }
  }

  if (matchedTopic) {
    const allKeywords = Array.from(new Set([...matchedTopic.keywords, ...clue.keywords]));
    const allColleges = Array.from(new Set([...matchedTopic.colleges, clue.collegeName]));
    const clueCount = matchedTopic.clueCount + 1;

    let newHeatLevel: HeatLevel = matchedTopic.heatLevel;
    if (clueCount >= 8) newHeatLevel = 'high';
    else if (clueCount >= 4) newHeatLevel = 'medium';
    else if (clueCount >= 2) newHeatLevel = 'low';
    else newHeatLevel = 'normal';

    let newSpreadScope: SpreadScope = matchedTopic.spreadScope;
    if (allColleges.length >= 4) newSpreadScope = 'wide';
    else if (allColleges.length >= 2) newSpreadScope = 'medium';
    else newSpreadScope = 'small';

    const updatedTopics = existingTopics.map(t =>
      t.id === matchedTopic!.id
        ? {
            ...t,
            keywords: allKeywords,
            colleges: allColleges,
            clueCount,
            heatLevel: newHeatLevel,
            spreadScope: newSpreadScope,
            hasCampusAppeal: t.hasCampusAppeal || clue.hasCampusAppeal,
            latestAt: clue.createdAt,
            trend: 'rising' as const
          }
        : t
    );

    return {
      topicId: matchedTopic.id,
      topicName: matchedTopic.name,
      updatedTopics
    };
  }

  const newTopic: Topic = {
    id: generateId(),
    name: clue.keywords[0] ? `${clue.keywords[0]}相关讨论` : `新话题_${dayjs().format('MMDDHHmm')}`,
    keywords: clue.keywords.length > 0 ? clue.keywords : [clue.initialJudgment.slice(0, 6)],
    clueCount: 1,
    heatLevel: 'normal',
    spreadScope: 'small',
    hasCampusAppeal: clue.hasCampusAppeal,
    colleges: [clue.collegeName],
    createdAt: clue.createdAt,
    latestAt: clue.createdAt,
    trend: 'stable'
  };

  return {
    topicId: newTopic.id,
    topicName: newTopic.name,
    updatedTopics: [newTopic, ...existingTopics]
  };
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [clues, setClues] = useState<Clue[]>(mockClues);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [tasks, setTasks] = useState<FeedbackTask[]>(mockFeedbackTasks);

  const currentUser = {
    id: 'user001',
    name: '张老师',
    role: 'teacher' as const,
    collegeId: '12'
  };

  const addClue = useCallback((clueData) => {
    console.log('[AppContext] 新增线索:', clueData);
    const newId = generateId();
    const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const baseClue = {
      id: newId,
      createdAt,
      status: 'pending' as const,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role === 'student' ? 'student' : 'teacher',
      heatLevel: 'medium' as HeatLevel,
      sourceType: clueData.url.includes('.edu.cn') ? 'campus' : 'external' as SourceType,
      spreadScope: 'small' as SpreadScope,
      hasCampusAppeal: false
    };

    const fullClueForAggregation = {
      ...clueData,
      ...baseClue
    };

    const { topicId, topicName, updatedTopics } = aggregateClueToTopic(
      fullClueForAggregation,
      topics
    );

    const newClue: Clue = {
      ...clueData,
      ...baseClue,
      topicId,
      topicName
    };

    setTopics(updatedTopics);
    setClues(prev => [newClue, ...prev]);
    return newId;
  }, [currentUser, topics]);

  const assignTask = useCallback((clueId: string, counselorId: string, counselorName: string, deadline: string) => {
    console.log('[AppContext] 派单:', { clueId, counselorId, counselorName, deadline });
    const clue = clues.find(c => c.id === clueId);
    if (!clue) return;

    const newTask: FeedbackTask = {
      id: generateId(),
      clueId,
      clueSummary: clue.initialJudgment,
      clueUrl: clue.url,
      collegeId: clue.collegeId,
      collegeName: clue.collegeName,
      assignedTo: counselorId,
      assignedToName: counselorName,
      assignedBy: currentUser.id,
      assignedByName: currentUser.name,
      assignedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      deadline,
      status: 'pending'
    };

    setTasks(prev => [newTask, ...prev]);
    setClues(prev => prev.map(c =>
      c.id === clueId
        ? {
            ...c,
            status: 'processing',
            assignedTo: counselorId,
            assignedToName: counselorName,
            assignedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            deadline
          }
        : c
    ));
  }, [clues, currentUser]);

  const submitFeedback = useCallback((taskId: string, result: 'truth' | 'misinformation' | 'communicated' | 'needs_response', note: string) => {
    console.log('[AppContext] 提交反馈:', { taskId, result, note });
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: 'completed', result, note, completedAt }
        : t
    ));

    setClues(prev => prev.map(c =>
      c.id === task.clueId
        ? {
            ...c,
            status: 'done',
            feedbackResult: result,
            feedbackNote: note,
            feedbackAt: completedAt,
            feedbackBy: currentUser.id
          }
        : c
    ));
  }, [tasks, currentUser]);

  const getClueById = useCallback((id: string) => {
    return clues.find(c => c.id === id);
  }, [clues]);

  const getTopicById = useCallback((id: string) => {
    return topics.find(t => t.id === id);
  }, [topics]);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(t => t.id === id);
  }, [tasks]);

  const getOperationLogs = useCallback((clueId: string): OperationLog[] => {
    const clue = clues.find(c => c.id === clueId);
    if (!clue) return [];

    const logs: OperationLog[] = [
      {
        id: generateId(),
        type: 'create',
        operatorId: clue.reporterId,
        operatorName: clue.reporterName,
        operatorRole: clue.reporterRole === 'student' ? '学生干部' : '辅导员',
        content: `上报线索：${clue.initialJudgment}`,
        createdAt: clue.createdAt
      }
    ];

    if (clue.assignedAt && clue.assignedToName) {
      const deadlineText = clue.deadline ? `，截止时间：${dayjs(clue.deadline).format('MM月DD日 HH:mm')}` : '';
      logs.push({
        id: generateId(),
        type: 'assign',
        operatorId: 'admin',
        operatorName: '宣传部老师',
        operatorRole: '管理员',
        content: `指派给 ${clue.assignedToName} 核实${deadlineText}`,
        createdAt: clue.assignedAt
      });
    }

    if (clue.feedbackAt && clue.feedbackResult && clue.feedbackNote) {
      const resultMap: Record<string, string> = {
        truth: '属实',
        misinformation: '误传',
        communicated: '已沟通',
        needs_response: '需学校回应'
      };
      logs.push({
        id: generateId(),
        type: 'feedback',
        operatorId: clue.feedbackBy || '',
        operatorName: clue.assignedToName || '辅导员',
        operatorRole: '辅导员',
        content: `反馈结果：${resultMap[clue.feedbackResult]}，${clue.feedbackNote}`,
        createdAt: clue.feedbackAt
      });
    }

    return logs.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [clues]);

  const getCluesByTopic = useCallback((topicId: string) => {
    return clues.filter(c => c.topicId === topicId);
  }, [clues]);

  const refreshData = useCallback(() => {
    console.log('[AppContext] 刷新数据 - 保留用户操作数据');
    setClues(prev => [...prev]);
    setTopics(prev => [...prev]);
    setTasks(prev => [...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      clues,
      topics,
      tasks,
      currentUser,
      addClue,
      assignTask,
      submitFeedback,
      getClueById,
      getTopicById,
      getTaskById,
      getOperationLogs,
      getCluesByTopic,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};
