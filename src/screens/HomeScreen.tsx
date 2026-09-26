// Home screen: collect two inputs (PDF + job text) and call Gemini.
// This file is the "product" glue. Heavy API work is in src/api/.

import React, {useState} from 'react';
import {
  ActivityIndicator, // spinner on the Analyze button while the network runs
  KeyboardAvoidingView, // lifts the form when the iOS keyboard opens
  Platform,
  Pressable, // tap targets (better than Button for custom UI)
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {pickResumePdf} from '../api/pickResume';
import {
  GEMINI_MODEL,
  MAX_RESUME_BYTES,
  analyzeResumeMatch,
  getGeminiApiKey,
  uriToBase64,
} from '../api/gemini';
import {SAMPLE_JOB_DESCRIPTION} from '../constants/sampleJob';
import {PickedResume} from '../types';
import {Colors, Radius, Spacing} from '../theme';
import Logo from '../components/Logo';

const HomeScreen = () => {
  // Distance from screen edge to notch / home indicator. Used as padding.
  const insets = useSafeAreaInsets();
  // Typed navigation so navigate('Result', { analysis, fileName }) is checked.
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  // Four pieces of screen state. Changing any of them re-renders the UI.
  const [resume, setResume] = useState<PickedResume | null>(null); // picked PDF
  const [jobDescription, setJobDescription] = useState(''); // JD text box
  const [error, setError] = useState(''); // red banner message
  const [loading, setLoading] = useState(false); // true during Gemini call

  // Step 1: open the system picker and keep a local PDF copy.
  const onPickResume = async () => {
    setError('');
    try {
      const picked = await pickResumePdf();
      if (!picked) {
        return; // user cancelled the picker — stay quiet
      }
      if (picked.size && picked.size > MAX_RESUME_BYTES) {
        setResume(null);
        setError('Please choose a PDF smaller than 5 MB.');
        return;
      }
      setResume(picked);
    } catch (err) {
      setResume(null);
      setError(err instanceof Error ? err.message : 'Could not pick a file.');
    }
  };

  // Step 2+3: validate, convert PDF → base64, POST Gemini, open Result.
  const onAnalyze = async () => {
    const trimmedJd = jobDescription.trim();
    if (!resume) {
      setError('Upload a PDF resume first.');
      return;
    }
    if (!trimmedJd) {
      setError('Paste a job description first.');
      return;
    }
    if (!getGeminiApiKey()) {
      setError(
        'Missing GEMINI_API_KEY. Copy .env.example to .env, paste your Google AI Studio key, then rebuild the app.',
      );
      return;
    }

    setError('');
    setLoading(true); // show spinner and lock buttons
    try {
      const pdfBase64 = await uriToBase64(resume.uri);
      const analysis = await analyzeResumeMatch(pdfBase64, trimmedJd);
      navigation.navigate('Result', {
        analysis,
        fileName: resume.name,
      });
    } catch (err) {
      // Show the real API / parse error on the red banner.
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      // Always turn the spinner off — even if Gemini throws.
      setLoading(false);
    }
  };

  return (
    // On iOS, padding mode pushes content up when the keyboard covers the JD box.
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28},
        ]}
        keyboardShouldPersistTaps="handled" // taps still work while keyboard is open
        showsVerticalScrollIndicator={false}>
        {/* Hero: logo + one-line pitch */}
        <View style={styles.hero}>
          <Logo size="lg" stacked />
          <Text style={styles.title}>See if you fit the role</Text>
          <Text style={styles.subtitle}>PDF in. Job text in. Match out.</Text>
          <View style={styles.modelChip}>
            <Text style={styles.modelChipText}>Model  ·  {GEMINI_MODEL}</Text>
          </View>
        </View>

        {/* Step 1 card — dashed until a file is chosen */}
        <Pressable
          onPress={onPickResume}
          disabled={loading}
          style={({pressed}) => [
            styles.upload,
            resume && styles.uploadFilled,
            pressed && styles.pressed,
          ]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
          <Text style={styles.uploadTitle}>
            {resume ? resume.name : 'Upload resume'}
          </Text>
          <Text style={styles.uploadHint}>
            {resume ? 'Tap to replace  ·  PDF, 5 MB max' : 'PDF only  ·  5 MB max'}
          </Text>
          {resume ? (
            <Pressable
              onPress={() => setResume(null)}
              disabled={loading}
              hitSlop={8}>
              <Text style={styles.clear}>Remove</Text>
            </Pressable>
          ) : null}
        </Pressable>

        {/* Step 2 card — empty by default; "Use sample" fills a demo JD */}
        <View style={styles.jdCard}>
          <View style={styles.jdHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
            <Text style={styles.jdLabel}>Job description</Text>
            <Pressable
              onPress={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}
              disabled={loading}
              hitSlop={8}>
              <Text style={styles.sample}>Use sample</Text>
            </Pressable>
          </View>
          <TextInput
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste the job post here"
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            editable={!loading}
            style={styles.input}
          />
        </View>

        {/* Only mount the error box when there is a message */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onAnalyze}
          disabled={loading}
          style={({pressed}) => [
            styles.button,
            pressed && styles.pressed,
            loading && styles.buttonDisabled,
          ]}>
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>Analyze match</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// StyleSheet keeps styles next to the component (React Native pattern).
const styles = StyleSheet.create({
  flex: {
    flex: 1, // fill the phone screen
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    marginTop: Spacing.base,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modelChip: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  modelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  upload: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    borderStyle: 'dashed', // empty state looks like a drop zone
    borderColor: Colors.dashed,
    paddingVertical: 28,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  uploadFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  uploadHint: {
    marginTop: 4,
    color: Colors.textMuted,
    fontSize: 13,
  },
  clear: {
    marginTop: Spacing.md,
    color: Colors.primary,
    fontWeight: '700',
  },
  jdCard: {
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  jdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  jdLabel: {
    flex: 1, // pushes "Use sample" to the right
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sample: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    minHeight: 120,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  errorBox: {
    marginTop: Spacing.base,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full, // pill button
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88, // light press feedback
  },
});

export default HomeScreen;
