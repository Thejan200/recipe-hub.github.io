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
      const done = ok => { img.removeEventListener('load', onload); img.removeEventListener('error', onerror); resolve(ok); };
      const onload = () => done(true);
      const onerror = () => done(false);
      img.addEventListener('load', onload, { once: true });
      img.addEventListener('error', onerror, { once: true });
      setTimeout(() => done(img.naturalWidth > 0), 8000);
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

    if (button && button.matches('button')) { button.disabled = true; button.textContent = 'Preparing PDF…'; }

    let wrapper;
    try {
      await loadLibrary();

      wrapper = document.createElement('div');
      wrapper.className = 'pdf-export-document';
      wrapper.style.cssText = 'position:fixed;left:-100000px;top:0;width:180mm;background:#fff;color:#111;padding:0;font-family:Arial,sans-serif;z-index:-1;';

      const heading = document.createElement('h1');
      heading.textContent = title;
      heading.style.cssText = 'font-family:Georgia,serif;font-size:28px;line-height:1.15;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid #222;';
      wrapper.appendChild(heading);

      if (image && image.currentSrc) {
        const img = document.createElement('img');
        img.src = image.currentSrc;
        img.alt = image.alt || title;
        img.style.cssText = 'display:block;width:100%;height:auto;max-height:105mm;object-fit:cover;margin:0 auto 18px;';
        wrapper.appendChild(img);
        await waitForImage(img);
      }

      const recipeClone = source.cloneNode(true);
      recipeClone.removeAttribute('id');
      recipeClone.style.cssText = 'display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:#fff!important;';
      recipeClone.querySelectorAll('button, iframe, video, .recipe-video, .related').forEach(el => el.remove());
      recipeClone.querySelectorAll('.print-recipe-image').forEach(el => el.remove());
      recipeClone.querySelectorAll('.recipe-layout').forEach(el => { el.style.cssText = 'display:block!important;width:100%!important;margin:0!important;'; });
      recipeClone.querySelectorAll('.recipe-box').forEach(el => { el.style.cssText = 'display:block!important;position:static!important;width:100%!important;margin:20px 0 0!important;padding:16px!important;background:#f7f7f7!important;border:1px solid #bbb!important;border-radius:0!important;'; });
      recipeClone.querySelectorAll('h2').forEach(el => { el.style.cssText = 'font-family:Georgia,serif;font-size:20px;margin:20px 0 10px;'; });
      recipeClone.querySelectorAll('li').forEach(el => { el.style.cssText += 'break-inside:avoid;page-break-inside:avoid;line-height:1.55;margin-bottom:7px;'; });
      wrapper.appendChild(recipeClone);

      if (editorial) {
        const editorialClone = editorial.cloneNode(true);
        editorialClone.style.cssText = 'display:block!important;width:100%!important;margin:24px 0 0!important;';
        editorialClone.querySelector('.section-head')?.remove();
        editorialClone.querySelectorAll('.editorial-grid').forEach(el => { el.style.cssText = 'display:block!important;width:100%!important;'; });
        editorialClone.querySelectorAll('.editorial-card').forEach(el => { el.style.cssText = 'display:block!important;padding:16px!important;margin:0 0 14px!important;background:#fff!important;border:1px solid #bbb!important;border-radius:0!important;break-inside:avoid;page-break-inside:avoid;'; });
        editorialClone.querySelectorAll('h3').forEach(el => { el.style.cssText = 'font-family:Georgia,serif;font-size:17px;margin:0 0 8px;'; });
        wrapper.appendChild(editorialClone);
      }

      document.body.appendChild(wrapper);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      await window.html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${slugify(title)}.pdf`,
        image: { type: 'jpeg', quality: 0.94 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'] }
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
