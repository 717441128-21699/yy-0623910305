import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Clue } from '@/types';
import HeatBadge from '@/components/HeatBadge';
import StatusTag from '@/components/StatusTag';
import { getRelativeTime } from '@/utils';

interface ClueCardProps {
  clue: Clue;
  showHeatBar?: boolean;
}

const ClueCard: React.FC<ClueCardProps> = ({ clue, showHeatBar = true }) => {
  const handleClick = () => {
    console.log('[ClueCard] 点击线索:', clue.id);
    Taro.navigateTo({
      url: `/pages/clue-detail/index?id=${clue.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      {showHeatBar && (
        <View className={classnames(styles.heatBar, styles[clue.heatLevel])} />
      )}
      <View className={styles.header}>
        <View className={styles.left}>
          <HeatBadge level={clue.heatLevel} />
          <StatusTag type={clue.sourceType} />
          {clue.hasCampusAppeal && (
            <View className={styles.appealBadge}>牵涉校内诉求</View>
          )}
        </View>
        <Text className={styles.college}>{clue.collegeName}</Text>
      </View>

      <View className={styles.content}>
        <Text className={styles.judgment}>{clue.initialJudgment}</Text>
        <Text className={styles.url}>{clue.url}</Text>
      </View>

      <View className={styles.keywords}>
        {clue.keywords.map((kw, idx) => (
          <View key={idx} className={styles.keyword}>#{kw}</View>
        ))}
      </View>

      <View className={styles.tags}>
        <StatusTag type={clue.status} />
        {clue.topicName && (
          <View className={styles.keyword} style={{ background: 'rgba(15, 198, 194, 0.1)', color: '#0fc6c2' }}>
            话题: {clue.topicName}
          </View>
        )}
        {clue.feedbackResult && (
          <StatusTag type={clue.feedbackResult} />
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.reporter}>
          <Text className={styles.name}>{clue.reporterName}</Text>
          <View className={styles.role}>
            {clue.reporterRole === 'teacher' ? '老师' : '学生'}
          </View>
        </View>
        <Text className={styles.time}>{getRelativeTime(clue.createdAt)}</Text>
      </View>
    </View>
  );
};

export default ClueCard;
