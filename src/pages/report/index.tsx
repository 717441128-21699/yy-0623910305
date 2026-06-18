import React, { useState, useCallback } from 'react';
import { View, Text, Input, Textarea, Image, Picker, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ClueCard from '@/components/ClueCard';
import { useAppContext } from '@/store/AppContext';
import { colleges, suggestedKeywords } from '@/utils';

const ReportPage: React.FC = () => {
  const { clues, currentUser, addClue, refreshData } = useAppContext();

  const [url, setUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [collegeIndex, setCollegeIndex] = useState<number>(0);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [initialJudgment, setInitialJudgment] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newClueId, setNewClueId] = useState('');

  const myClues = clues.filter(c => c.reporterId === currentUser.id);

  useDidShow(() => {
    console.log('[ReportPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[ReportPage] 下拉刷新');
    refreshData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handlePaste = useCallback(async () => {
    console.log('[ReportPage] 点击粘贴');
    try {
      const res = await Taro.getClipboardData();
      if (res.data) {
        setUrl(res.data);
        Taro.showToast({ title: '已粘贴', icon: 'success' });
      }
    } catch (error) {
      console.error('[ReportPage] 粘贴失败:', error);
      Taro.showToast({ title: '粘贴失败', icon: 'error' });
    }
  }, []);

  const handleUploadImage = useCallback(() => {
    console.log('[ReportPage] 上传图片');
    if (screenshots.length >= 3) {
      Taro.showToast({ title: '最多上传3张', icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: 3 - screenshots.length,
      success: (res) => {
        console.log('[ReportPage] 选择图片成功:', res.tempFilePaths);
        setScreenshots(prev => [...prev, ...res.tempFilePaths]);
      },
      fail: (error) => {
        console.error('[ReportPage] 选择图片失败:', error);
      }
    });
  }, [screenshots.length]);

  const handleRemoveImage = useCallback((index: number) => {
    console.log('[ReportPage] 删除图片:', index);
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleKeyword = useCallback((keyword: string) => {
    console.log('[ReportPage] 切换关键词:', keyword);
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  }, []);

  const handleAddCustomKeyword = useCallback(() => {
    const trimmed = customKeyword.trim();
    if (!trimmed) {
      Taro.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
    if (selectedKeywords.includes(trimmed)) {
      Taro.showToast({ title: '关键词已存在', icon: 'none' });
      return;
    }
    console.log('[ReportPage] 添加自定义关键词:', trimmed);
    setSelectedKeywords(prev => [...prev, trimmed]);
    setCustomKeyword('');
  }, [customKeyword, selectedKeywords]);

  const handleRemoveKeyword = useCallback((keyword: string) => {
    console.log('[ReportPage] 移除关键词:', keyword);
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  }, []);

  const canSubmit = url.trim() && collegeIndex > 0 && selectedKeywords.length > 0 && initialJudgment.trim();

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    console.log('[ReportPage] 提交线索');
    const college = colleges[collegeIndex];

    const returnedClueId = addClue({
      url: url.trim(),
      screenshots: screenshots.length > 0 ? screenshots : ['https://picsum.photos/id/1/400/600'],
      collegeId: college.id,
      collegeName: college.name,
      keywords: selectedKeywords,
      initialJudgment: initialJudgment.trim()
    });

    setNewClueId(returnedClueId);
    setShowSuccess(true);

    setUrl('');
    setScreenshots([]);
    setCollegeIndex(0);
    setSelectedKeywords([]);
    setInitialJudgment('');
  }, [url, collegeIndex, selectedKeywords, initialJudgment, screenshots, canSubmit, addClue]);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const handleViewDetail = useCallback(() => {
    setShowSuccess(false);
    Taro.navigateTo({
      url: `/pages/clue-detail/index?id=${newClueId}`
    });
  }, [newClueId]);

  const roleText = {
    student: '学生干部',
    teacher: '辅导员',
    counselor: '辅导员',
    admin: '管理员'
  }[currentUser.role];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>线索上报</Text>
        <Text className={styles.subtitle}>快速录入舆情线索，及时发现敏感讨论</Text>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>{currentUser.name.charAt(0)}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{currentUser.name}</Text>
            <Text className={styles.role}>{roleText}</Text>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <View className={styles.badge} />
          <Text>线索信息</Text>
          <Text className={styles.required}>*必填</Text>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>链接地址</Text>
          </View>
          <View className={classnames(styles.inputWrapper, focusedField === 'url' && styles.focused)}>
            <Text className={styles.icon}>🔗</Text>
            <Input
              className={styles.input}
              placeholder="请输入或粘贴链接"
              value={url}
              onInput={(e) => setUrl(e.detail.value)}
              onFocus={() => setFocusedField('url')}
              onBlur={() => setFocusedField(null)}
            />
            <View className={styles.pasteBtn} onClick={handlePaste}>粘贴</View>
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text>截图上传（最多3张）</Text>
          </View>
          <View className={styles.uploadArea}>
            {screenshots.map((src, index) => (
              <View key={index} className={styles.uploadItem}>
                <Image className={styles.image} src={src} mode="aspectFill" />
                <View className={styles.deleteBtn} onClick={() => handleRemoveImage(index)}>×</View>
              </View>
            ))}
            {screenshots.length < 3 && (
              <View className={styles.uploadBtn} onClick={handleUploadImage}>
                <Text className={styles.icon}>+</Text>
                <Text className={styles.text}>上传截图</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>涉及学院</Text>
          </View>
          <Picker
            mode="selector"
            range={colleges.map(c => c.name)}
            value={collegeIndex - 1}
            onChange={(e) => setCollegeIndex(Number(e.detail.value) + 1)}
          >
            <View className={styles.pickerWrapper}>
              <Text className={classnames(styles.value, collegeIndex === 0 && styles.placeholder)}>
                {collegeIndex === 0 ? '请选择学院' : colleges[collegeIndex].name}
              </Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>关键词标签</Text>
          </View>
          <View className={styles.keywordsWrapper}>
            <View className={styles.recommended}>
              {suggestedKeywords.slice(0, 12).map((kw) => (
                <View
                  key={kw}
                  className={classnames(styles.keywordTag, selectedKeywords.includes(kw) && styles.selected)}
                  onClick={() => toggleKeyword(kw)}
                >
                  {kw}
                </View>
              ))}
            </View>
            <View className={styles.customInput}>
              <Input
                className={styles.input}
                placeholder="输入自定义关键词"
                value={customKeyword}
                onInput={(e) => setCustomKeyword(e.detail.value)}
              />
              <View className={styles.addBtn} onClick={handleAddCustomKeyword}>添加</View>
            </View>
            {selectedKeywords.length > 0 && (
              <View className={styles.selectedTags}>
                {selectedKeywords.map((kw) => (
                  <View key={kw} className={styles.tag}>
                    <Text>#{kw}</Text>
                    <Text className={styles.remove} onClick={() => handleRemoveKeyword(kw)}>×</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>
            <Text className={styles.required}>*</Text>
            <Text>初步判断</Text>
          </View>
          <View className={classnames(styles.textareaWrapper, focusedField === 'judgment' && styles.focused)}>
            <Textarea
              className={styles.textarea}
              placeholder="请描述内容概要、涉及人群、可能造成的影响..."
              value={initialJudgment}
              onInput={(e) => setInitialJudgment(e.detail.value)}
              onFocus={() => setFocusedField('judgment')}
              onBlur={() => setFocusedField(null)}
              maxlength={500}
            />
            <View className={styles.counter}>{initialJudgment.length}/500</View>
          </View>
        </View>
      </View>

      <View className={styles.historySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>我的上报</Text>
          <Text className={styles.count}>共 {myClues.length} 条</Text>
        </View>
        {myClues.length === 0 ? (
          <View className={styles.empty}>暂无上报记录</View>
        ) : (
          myClues.map((clue) => (
            <ClueCard key={clue.id} clue={clue} />
          ))
        )}
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>提交线索</Text>
        </View>
      </View>

      {showSuccess && (
        <View className={styles.successModal} onClick={handleCloseSuccess}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.successIcon}>✓</View>
            <Text className={styles.title}>提交成功</Text>
            <Text className={styles.subtitle}>线索已成功上报，请等待处理</Text>
            <View className={styles.clueId}>
              <Text className={styles.label}>线索编号</Text>
              <Text className={styles.id}>{newClueId.toUpperCase().slice(0, 12)}</Text>
            </View>
            <View className={styles.actions}>
              <View className={classnames(styles.btn, styles.secondary)} onClick={handleCloseSuccess}>
                继续上报
              </View>
              <View className={classnames(styles.btn, styles.primary)} onClick={handleViewDetail}>
                查看详情
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReportPage;
