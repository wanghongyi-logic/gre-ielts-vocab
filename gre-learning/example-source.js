// Learner UI only: retain the exact self-composed marker, never expose source labels or links.
// Original attribution evidence remains unchanged in the content records.
export function renderExampleSource(sourceAttribution) {
  return sourceAttribution === '自编' ? '<span class="example-source" aria-label="自编例句">自编</span>' : '';
}
