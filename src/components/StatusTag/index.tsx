import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import {
  getClueStatusText,
  getFeedbackResultText,
  getSourceTypeText,
  getTrendText
} from '@/utils';
import { ClueStatus, FeedbackResult, SourceType } from '@/types';

type StatusType = ClueStatus | FeedbackResult | SourceType | 'rising' | 'stable' | 'falling';

interface StatusTagProps {
  type: StatusType;
  text?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type, text }) => {
  let displayText = text;
  if (!displayText) {
    if (['pending', 'processing', 'done', 'closed'].includes(type)) {
      displayText = getClueStatusText(type as ClueStatus);
    } else if (['truth', 'misinformation', 'communicated', 'needs_response'].includes(type)) {
      displayText = getFeedbackResultText(type as FeedbackResult);
    } else if (['campus', 'external'].includes(type)) {
      displayText = getSourceTypeText(type as SourceType);
    } else if (['rising', 'stable', 'falling'].includes(type)) {
      displayText = getTrendText(type as 'rising' | 'stable' | 'falling');
    }
  }

  const className = classnames(styles.tag, styles[type]);

  return <View className={className}>{displayText}</View>;
};

export default StatusTag;
