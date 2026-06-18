import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TopicCard from '@/components/TopicCard';
import { useAppContext } from '@/store/AppContext';
import dayjs from 'dayjs';

type FilterType = 'all' | 'high' | 'appeal' | 'today' | 'week';

const ObservePage: React.FC = () => {
  const { topics, clues, refreshData } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部话题' },
    { key: 'high', label: '高热度' },
    { key: 'appeal', label: '牵涉校内诉求' },
    { key: 'today', label: '今日新增' },
    { key: 'week', label: '本周热门' }
  ];

  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayNew = topics.filter(t => dayjs(t.createdAt).format('YYYY-MM-DD') === today);
    const pending = clues.filter(c => c.status === 'pending' || c.status === 'processing');
    const highRisk = topics.filter(t => t.heatLevel === 'high');
    const done = clues.filter(c => c.status === 'done' || c.status === 'closed');

    return {
      todayNew: todayNew.length,
      pending: pending.length,
      highRisk: highRisk.length,
      done: done.length
    };
  }, [topics, clues]);

  const filteredTopics = useMemo(() => {
    const today = dayjs();
    let result = [...topics];

    switch (activeFilter) {
      case 'high':
        result = result.filter(t => t.heatLevel === 'high');
        break;
      case 'appeal':
        result = result.filter(t => t.hasCampusAppeal);
        break;
      case 'today':
        result = result.filter(t => dayjs(t.createdAt).format('YYYY-MM-DD') === today.format('YYYY-MM-DD'));
        break;
      case 'week':
        result = result.filter(t => today.diff(dayjs(t.createdAt), 'day') <= 7);
        break;
    }

    return result.sort((a, b) => {
      const heatOrder = { high: 0, medium: 1, low: 2, normal: 3 };
      if (heatOrder[a.heatLevel] !== heatOrder[b.heatLevel]) {
        return heatOrder[a.heatLevel] - heatOrder[b.heatLevel];
      }
      return dayjs(b.latestAt).valueOf() - dayjs(a.latestAt).valueOf();
    });
  }, [topics, activeFilter]);

  useDidShow(() => {
    console.log('[ObservePage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[ObservePage] 下拉刷新');
    refreshData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handleFilterChange = useCallback((key: FilterType) => {
    console.log('[ObservePage] 切换筛选:', key);
    setActiveFilter(key);
  }, []);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>舆情概览</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={classnames(styles.number, styles.blue)}>{stats.todayNew}</Text>
            <Text className={styles.label}>今日新增</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.number, styles.orange)}>{stats.pending}</Text>
            <Text className={styles.label}>待处理</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.number, styles.red)}>{stats.highRisk}</Text>
            <Text className={styles.label}>高风险</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.number, styles.green)}>{stats.done}</Text>
            <Text className={styles.label}>已处理</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <ScrollView scrollX className={styles.scrollContainer}>
          <View className={styles.filterTags}>
            {filters.map((filter) => (
              <View
                key={filter.key}
                className={classnames(styles.tag, activeFilter === filter.key && styles.active)}
                onClick={() => handleFilterChange(filter.key)}
              >
                {filter.label}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.topicList}>
        <View className={styles.listHeader}>
          <Text className={styles.title}>话题列表</Text>
          <Text className={styles.count}>共 {filteredTopics.length} 个</Text>
        </View>

        <View className={styles.colorLegend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.high)} />
            <Text>高热度</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.medium)} />
            <Text>中热度</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.low)} />
            <Text>低热度</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.normal)} />
            <Text>正常</Text>
          </View>
        </View>

        {filteredTopics.length === 0 ? (
          <View className={styles.empty}>暂无相关话题</View>
        ) : (
          filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ObservePage;
