import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { FeedbackTask } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatTime, getRelativeTime, getFeedbackResultText } from '@/utils';
import dayjs from 'dayjs';

interface TaskCardProps {
  task: FeedbackTask;
  onFeedback?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onFeedback }) => {
  const handleClick = () => {
    console.log('[TaskCard] 点击任务:', task.id);
    Taro.navigateTo({
      url: `/pages/clue-detail/index?id=${task.clueId}`
    });
  };

  const handleFeedback = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[TaskCard] 点击反馈:', task.id);
    if (onFeedback) {
      onFeedback(task.id);
    } else {
      Taro.navigateTo({
        url: `/pages/clue-detail/index?id=${task.clueId}&action=feedback`
      });
    }
  };

  const isUrgent = dayjs(task.deadline).diff(dayjs(), 'hour') < 24;

  return (
    <View className={classnames(styles.card, styles[task.status])} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.college}>
          <Text>{task.collegeName}</Text>
        </View>
        <View className={classnames(styles.deadline, isUrgent && task.status === 'pending' && styles.urgent)}>
          {task.status === 'pending' ? `截止: ${formatTime(task.deadline, 'MM-DD HH:mm')}` : `完成: ${formatTime(task.completedAt!, 'MM-DD HH:mm')}`}
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.summary}>{task.clueSummary}</Text>
      </View>

      {task.result && (
        <View className={styles.resultSection}>
          <View className={styles.resultHeader}>
            <StatusTag type={task.result} text={`核实结果：${getFeedbackResultText(task.result)}`} />
          </View>
          <Text className={styles.note}>{task.note}</Text>
          <Text className={styles.completedAt}>
            由 {task.assignedToName} 于 {getRelativeTime(task.completedAt!)} 反馈
          </Text>
        </View>
      )}

      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.label}>派单人:</Text>
          <Text>{task.assignedByName}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.label}>派单时间:</Text>
          <Text>{getRelativeTime(task.assignedAt)}</Text>
        </View>
      </View>

      <View className={styles.assignInfo}>
        <View className={styles.info}>
          <Text>指派给: </Text>
          <Text className={styles.name}>{task.assignedToName}</Text>
        </View>
        {task.status === 'pending' && (
          <View className={styles.action} onClick={handleFeedback}>
            <Text>去反馈</Text>
            <Text>→</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TaskCard;
