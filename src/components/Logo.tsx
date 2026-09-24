// Reusable logo: image from src/assets/logo.png + optional "ResumeFit" text.

import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing} from '../theme';

type Props = {
  size?: 'sm' | 'md' | 'lg'; // pixel size of the mark
  showWordmark?: boolean; // hide the text if you only want the icon
  stacked?: boolean; // column on Home, row on Result
};

const SIZE = {sm: 32, md: 48, lg: 72};

const Logo = ({size = 'md', showWordmark = true, stacked = false}: Props) => {
  const px = SIZE[size];

  return (
    <View style={[styles.row, stacked && styles.stack]}>
      <Image
        source={require('../assets/logo.png')} // bundled at build time
        style={{width: px, height: px, borderRadius: px * 0.22}}
        accessibilityLabel="ResumeFit logo"
      />
      {showWordmark ? (
        <Text
          style={[
            styles.wordmark,
            size === 'sm' && styles.wordmarkSm,
            size === 'lg' && styles.wordmarkLg,
          ]}>
          ResumeFit
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stack: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  wordmark: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  wordmarkSm: {
    fontSize: 16,
  },
  wordmarkLg: {
    fontSize: 26,
    letterSpacing: -0.6,
  },
});

export default Logo;
