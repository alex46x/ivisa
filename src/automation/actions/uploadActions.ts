import { uploadSelectors } from '../../selectors/uploadSelectors';
import { findFirstMatchingElement } from '../../utils/domHelpers';
import { ApplicantDocument } from '../../types/applicant';
import { logger } from '../../utils/logger';

export function base64ToFile(base64Data: string, filename: string, mimeType = 'application/pdf'): File {
  const arr = base64Data.split(',');
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
}

export function attachDocumentToInput(
  fileInput: HTMLInputElement,
  docItem: ApplicantDocument
): boolean {
  if (!docItem.fileData) {
    logger.warning(`Cannot attach document ${docItem.fileName}: File content not in memory.`);
    return false;
  }

  try {
    const file = base64ToFile(docItem.fileData, docItem.fileName, docItem.fileType || 'application/pdf');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    logger.action(`Attached document [${docItem.fileName}] to file input.`);
    return true;
  } catch (err) {
    logger.error(`Failed to attach document [${docItem.fileName}]`, { error: String(err) });
    return false;
  }
}

export function checkUploadStatus(doc: Document = document): 'idle' | 'success' | 'error' {
  const successEl = findFirstMatchingElement(uploadSelectors.uploadSuccessIndicator, doc);
  if (successEl) return 'success';

  const errorEl = findFirstMatchingElement(uploadSelectors.uploadErrorIndicator, doc);
  if (errorEl) return 'error';

  return 'idle';
}
