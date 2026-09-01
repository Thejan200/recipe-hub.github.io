(() => {
  const LIBRARY_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  let libraryPromise;

  function loadLibrary() {
    if (window.html2pdf) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = LIBRARY_URL;
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

  function waitForImage(img) {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth > 0) return resolve(true);
      let finished = false;
      const finish = ok => { if (finished) return; finished = true; img.removeEventListener('load', onload); img.removeEventListener('error', onerror); resolve(ok); };
      const onload = () => finish(true);
      const onerror = () => finish(false);
      img.addEventListener('load', onload, { once: true });
      img.addEventListener('error', onerror, { once: true });
      setTimeout(() => finish(img.naturalWidth > 0), 8000);
    });
  }

  async function downloadRecipePDF() {
    const source = document.getElementById('recipe-card');
    const detail = document.getElementById('recipe-detail');
    if (!source || !detail) return;

    const title = source.getAttribute('data-print-title') || document.title.replace(/\s*\|.*$/, '') || 'Recipe';
    const image = detail.querySelector('.detail-image');
    const editorial = detail.querySelector('.recipe-editorial');
    const button = document.activeElement;
    const oldText = button && button.matches('button') ? button.textContent : '';
    let wrapper;

    if (button && button.matches('button')) { button.disabled = true; button.textContent = 'Creating PDF…'; }

    try {
      await loadLibrary();

      wrapper = document.createElement('div');
      wrapper.className = 'pdf-export-document';
      wrapper.style.cssText = [
        'position:absolute','left:0','top:0','width:180mm','box-sizing:border-box',
        'background:#fff','color:#111','padding:0','margin:0','z-index:2147483647',
        'pointer-events:none','font-family:Arial,sans-serif'
      ].join(';');

      const style = document.createElement('style');
      style.textContent = `
        .pdf-export-document, .pdf-export-document * { box-sizing:border-box !important; }
        .pdf-export-document h1, .pdf-export-document h2, .pdf-export-document h3 { color:#111 !important; }
        .pdf-export-document .pdf-keep-together,
        .pdf-export-document .recipe-box,
        .pdf-export-document .editorial-card,
        .pdf-export-document .ingredients,
        .pdf-export-document .instructions { break-inside:avoid !important; page-break-inside:avoid !important; }
        .pdf-export-document .pdf-page-section { break-before:auto; page-break-before:auto; }
        .pdf-export-document .pdf-recipe-image { display:block !important; width:100% !important; height:auto !important; max-width:100% !important; max-height:none !important; object-fit:contain !important; object-position:center !important; margin:0 0 18px !important; }
        .pdf-export-document .editorial-card { width:100% !important; display:block !important; overflow:visible !important; }
        .pdf-export-document .editorial-card h3 { break-after:avoid !important; page-break-after:avoid !important; }
        .pdf-export-document li { break-inside:avoid !important; page-break-inside:avoid !important; }
      `;
      wrapper.appendChild(style);

      const heading = document.createElement('h1');
      heading.textContent = title;
      heading.style.cssText = 'font-family:Georgia,serif;font-size:28px;line-height:1.15;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid #222;color:#111;';
      wrapper.appendChild(heading);

      if (image && image.currentSrc) {
        const img = document.createElement('img');
        img.className = 'pdf-recipe-image';
        img.src = image.currentSrc;
        img.alt = image.alt || title;
        img.crossOrigin = 'anonymous';
        wrapper.appendChild(img);
        await waitForImage(img);
      }

      const recipeClone = source.cloneNode(true);
      recipeClone.removeAttribute('id');
      recipeClone.removeAttribute('data-print-title');
      recipeClone.style.cssText = 'display:block;width:100%;max-width:none;margin:0;padding:0;background:#fff;color:#111;';
      recipeClone.querySelectorAll('button,iframe,video,.recipe-video,.related,.print-recipe-image').forEach(el => el.remove());
      recipeClone.querySelectorAll('.recipe-layout').forEach(el => { el.style.cssText = 'display:block;width:100%;margin:0;padding:0;'; });
      recipeClone.querySelectorAll('.recipe-box').forEach(el => { el.classList.add('pdf-keep-together'); el.style.cssText = 'display:block;position:static;width:100%;box-sizing:border-box;margin:20px 0 0;padding:16px;background:#f7f7f7;color:#111;border:1px solid #bbb;border-radius:0;'; });
      recipeClone.querySelectorAll('.ingredients,.instructions').forEach(el => el.classList.add('pdf-keep-together'));
      recipeClone.querySelectorAll('h2').forEach(el => { el.style.cssText += 'font-family:Georgia,serif;font-size:20px;margin:20px 0 10px;color:#111;'; });
      recipeClone.querySelectorAll('li').forEach(el => { el.style.cssText += 'break-inside:avoid;page-break-inside:avoid;line-height:1.55;margin-bottom:7px;color:#111;'; });
      wrapper.appendChild(recipeClone);

      if (editorial) {
        const editorialClone = editorial.cloneNode(true);
        editorialClone.style.cssText = 'display:block;width:100%;margin:24px 0 0;padding:0;';
        editorialClone.querySelector('.section-head')?.remove();
        editorialClone.querySelectorAll('.editorial-grid').forEach(el => { el.style.cssText = 'display:block;width:100%;'; });
        editorialClone.querySelectorAll('.editorial-card').forEach(el => {
          el.classList.add('pdf-keep-together');
          el.style.cssText = 'display:block;box-sizing:border-box;width:100%;padding:16px;margin:0 0 14px;background:#fff;color:#111;border:1px solid #bbb;border-radius:0;overflow:visible;break-inside:avoid;page-break-inside:avoid;';
        });
        editorialClone.querySelectorAll('h3').forEach(el => { el.style.cssText += 'font-family:Georgia,serif;font-size:17px;margin:0 0 8px;color:#111;break-after:avoid;page-break-after:avoid;'; });
        editorialClone.querySelectorAll('li').forEach(el => { el.style.cssText += 'font-size:10.5pt;line-height:1.55;color:#111;padding:1.5mm 0;break-inside:avoid;page-break-inside:avoid;'; });
        wrapper.appendChild(editorialClone);
      }

      document.body.appendChild(wrapper);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvasWidth = wrapper.scrollWidth;
      const canvasHeight = wrapper.scrollHeight;
      if (canvasWidth < 20 || canvasHeight < 20) throw new Error('Printable recipe content did not render.');

      await window.html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${slugify(title)}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          width: canvasWidth,
          height: canvasHeight,
          windowWidth: Math.max(document.documentElement.clientWidth, canvasWidth),
          windowHeight: Math.max(document.documentElement.clientHeight, canvasHeight)
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.pdf-keep-together', '.recipe-box', '.editorial-card', '.ingredients', '.instructions']
        }
      }).from(wrapper).save();
    } catch (error) {
      console.error('Recipe PDF export failed:', error);
      alert('The recipe PDF could not be generated. Please try again.');
    } finally {
      wrapper?.remove();
      if (button && button.matches('button')) { button.disabled = false; button.textContent = oldText || 'Print recipe'; }
    }
  }

  window.downloadRecipePDF = downloadRecipePDF;
  window.print = downloadRecipePDF;
})();
