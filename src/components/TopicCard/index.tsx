import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Topic } from '@/types';
import HeatBadge from '@/components/HeatBadge';
import StatusTag from '@/components/StatusTag';
import { getRelativeTime, getTrendText, getSpreadScopeText } from '@/utils';

interface TopicCardProps {
  topic: Topic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const handleClick = () => {
    console.log('[TopicCard] 点击话题:', topic.id);
    Taro.navigateTo({
      url: `/pages/topic-detail/index?id=${topic.id}`
    });
  };

  const getTrendIcon = () => {
    switch (topic.trend) {
      case 'rising':
        return '↑';
      case 'falling':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={classnames(styles.heatIndicator, styles[topic.heatLevel])} />

      {topic.hasCampusAppeal && (
        <View className={styles.appealFlag}>牵涉校内诉求</View>
      )}

      <View className={styles.header}>
        <Text className={styles.title}>{topic.name}</Text>
        <View className={styles.countBadge}>
          <Text className={styles.number}>{topic.clueCount}</Text>
          <Text className={styles.label}>条线索</Text>
        </View>
      </View>

      <View className={styles.indicators}>
        <HeatBadge level={topic.heatLevel} />
        <StatusTag type={topic.trend} text={`${getTrendIcon()} ${getTrendText(topic.trend)}`} />
        <StatusTag type={topic.heatLevel} text={getSpreadScopeText(topic.spreadScope)} />
      </View>

      <View className={styles.colleges}>
        <Text className={styles.label}>涉及学院：</Text>
        <View className={styles.list}>
          {topic.colleges.map((college, idx) => (
            <View key={idx} className={styles.item}>{college}</View>
          ))}
        </View>
      </View>

      <View className={styles.keywords}>
        {topic.keywords.map((kw, idx) => (
          <View key={idx} className={styles.keyword}>#{kw}</View>
        ))}
      </View>

      <View className={styles.footer}>
        <View className={classnames(styles.trend, styles[topic.trend])}>
          <Text className={styles.icon}>{getTrendIcon()}</Text>
          <Text>{getTrendText(topic.trend)}</Text>
        </View>
        <Text className={styles.time}>最新 {getRelativeTime(topic.latestAt)}</Text>
      </View>
    </View>
  );
};

export default TopicCard;
