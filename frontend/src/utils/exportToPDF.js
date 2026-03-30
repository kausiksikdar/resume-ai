import html2pdf from 'html2pdf.js';

export const exportToPDF = (elementId, filename = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  // Store original styles
  const originalOverflow = element.style.overflow;
  const originalMaxHeight = element.style.maxHeight;
  const originalHeight = element.style.height;

  // Remove constraints so the whole content is visible for capture
  element.style.overflow = 'visible';
  element.style.maxHeight = 'none';
  element.style.height = 'auto';

  const options = {
    margin: 0.5,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      // Restore original styles
      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;
      element.style.height = originalHeight;
    })
    .catch((error) => {
      console.error('PDF export error:', error);
      // Restore original styles even on error
      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;
      element.style.height = originalHeight;
    });
};