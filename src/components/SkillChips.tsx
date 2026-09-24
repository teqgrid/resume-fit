// Pill chips for matching (green) vs missing (red) skills.

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Radius, Spacing} from '../theme';

type Props = {
  skills: string[];
  variant: 'match' | 'gap';
};

const SkillChips = ({skills, variant}: Props) => {
  if (skills.length === 0) {
    return (
      <Text style={styles.empty}>
        {variant === 'match' ? 'No matching skills found.' : 'No obvious gaps.'}
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {skills.map(skill => (
        <View
          key={skill}
          style={[
            styles.chip,
            variant === 'match' ? styles.matchChip : styles.gapChip,
          ]}>
          <Text
            style={[
              styles.chipText,
              variant === 'match' ? styles.matchText : styles.gapText,
            ]}>
            {skill}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap', // chips flow to the next line
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  matchChip: {
    backgroundColor: Colors.successLight,
  },
  gapChip: {
    backgroundColor: Colors.dangerLight,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  matchText: {
    color: Colors.success,
  },
  gapText: {
    color: Colors.danger,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});

export default SkillChips;
