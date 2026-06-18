import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh, getCurrentInstance } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import { useAppContext } from '@/store/AppContext';
import { FeedbackResult } from '@/types';

type TabType = 'pending' | 'completed';

const resultOptions: { key: FeedbackResult; label: string; icon: string }[] = [
  { key: 'truth', label: '属实', icon: '⚠️' },
  { key: 'misinformation', label: '误传', icon: '✖️' },
  { key: 'communicated', label: '已沟通', icon: '💬' },
  { key: 'needs_response', label: '需学校回应', icon: '📢' }
];

const FeedbackPage: React.FC = () => {
  const { tasks, currentUser, submitFeedback, refreshData } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<FeedbackResult | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const pendingTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'pending' && t.assignedTo === currentUser.id)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, currentUser.id]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'completed' && t.assignedTo === currentUser.id)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [tasks, currentUser.id]);

  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId);
  }, [tasks, selectedTaskId]);

  useDidShow(() => {
    console.log('[FeedbackPage] 页面显示');
    const instance = getCurrentInstance();
    const params = instance?.router?.params;
    if (params?.action === 'feedback' && params?.id) {
      const task = tasks.find(t => t.clueId === params.id && t.status === 'pending');
      if (task) {
        handleFeedback(task.id);
      }
    }
  });

  usePullDownRefresh(() => {
    console.log('[FeedbackPage] 下拉刷新');
    refreshData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handleTabChange = useCallback((tab: TabType) => {
    console.log('[FeedbackPage] 切换Tab:', tab);
    setActiveTab(tab);
  }, []);

  const handleFeedback = useCallback((taskId: string) => {
    console.log('[FeedbackPage] 打开反馈弹窗:', taskId);
    setSelectedTaskId(taskId);
    setSelectedResult(null);
    setFeedbackNote('');
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedTaskId(null);
    setSelectedResult(null);
    setFeedbackNote('');
  }, []);

  const handleSelectResult = useCallback((result: FeedbackResult) => {
    console.log('[FeedbackPage] 选择结果:', result);
    setSelectedResult(result);
  }, []);

  const handleSubmitFeedback = useCallback(() => {
    if (!selectedTaskId || !selectedResult) {
      Taro.showToast({ title: '请选择核实结果', icon: 'none' });
      return;
    }

    if (!feedbackNote.trim()) {
      Taro.showToast({ title: '请填写情况说明', icon: 'none' });
      return;
    }

    console.log('[FeedbackPage] 提交反馈:', { selectedTaskId, selectedResult, feedbackNote });
    submitFeedback(selectedTaskId, selectedResult, feedbackNote.trim());

    Taro.showToast({ title: '反馈成功', icon: 'success' });
    handleCloseModal();
    setActiveTab('completed');
  }, [selectedTaskId, selectedResult, feedbackNote, submitFeedback, handleCloseModal]);

  const canSubmit = selectedResult && feedbackNote.trim();

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.tabBar}>
        <View className={styles.tabItem} onClick={() => handleTabChange('pending')}>
          <Text className={classnames(styles.text, activeTab === 'pending' && styles.active)}>
            待处理
          </Text>
          {pendingTasks.length > 0 && (
            <View className={styles.countBadge}>{pendingTasks.length}</View>
          )}
          <View className={classnames(styles.indicator, activeTab === 'pending' && styles.active)} />
        </View>
        <View className={styles.tabItem} onClick={() => handleTabChange('completed')}>
          <Text className={classnames(styles.text, activeTab === 'completed' && styles.active)}>
            已完成
          </Text>
          <View className={classnames(styles.indicator, activeTab === 'completed' && styles.active)} />
        </View>
      </View>

      <View className={styles.taskList}>
        {activeTab === 'pending' && pendingTasks.length > 0 && (
          <View className={styles.statsTip}>
            <Text className={styles.icon}>⏰</Text>
            <Text className={styles.text}>
              您有 <Text className={styles.highlight}>{pendingTasks.length}</Text> 个待处理任务，请及时反馈
            </Text>
          </View>
        )}

        {displayTasks.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.icon}>📋</Text>
            <Text>{activeTab === 'pending' ? '暂无待处理任务' : '暂无已完成任务'}</Text>
          </View>
        ) : (
          displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} onFeedback={handleFeedback} />
          ))
        )}
      </View>

      {showModal && selectedTask && (
        <View className={styles.feedbackModal} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.title}>核实反馈</Text>
              <View className={styles.closeBtn} onClick={handleCloseModal}>×</View>
            </View>

            <View className={styles.taskSummary}>
              <Text className={styles.label}>任务内容</Text>
              <Text className={styles.text}>{selectedTask.clueSummary}</Text>
            </View>

            <View className={styles.sectionTitle}>
              <Text className={styles.required}>*</Text>
              <Text>核实结果</Text>
            </View>
            <View className={styles.resultOptions}>
              {resultOptions.map((option) => (
                <View
                  key={option.key}
                  className={classnames(
                    styles.option,
                    styles[option.key],
                    selectedResult === option.key && styles.selected
                  )}
                  onClick={() => handleSelectResult(option.key)}
                >
                  <Text className={styles.icon}>{option.icon}</Text>
                  <Text className={classnames(styles.label, selectedResult === option.key && styles.selected)}>
                    {option.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className={styles.sectionTitle}>
              <Text className={styles.required}>*</Text>
              <Text>情况说明</Text>
            </View>
            <View className={styles.textareaWrapper}>
              <Textarea
                className={classnames(styles.textarea, isFocused && styles.focused)}
                placeholder="请详细描述核实情况、处理过程和结果..."
                value={feedbackNote}
                onInput={(e) => setFeedbackNote(e.detail.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxlength={500}
              />
              <View className={styles.counter}>{feedbackNote.length}/500</View>
            </View>

            <View className={styles.modalActions}>
              <View className={classnames(styles.btn, styles.secondary)} onClick={handleCloseModal}>
                取消
              </View>
              <View
                className={classnames(styles.btn, styles.primary, !canSubmit && styles.disabled)}
                onClick={handleSubmitFeedback}
              >
                提交反馈
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default FeedbackPage;
