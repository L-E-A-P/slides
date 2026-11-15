// Single source of truth for the ordered list of presentation stops.
// Loaded by index.html (presentation.js), presenter.html (presenter.js)
// and the Node tests, so every consumer agrees on order and count.
//
// To reorder or rename: edit this array, then `git mv` the files in
// content/ so their NN prefix matches the new index. Never hand-write
// the prefix elsewhere — contentPath() derives it.
(function (root) {
  const STOPS = [
    'title',
    'bertoncini',
    'concerto',
    'spazio',
    'catena-aria',
    'catena-audio',
    'sean',
    'seam-ltm',
    'soglia',
    'thanks',
  ];

  // content/NN-<id>.md, NN = zero-padded index in STOPS
  function contentPath(id) {
    const nn = String(STOPS.indexOf(id)).padStart(2, '0');
    return `content/${nn}-${id}.md`;
  }

  root.STOPS = STOPS;
  root.contentPath = contentPath;
})(typeof window !== 'undefined' ? window : globalThis);
