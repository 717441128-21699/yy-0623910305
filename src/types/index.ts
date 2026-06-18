export type HeatLevel = 'high' | 'medium' | 'low' | 'normal';

export type SourceType = 'campus' | 'external';

export type SpreadScope = 'wide' | 'medium' | 'small';

export type ClueStatus = 'pending' | 'processing' | 'done' | 'closed';

export type FeedbackResult = 'truth' | 'misinformation' | 'communicated' | 'needs_response' | 'pending';

export interface College {
  id: string;
  name: string;
}

export interface Clue {
  id: string;
  url: string;
  screenshots: string[];
  collegeId: string;
  collegeName: string;
  keywords: string[];
  initialJudgment: string;
  reporterId: string;
  reporterName: string;
  reporterRole: 'student' | 'teacher';
  createdAt: string;
  status: ClueStatus;
  heatLevel: HeatLevel;
  sourceType: SourceType;
  spreadScope: SpreadScope;
  hasCampusAppeal: boolean;
  topicId?: string;
  topicName?: string;
  feedbackResult?: FeedbackResult;
  feedbackNote?: string;
  feedbackAt?: string;
  feedbackBy?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  deadline?: string;
}

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  clueCount: number;
  heatLevel: HeatLevel;
  spreadScope: SpreadScope;
  hasCampusAppeal: boolean;
  colleges: string[];
  createdAt: string;
  latestAt: string;
  trend: 'rising' | 'stable' | 'falling';
}

export interface FeedbackTask {
  id: string;
  clueId: string;
  clueSummary: string;
  clueUrl: string;
  collegeId: string;
  collegeName: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  deadline: string;
  status: 'pending' | 'completed';
  result?: FeedbackResult;
  note?: string;
  completedAt?: string;
}

export interface OperationLog {
  id: string;
  type: 'create' | 'assign' | 'feedback' | 'close' | 'update';
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  content: string;
  createdAt: string;
}
