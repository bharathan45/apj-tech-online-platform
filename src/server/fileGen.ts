import { jsPDF } from 'jspdf';
import type { CourseMaterial } from '../types.ts';

export interface GeneratedDownloadPayload {
  buffer: Buffer;
  contentType: string;
  fileName: string;
}

export function generateStudyMaterialFile(material: CourseMaterial): GeneratedDownloadPayload {
  const safeName = material.fileName || `${material.id}.txt`;
  const lower = safeName.toLowerCase();

  if (lower.endsWith('.pdf') || material.fileType.toUpperCase() === 'PDF') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header band in Deep Navy
    doc.setFillColor(7, 20, 38);
    doc.rect(0, 0, pageWidth, 34, 'F');
    // Gold accent line
    doc.setFillColor(229, 172, 50);
    doc.rect(0, 34, pageWidth, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('APJ Tech', 18, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(229, 172, 50);
    doc.text('Build & Inspire  |  Turning Ideas into Technology.', 18, 24);

    doc.setTextColor(200, 214, 235);
    doc.setFontSize(9);
    doc.text('100% ONLINE SERVICES', pageWidth - 18, 16, { align: 'right' });
    doc.text('bharathan45k@gmail.com  |  +91 8668130425', pageWidth - 18, 24, { align: 'right' });

    // Title block
    doc.setTextColor(16, 43, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`COURSE CATEGORY: ${material.courseCategory.toUpperCase()}`, 18, 48);

    doc.setTextColor(7, 20, 38);
    doc.setFontSize(20);
    const titleLines = doc.splitTextToSize(material.title, pageWidth - 36);
    doc.text(titleLines, 18, 58);

    let y = 58 + titleLines.length * 8 + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(material.description, pageWidth - 36);
    doc.text(descLines, 18, y);

    y += descLines.length * 6 + 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(18, y, pageWidth - 18, y);
    y += 10;

    // Study Content
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const bodyText = material.previewContent || material.description;
    const paragraphs = bodyText.split('\n');

    for (const para of paragraphs) {
      if (y > pageHeight - 28) {
        doc.addPage();
        y = 22;
      }
      const trimmed = para.trim();
      if (!trimmed) {
        y += 4;
        continue;
      }
      if (trimmed.startsWith('#')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(16, 43, 80);
        const headingText = trimmed.replace(/^#+\s*/, '');
        const hLines = doc.splitTextToSize(headingText, pageWidth - 36);
        doc.text(hLines, 18, y);
        y += hLines.length * 6.5 + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
      } else {
        const lines = doc.splitTextToSize(trimmed, pageWidth - 36);
        doc.text(lines, 18, y);
        y += lines.length * 5.8 + 2.5;
      }
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'APJ Tech — 100% Online IT Training & Student Project Guidance  |  https://wa.me/918668130425',
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );

    const arrayBuf = doc.output('arraybuffer');
    return {
      buffer: Buffer.from(arrayBuf),
      contentType: 'application/pdf',
      fileName: safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`,
    };
  }

  if (lower.endsWith('.csv')) {
    return {
      buffer: Buffer.from(material.previewContent || '', 'utf-8'),
      contentType: 'text/csv; charset=utf-8',
      fileName: safeName,
    };
  }

  if (lower.endsWith('.js')) {
    return {
      buffer: Buffer.from(material.previewContent || '', 'utf-8'),
      contentType: 'application/javascript; charset=utf-8',
      fileName: safeName,
    };
  }

  if (lower.endsWith('.sql')) {
    return {
      buffer: Buffer.from(material.previewContent || '', 'utf-8'),
      contentType: 'application/sql; charset=utf-8',
      fileName: safeName,
    };
  }

  if (lower.endsWith('.html')) {
    const htmlDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(material.title)} - APJ Tech</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 20px; color: #071426; line-height: 1.6; }
    header { background: #071426; color: #fff; padding: 24px; border-radius: 8px; border-bottom: 4px solid #E5AC32; }
    h1 { margin: 0 0 6px; font-size: 24px; }
    pre { background: #F4F7FC; padding: 18px; border-radius: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; font-family: monospace; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(material.title)}</h1>
    <p>APJ Tech | ${escapeHtml(material.courseCategory)} | 100% Online Services</p>
  </header>
  <p>${escapeHtml(material.description)}</p>
  <pre>${escapeHtml(material.previewContent || '')}</pre>
</body>
</html>`;
    return {
      buffer: Buffer.from(htmlDoc, 'utf-8'),
      contentType: 'text/html; charset=utf-8',
      fileName: safeName,
    };
  }

  return {
    buffer: Buffer.from(`${material.title}\n\n${material.description}\n\n${material.previewContent || ''}`, 'utf-8'),
    contentType: 'text/plain; charset=utf-8',
    fileName: safeName,
  };
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
