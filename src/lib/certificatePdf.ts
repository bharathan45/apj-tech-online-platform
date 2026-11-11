import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function downloadCertificateAsPdf(
  element: HTMLElement,
  certificateId: string,
  studentName: string
): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const prevTransform = element.style.transform;
  element.style.transform = 'none';

  try {
    const dataUrl = await toPng(element, {
      width: 1122,
      height: 794,
      pixelRatio: 2,
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210);
    const safeStudent = studentName.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40) || 'Student';
    pdf.save(`APJ_Tech_${certificateId}_${safeStudent}.pdf`);
  } finally {
    element.style.transform = prevTransform;
  }
}
