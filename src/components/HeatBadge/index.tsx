import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { HeatLevel } from '@/types';
import { getHeatLevelText } from '@/utils';

interface HeatBadgeProps {
  level: HeatLevel;
  showText?: boolean;
}

const HeatBadge: React.FC<HeatBadgeProps> = ({ level, showText = true }) => {
  return (
    <View className={classnames(styles.badge, styles[level])}>
      {showText ? getHeatLevelText(level) : '●'}
    </View>
  );
};

export default HeatBadge;
