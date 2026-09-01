(() => {
  const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  let libraryPromise;

  function loadJsPDF() {
    if (window.jspdf?.jsPDF) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = JSPDF_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('PDF library could not be loaded.'));
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function slugify(value) {
    return String(value || 'recipe').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'recipe';
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function loadImage(src) {
    return new Promise(resolve => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function imageData(img) {
    if (!img) return null;
    try {
      const canvas = document.createElement('canvas');
      const max = 1800;
      const scale = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return { data: canvas.toDataURL('image/jpeg', 0.92), ratio: canvas.width / canvas.height };
    } catch (e) {
      console.warn('Recipe image could not be embedded in PDF:', e);
      return null;
    }
  }

  function createPdf(doc, source, detail, title, imageInfo) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;
    const bottom = pageH - margin;
    let y = margin;

    const colors = {
      ink: [25, 25, 25],
      muted: [80, 80, 80],
      line: [205, 205, 205],
      soft: [247, 247, 247]
    };

    function pageBreak(required = 18) {
      if (y + required <= bottom) return false;
      doc.addPage();
      y = margin;
      return true;
    }

    function setBody() {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...colors.ink);
    }

    function wrapped(text, x, maxW, lineH = 5.2) {
      const lines = doc.splitTextToSize(cleanText(text), maxW);
      for (const line of lines) {
        pageBreak(lineH);
        doc.text(line, x, y);
        y += lineH;
      }
      return lines.length * lineH;
    }

    function heading(text, size = 17) {
      pageBreak(size * 0.45 + 9);
      doc.setFont('times', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(...colors.ink);
      doc.text(text, margin, y);
      y += size * 0.48 + 5;
      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.25);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
      setBody();
    }

    function sectionLabel(text) {
      pageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(...colors.ink);
      doc.text(text, margin, y);
      y += 7;
      setBody();
    }

    function bullet(text, indent = 4) {
      const x = margin + indent;
      const textX = x + 4.5;
      const maxW = contentW - indent - 4.5;
      const lines = doc.splitTextToSize(cleanText(text), maxW);
      const h = Math.max(5.2, lines.length * 5.2);
      pageBreak(h + 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('•', x, y);
      setBody();
      doc.text(lines, textX, y, { lineHeightFactor: 1 });
      y += h + 2.5;
    }

    function numbered(index, text) {
      const x = margin + 1;
      const textX = margin + 9;
      const maxW = contentW - 9;
      const lines = doc.splitTextToSize(cleanText(text), maxW);
      const h = Math.max(5.2, lines.length * 5.2);
      pageBreak(Math.min(h + 2, 18));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(235, 78, 31);
      doc.text(`${index}.`, x, y);
      setBody();
      doc.text(lines, textX, y, { lineHeightFactor: 1 });
      y += h + 3.5;
    }

    function card(titleText, bodyTexts) {
      const lineH = 4.8;
      const innerW = contentW - 12;
      let estimated = 12 + 7;
      const wrappedBodies = bodyTexts.map(t => {
        const lines = doc.splitTextToSize(cleanText(t), innerW);
        estimated += lines.length * lineH + 3;
        return lines;
      });
      estimated += 7;
      if (estimated <= contentW * 0 + (bottom - margin)) pageBreak(estimated);
      if (y + estimated > bottom) {
        doc.addPage();
        y = margin;
      }
      const top = y - 2;
      doc.setFillColor(...colors.soft);
      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.25);
      doc.roundedRect(margin, top, contentW, estimated, 1.5, 1.5, 'FD');
      y += 4;
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...colors.ink);
      doc.text(titleText, margin + 6, y);
      y += 7;
      setBody();
      wrappedBodies.forEach(lines => {
        doc.text('•', margin + 6, y);
        doc.text(lines, margin + 10, y, { lineHeightFactor: 1 });
        y += lines.length * lineH + 3;
      });
      y = top + estimated + 5;
    }

    // Title — vector text, so it remains crisp instead of being rasterized.
    doc.setFont('times', 'bold');
    doc.setFontSize(25);
    doc.setTextColor(...colors.ink);
    const titleLines = doc.splitTextToSize(title, contentW);
    doc.text(titleLines, margin, y, { lineHeightFactor: 1.12 });
    y += titleLines.length * 8.5 + 3;
    doc.setDrawColor(...colors.ink);
    doc.setLineWidth(0.45);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    // Image: preserve the original aspect ratio; never stretch or crop.
    if (imageInfo?.data && imageInfo.ratio > 0) {
      const maxW = contentW;
      const maxH = 82;
      let w = maxW;
      let h = w / imageInfo.ratio;
      if (h > maxH) { h = maxH; w = h * imageInfo.ratio; }
      pageBreak(h + 7);
      const x = margin + (contentW - w) / 2;
      doc.addImage(imageInfo.data, 'JPEG', x, y, w, h, undefined, 'MEDIUM');
      y += h + 8;
    }

    // Ingredients.
    const ingredients = [...source.querySelectorAll('.ingredients li')].map(li => cleanText(li.textContent)).filter(Boolean);
    if (ingredients.length) {
      sectionLabel('Ingredients');
      ingredients.forEach(text => bullet(text));
    }

    // Instructions.
    const instructions = [...source.querySelectorAll('.instructions li')].map(li => {
      const clone = li.cloneNode(true);
      clone.querySelector('strong')?.remove();
      return cleanText(clone.textContent);
    }).filter(Boolean);
    if (instructions.length) {
      heading('Instructions', 17);
      instructions.forEach((text, i) => numbered(i + 1, text));
    }

    // Recipe card details, flattened into a compact printable block.
    const recipeBox = source.querySelector('.recipe-box');
    if (recipeBox) {
      const details = [];
      recipeBox.querySelectorAll('.stats span').forEach(span => {
        const label = cleanText(span.querySelector('b')?.textContent || '');
        const value = cleanText(span.textContent.replace(span.querySelector('b')?.textContent || '', ''));
        if (label && value) details.push(`${label}: ${value}`);
      });
      recipeBox.querySelectorAll('h3').forEach(h3 => {
        const next = h3.nextElementSibling;
        if (next) details.push(`${cleanText(h3.textContent)}: ${cleanText(next.textContent)}`);
      });
      if (details.length) {
        heading('Recipe Details', 15);
        details.forEach(text => bullet(text));
      }
    }

    // Tips / mistakes / substitutions / storage: each complete card stays together.
    const editorialCards = [...detail.querySelectorAll('.recipe-editorial .editorial-card')];
    editorialCards.forEach(el => {
      const h = cleanText(el.querySelector('h3')?.textContent || 'Recipe Notes');
      const items = [...el.querySelectorAll('li')].map(li => cleanText(li.textContent)).filter(Boolean);
      if (items.length) card(h, items);
    });

    // Small footer on every generated PDF page is deliberately omitted; the document remains recipe-focused.
    return doc;
  }

  async function downloadRecipePDF() {
    const source = document.getElementById('recipe-card');
    const detail = document.getElementById('recipe-detail');
    if (!source || !detail) return;

    const title = source.getAttribute('data-print-title') || document.title.replace(/\s*\|.*$/, '') || 'Recipe';
    const image = detail.querySelector('.detail-image');
    const button = document.activeElement;
    const oldText = button && button.matches('button') ? button.textContent : '';

    if (button && button.matches('button')) { button.disabled = true; button.textContent = 'Creating PDF…'; }

    try {
      await loadJsPDF();
      const img = await loadImage(image?.currentSrc || image?.src || '');
      const imageInfo = imageData(img);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      createPdf(doc, source, detail, title, imageInfo);
      doc.save(`${slugify(title)}.pdf`);
    } catch (error) {
      console.error('Recipe PDF export failed:', error);
      alert('The recipe PDF could not be generated. Please try again.');
    } finally {
      if (button && button.matches('button')) { button.disabled = false; button.textContent = oldText || 'Print recipe'; }
    }
  }

  window.downloadRecipePDF = downloadRecipePDF;
  window.print = downloadRecipePDF;
})();
