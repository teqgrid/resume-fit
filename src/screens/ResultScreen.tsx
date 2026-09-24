// Result screen: render the JSON Gemini already returned.
// It does not call the API. Wrong score → fix the prompt, not this file.

import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import MatchScore from '../components/MatchScore';
import SkillChips from '../components/SkillChips';
import Logo from '../components/Logo';
import {Colors, Radius, Spacing} from '../theme';

// Props include navigation (goBack) and route.params from Home.
type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const ResultScreen = ({navigation, route}: Props) => {
  const insets = useSafeAreaInsets();
  // Passed in by Home after analyzeResumeMatch succeeds.
  const {analysis, fileName} = route.params;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + 24},
      ]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Logo size="sm" />
      </View>
      <Text style={styles.title}>Match result</Text>
      <Text style={styles.fileName}>{fileName}</Text>

      {/* Big number + color bar from analysis.matchPercent */}
      <View style={styles.block}>
        <MatchScore percent={analysis.matchPercent} />
      </View>

      {analysis.summary ? (
        <View style={styles.card}>
          <Text style={styles.section}>Summary</Text>
          <Text style={styles.body}>{analysis.summary}</Text>
        </View>
      ) : null}

      {analysis.experienceAlignment ? (
        <View style={styles.card}>
          <Text style={styles.section}>Experience alignment</Text>
          <Text style={styles.body}>{analysis.experienceAlignment}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.section}>Matching skills</Text>
        <SkillChips skills={analysis.matchingSkills} variant="match" />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Missing skills</Text>
        <SkillChips skills={analysis.missingSkills} variant="gap" />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Suggested edits</Text>
        {analysis.suggestedEdits.length === 0 ? (
          <Text style={styles.body}>No suggestions returned.</Text>
        ) : (
          analysis.suggestedEdits.map((edit, index) => (
            <View key={`${index}-${edit}`} style={styles.editRow}>
              <Text style={styles.editIndex}>{index + 1}.</Text>
              <Text style={styles.body}>{edit}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    marginTop: Spacing.md,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  fileName: {
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  block: {
    marginTop: Spacing.xl,
  },
  card: {
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  body: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  editRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  editIndex: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    width: 20,
  },
});

export default ResultScreen;
