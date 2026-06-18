import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, getCurrentInstance } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import HeatBadge from '@/components/HeatBadge';
import ClueCard from '@/components/ClueCard';
import { useAppContext } from '@/store/AppContext';
import { formatTime, getTrendText, getTrendColor, getSpreadScopeText } from '@/utils';
import dayjs from 'dayjs';

const TopicDetailPage: React.FC = () => {
  const { getTopicById, getCluesByTopic } = useAppContext();
  const [topicId, setTopicId] = useState<string>('');

  useDidShow(() => {
    console.log('[TopicDetailPage] 页面显示');
    const instance = getCurrentInstance();
    const params = instance?.router?.params;
    if (params?.id) {
      setTopicId(params.id);
    }
  });

  const topic = useMemo(() => {
    return topicId ? getTopicById(topicId) : undefined;
  }, [topicId, getTopicById]);

  const relatedClues = useMemo(() => {
    return topicId ? getCluesByTopic(topicId) : [];
  }, [topicId, getCluesByTopic]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('MM-DD'));
    }
    return days;
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return '↑';
      case 'falling':
        return '↓';
      default:
        return '→';
    }
  };

  if (!topic) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.section}>
          <Text style={{ textAlign: 'center', width: '100%', color: '#86909c', padding: '48rpx 0' }}>
            话题不存在
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={classnames(styles.heatIndicator, styles[topic.heatLevel])} />

        <View className={styles.titleRow}>
          <Text className={styles.title}>{topic.name}</Text>
          <View className={styles.countBadge}>
            <Text className={styles.number}>{topic.clueCount}</Text>
            <Text className={styles.label}>条线索</Text>
          </View>
        </View>

        <View className={styles.tags}>
          <HeatBadge level={topic.heatLevel} />
          <StatusTag type={topic.trend} text={`${getTrendIcon(topic.trend)} ${getTrendText(topic.trend)}`} />
          <StatusTag type={topic.heatLevel} text={getSpreadScopeText(topic.spreadScope)} />
          {topic.hasCampusAppeal && (
            <View style={{ padding: '4rpx 12rpx', background: 'rgba(114, 46, 209, 0.1)', color: '#722ed1', fontSize: '22rpx', borderRadius: '8rpx', fontWeight: '500' }}>
              牵涉校内诉求
            </View>
          )}
        </View>

        <View className={styles.meta}>
          <View className={classnames(styles.trend, styles[topic.trend])}>
            <Text className={styles.icon}>{getTrendIcon(topic.trend)}</Text>
            <Text style={{ color: getTrendColor(topic.trend) }}>{getTrendText(topic.trend)}</Text>
          </View>
          <Text className={styles.time}>最新线索: {formatTime(topic.latestAt)}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>热度趋势</Text>
        </View>
        <View className={styles.trendChart}>
          <Text className={styles.chartTitle}>近7天线索数量趋势</Text>
          <View className={styles.chartBars}>
            {trendData.map((_, index) => (
              <View key={index} className={styles.bar}>
                <Text className={styles.value}>{Math.floor(Math.random() * 10) + 1}</Text>
              </View>
            ))}
          </View>
          <View className={styles.chartLabels}>
            {trendData.map((day, index) => (
              <Text key={index} className={styles.label}>{day}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>涉及学院</Text>
        </View>
        <View className={styles.colleges}>
          {topic.colleges.map((college, index) => (
            <View key={index} className={styles.college}>{college}</View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>关键词标签</Text>
        </View>
        <View className={styles.keywords}>
          {topic.keywords.map((kw, index) => (
            <View key={index} className={styles.keyword}>#{kw}</View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>话题信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>创建时间</Text>
          <Text className={styles.value}>{formatTime(topic.createdAt)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>最新更新</Text>
          <Text className={styles.value}>{formatTime(topic.latestAt)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>扩散范围</Text>
          <Text className={styles.value}>{getSpreadScopeText(topic.spreadScope)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>是否牵涉校内诉求</Text>
          <Text className={styles.value}>{topic.hasCampusAppeal ? '是' : '否'}</Text>
        </View>
      </View>

      <View className={styles.clueListSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>相关线索</Text>
          <Text className={styles.count}>共 {relatedClues.length} 条</Text>
        </View>
        {relatedClues.length === 0 ? (
          <View className={styles.empty}>暂无相关线索</View>
        ) : (
          relatedClues.map((clue) => (
            <ClueCard key={clue.id} clue={clue} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default TopicDetailPage;
