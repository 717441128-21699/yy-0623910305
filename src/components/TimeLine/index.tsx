import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { OperationLog } from '@/types';
import { formatTime } from '@/utils';

interface TimeLineProps {
  logs: OperationLog[];
}

const TimeLine: React.FC<TimeLineProps> = ({ logs }) => {
  return (
    <View className={styles.timeline}>
      {logs.map((log) => (
        <View key={log.id} className={styles.item}>
          <View className={classnames(styles.dot, styles[log.type])} />
          <View className={styles.content}>
            <View className={styles.header}>
              <View className={styles.operator}>
                <Text className={styles.name}>{log.operatorName}</Text>
                <View className={styles.role}>{log.operatorRole}</View>
              </View>
              <Text className={styles.time}>{formatTime(log.createdAt)}</Text>
            </View>
            <Text className={styles.text}>{log.content}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default TimeLine;
