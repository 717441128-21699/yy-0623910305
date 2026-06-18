import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Image, ScrollView, Picker } from '@tarojs/components';
import Taro, { useDidShow, getCurrentInstance } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import HeatBadge from '@/components/HeatBadge';
import TimeLine from '@/components/TimeLine';
import { useAppContext } from '@/store/AppContext';
import { colleges, formatTime, getSourceTypeText, getSpreadScopeText } from '@/utils';
import dayjs from 'dayjs';

const counselors = [
  { id: 'user008', name: '李辅导员', collegeId: '12' },
  { id: 'user009', name: '张辅导员', collegeId: '6' },
  { id: 'user010', name: '刘辅导员', collegeId: '8' },
  { id: 'user012', name: '王辅导员', collegeId: '7' },
  { id: 'user013', name: '陈辅导员', collegeId: '10' }
];

const deadlineOptions = [
  { key: '4h', label: '4小时内', hours: 4 },
  { key: '12h', label: '12小时内', hours: 12 },
  { key: '24h', label: '24小时内', hours: 24 },
  { key: '48h', label: '48小时内', hours: 48 }
];

const ClueDetailPage: React.FC = () => {
  const { getClueById, getOperationLogs, assignTask, currentUser } = useAppContext();
  const [clueId, setClueId] = useState<string>('');
  const [selectedCounselorIndex, setSelectedCounselorIndex] = useState<number>(0);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('24h');
  const [showAssign, setShowAssign] = useState(false);

  useDidShow(() => {
    console.log('[ClueDetailPage] 页面显示');
    const instance = getCurrentInstance();
    const params = instance?.router?.params;
    if (params?.id) {
      setClueId(params.id);
    }
  });

  const clue = useMemo(() => {
    return clueId ? getClueById(clueId) : undefined;
  }, [clueId, getClueById]);

  const operationLogs = useMemo(() => {
    return clueId ? getOperationLogs(clueId) : [];
  }, [clueId, getOperationLogs]);

  const collegeCounselors = useMemo(() => {
    if (!clue) return counselors;
    return counselors.filter(c => c.collegeId === clue.collegeId);
  }, [clue]);

  const handleCopyUrl = useCallback(() => {
    if (!clue) return;
    console.log('[ClueDetailPage] 复制链接:', clue.url);
    Taro.setClipboardData({
      data: clue.url,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  }, [clue]);

  const handlePreviewImage = useCallback((url: string) => {
    console.log('[ClueDetailPage] 预览图片:', url);
    Taro.previewImage({
      urls: clue?.screenshots || [],
      current: url
    });
  }, [clue]);

  const handleAssign = useCallback(() => {
    if (!clue || collegeCounselors.length === 0) {
      Taro.showToast({ title: '暂无可用辅导员', icon: 'none' });
      return;
    }

    const counselor = collegeCounselors[selectedCounselorIndex];
    const deadlineOption = deadlineOptions.find(d => d.key === selectedDeadline);
    if (!deadlineOption) return;

    const deadline = dayjs().add(deadlineOption.hours, 'hour').format('YYYY-MM-DD HH:mm:ss');

    console.log('[ClueDetailPage] 派单:', {
      clueId: clue.id,
      counselorId: counselor.id,
      counselorName: counselor.name,
      deadline
    });

    assignTask(clue.id, counselor.id, counselor.name, deadline);
    Taro.showToast({ title: '派单成功', icon: 'success' });
    setShowAssign(false);
  }, [clue, collegeCounselors, selectedCounselorIndex, selectedDeadline, assignTask]);

  const handleCloseClue = useCallback(() => {
    if (!clue) return;
    console.log('[ClueDetailPage] 关闭线索:', clue.id);
    Taro.showModal({
      title: '确认关闭',
      content: '关闭后该线索将标记为已处理，确定要关闭吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已关闭', icon: 'success' });
        }
      }
    });
  }, [clue]);

  const handleGoTopic = useCallback(() => {
    if (!clue?.topicId) return;
    console.log('[ClueDetailPage] 查看话题:', clue.topicId);
    Taro.navigateTo({
      url: `/pages/topic-detail/index?id=${clue.topicId}`
    });
  }, [clue]);

  if (!clue) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.section}>
          <Text style={{ textAlign: 'center', width: '100%', color: '#86909c', padding: '48rpx 0' }}>
            线索不存在
          </Text>
        </View>
      </ScrollView>
    );
  }

  const roleText = {
    student: '学生干部',
    teacher: '辅导员',
    counselor: '辅导员',
    admin: '管理员'
  }[currentUser.role];

  const canAssign = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const canClose = clue.status !== 'closed' && clue.status !== 'done';

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.heatIndicator}>
          <View className={classnames(styles.heatBar, styles[clue.heatLevel])} />
          <HeatBadge level={clue.heatLevel} />
        </View>

        <Text className={styles.title}>{clue.initialJudgment}</Text>

        <View className={styles.tags}>
          <StatusTag type={clue.status} />
          <StatusTag type={clue.sourceType} text={getSourceTypeText(clue.sourceType)} />
          <StatusTag type={clue.heatLevel} text={getSpreadScopeText(clue.spreadScope)} />
          {clue.hasCampusAppeal && (
            <View style={{ padding: '4rpx 12rpx', background: 'rgba(114, 46, 209, 0.1)', color: '#722ed1', fontSize: '22rpx', borderRadius: '8rpx', fontWeight: '500' }}>
              牵涉校内诉求
            </View>
          )}
          {clue.topicName && (
            <View style={{ padding: '4rpx 12rpx', background: 'rgba(15, 198, 194, 0.1)', color: '#0fc6c2', fontSize: '22rpx', borderRadius: '8rpx', fontWeight: '500' }} onClick={handleGoTopic}>
              话题: {clue.topicName} →
            </View>
          )}
        </View>

        <View className={styles.meta}>
          <View className={styles.reporter}>
            <View className={styles.avatar}>
              <Text>{clue.reporterName.charAt(0)}</Text>
            </View>
            <View className={styles.info}>
              <Text className={styles.name}>{clue.reporterName}</Text>
              <Text className={styles.role}>
                {clue.reporterRole === 'teacher' ? '辅导员' : '学生干部'}
              </Text>
            </View>
          </View>
          <Text className={styles.time}>{formatTime(clue.createdAt)}</Text>
        </View>

        <View className={styles.clueIdRow}>
          <Text className={styles.clueIdLabel}>线索编号</Text>
          <Text className={styles.clueIdValue} selectable>{clue.id}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>链接地址</Text>
        </View>
        <View className={styles.urlRow}>
          <Text className={styles.icon}>🔗</Text>
          <Text className={styles.url}>{clue.url}</Text>
          <View className={styles.copyBtn} onClick={handleCopyUrl}>复制</View>
        </View>
      </View>

      {clue.screenshots.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <View className={styles.badge} />
            <Text>截图证据</Text>
          </View>
          <View className={styles.screenshots}>
            {clue.screenshots.map((src, index) => (
              <View key={index} className={styles.screenshotItem} onClick={() => handlePreviewImage(src)}>
                <Image className={styles.image} src={src} mode="aspectFill" />
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>关键词标签</Text>
        </View>
        <View className={styles.keywords}>
          {clue.keywords.map((kw, index) => (
            <View key={index} className={styles.keyword}>#{kw}</View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>基本信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>涉及学院</Text>
          <Text className={styles.value}>{clue.collegeName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>信息来源</Text>
          <Text className={styles.value}>{getSourceTypeText(clue.sourceType)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>扩散范围</Text>
          <Text className={styles.value}>{getSpreadScopeText(clue.spreadScope)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>是否牵涉校内诉求</Text>
          <Text className={styles.value}>{clue.hasCampusAppeal ? '是' : '否'}</Text>
        </View>
        {clue.assignedToName && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>指派处理人</Text>
            <Text className={styles.value}>{clue.assignedToName}</Text>
          </View>
        )}
        {clue.deadline && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>处理截止时间</Text>
            <Text className={styles.value}>{formatTime(clue.deadline)}</Text>
          </View>
        )}
      </View>

      {clue.feedbackResult && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <View className={styles.badge} />
            <Text>反馈结果</Text>
          </View>
          <View className={styles.feedbackResult}>
            <View className={styles.resultHeader}>
              <StatusTag type={clue.feedbackResult} />
            </View>
            <Text className={styles.note}>{clue.feedbackNote}</Text>
            {clue.feedbackAt && (
              <Text className={styles.feedbackMeta}>
                由 {clue.assignedToName} 于 {formatTime(clue.feedbackAt)} 反馈
              </Text>
            )}
          </View>
        </View>
      )}

      {showAssign && canAssign && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <View className={styles.badge} />
            <Text>指派核实</Text>
          </View>
          <View className={styles.assignSection}>
            <View className={styles.pickerRow}>
              <Text className={styles.label}>选择辅导员</Text>
              <Picker
                mode="selector"
                range={collegeCounselors.map(c => c.name)}
                value={selectedCounselorIndex}
                onChange={(e) => setSelectedCounselorIndex(Number(e.detail.value))}
              >
                <View className={styles.picker}>
                  <Text className={classnames(
                    styles.value,
                    collegeCounselors.length === 0 && styles.placeholder
                  )}>
                    {collegeCounselors.length > 0 ? collegeCounselors[selectedCounselorIndex].name : '暂无辅导员'}
                  </Text>
                  <Text className={styles.arrow}>▼</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.deadlineRow}>
              <Text className={styles.label}>处理时限</Text>
              <View className={styles.deadlineBtns}>
                {deadlineOptions.map((option) => (
                  <View
                    key={option.key}
                    className={classnames(
                      styles.deadlineBtn,
                      selectedDeadline === option.key && styles.selected
                    )}
                    onClick={() => setSelectedDeadline(option.key)}
                  >
                    {option.label}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.timelineSection}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>操作记录</Text>
        </View>
        <TimeLine logs={operationLogs} />
      </View>

      <View className={styles.bottomBar}>
        {canAssign && !clue.assignedTo && (
          <View
            className={classnames(styles.btn, showAssign ? styles.secondary : styles.primary)}
            onClick={() => setShowAssign(!showAssign)}
          >
            <Text>{showAssign ? '取消' : '指派核实'}</Text>
          </View>
        )}
        {showAssign && (
          <View className={classnames(styles.btn, styles.primary)} onClick={handleAssign}>
            <Text>确认派单</Text>
          </View>
        )}
        {canClose && (
          <View className={classnames(styles.btn, styles.danger)} onClick={handleCloseClue}>
            <Text>关闭线索</Text>
          </View>
        )}
        {!canAssign && !canClose && (
          <View className={classnames(styles.btn, styles.secondary)} style={{ flex: 1 }} onClick={() => Taro.navigateBack()}>
            <Text>返回</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ClueDetailPage;
