// Opens the system file picker and returns a local PDF we can read.
// This is NOT Expo Document Picker — it is @react-native-documents/picker.

import {
  pick, // shows the iOS/Android document sheet
  types, // MIME / UTI helpers (we only allow PDF)
  keepLocalCopy, // copies the picked file into the app cache
  errorCodes,
  isErrorWithCode,
} from '@react-native-documents/picker';
import {PickedResume} from '../types';

export async function pickResumePdf(): Promise<PickedResume | null> {
  try {
    // One PDF only. The OS sheet is filtered to application/pdf.
    const [file] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
    });

    // Some pickers still return a Word file. Reject those for this demo.
    const name = file.name ?? 'resume.pdf';
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      throw new Error('Please upload PDF');
    }

    // Picker URIs can expire. Copy into caches so fetch/base64 still works.
    const [local] = await keepLocalCopy({
      files: [{uri: file.uri, fileName: name}],
      destination: 'cachesDirectory',
    });

    if (local.status !== 'success') {
      throw new Error(local.copyError || 'Could not copy the selected file.');
    }

    return {
      name,
      uri: local.localUri, // file:// path we pass to uriToBase64
      size: file.size ?? undefined,
    };
  } catch (error) {
    // User tapped Cancel — that is not a failure. Return null, no red banner.
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
