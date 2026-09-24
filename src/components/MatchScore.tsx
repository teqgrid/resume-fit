// Big score + colored bar. Color rules live in theme.scoreColor.

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Radius, Spacing, scoreColor} from '../theme';

type Props = {
  percent: number; // already clamped 0–100 in parseModelJson
};

const MatchScore = ({percent}: Props) => {
  const color = scoreColor(percent); // green 75+, amber 50–74, red below 50

  return (
    <View style={styles.card}>
      <Text style={[styles.number, {color}]}>{percent}</Text>
      <Text style={styles.label}>match score</Text>
      <View style={styles.track}>
        {/* Width is a percent string, e.g. "80%" of the track */}
        <View
          style={[
            styles.fill,
            {width: `${percent}%`, backgroundColor: color},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  number: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 62,
  },
  label: {
    marginTop: Spacing.xs,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  track: {
    marginTop: Spacing.lg,
    width: '100%',
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});

export default MatchScore;
