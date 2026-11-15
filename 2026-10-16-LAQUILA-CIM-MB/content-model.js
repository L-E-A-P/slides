// Pure parsing of a stop's Markdown file. No DOM, no fetch: loads in the
// browser (window.ContentModel) and in Node tests (globalThis.ContentModel).
//
// File shape:
//   <!--layout: name-->      optional, line 1 only
//   <audience slide>
//   <!--gallery-->
//   <gallery items>          ![alt](src) images or <iframe src="…">
//   <!--presenter-->
//   <presenter notes>
(function (root) {
  const LAYOUT_RE = /^[ \t]*<!--[ \t]*layout:[ \t]*([a-z-]+)[ \t]*-->[ \t]*\r?\n?/;
  const LAYOUTS = ['default', 'title', 'section', 'portrait'];
  const GALLERY_RE = /<!--\s*gallery\s*-->/;
  const PRESENTER_RE = /<!--\s*presenter\s*-->/;

  // Ordered gallery items. One regex with three alternatives keeps images,
  // iframes and videos interleaved in document order.
  function parseGalleryItems(md) {
    const out = [];
    const re = /!\[([^\]]*)\]\(([^)]+)\)|<iframe[^>]*\ssrc="([^"]+)"[^>]*>|<video[^>]*\ssrc="([^"]+)"[^>]*>/g;
    let m;
    while ((m = re.exec(md || ''))) {
      if (m[3] !== undefined) out.push({ type: 'iframe', src: m[3] });
      else if (m[4] !== undefined) out.push({ type: 'video', src: m[4] });
      else out.push({ type: 'image', src: m[2], alt: m[1] });
    }
    return out;
  }

  function parseStop(md) {
    let layout = 'default';
    const lm = LAYOUT_RE.exec(md);
    if (lm) { layout = lm[1]; md = md.slice(lm[0].length); }
    const pm = PRESENTER_RE.exec(md);
    const beforePresenter = pm ? md.slice(0, pm.index) : md;
    const notes = pm ? md.slice(pm.index + pm[0].length).trim() : '';
    const gm = GALLERY_RE.exec(beforePresenter);
    const audience = (gm ? beforePresenter.slice(0, gm.index) : beforePresenter).trim();
    const galleryMd = gm ? beforePresenter.slice(gm.index + gm[0].length) : '';
    return { layout, audience, gallery: parseGalleryItems(galleryMd), notes };
  }

  // Text of the first Markdown heading, emphasis markers stripped.
  function firstHeading(md) {
    const m = /^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/m.exec(md || '');
    return m ? m[1].replace(/[*_`]/g, '') : '';
  }

  root.ContentModel = { parseStop, parseGalleryItems, firstHeading, LAYOUTS };
})(typeof window !== 'undefined' ? window : globalThis);
