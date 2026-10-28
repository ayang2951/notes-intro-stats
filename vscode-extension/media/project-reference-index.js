'use strict';

const { scanMarkdownCallouts } = require('./callout-reference-index');
const { scanMarkdownEquations } = require('./equation-reference-index');

/**
 * Build one project-wide reference index. Documents must already be in section
 * order, and their sectionNumber values remain authoritative when files are
 * absent from that ordered list.
 */
function buildProjectReferenceIndex(documents, options = {}) {
  const index = new Map();
  if (!Array.isArray(documents)) return index;
  const includeCallouts = options.includeCallouts !== false;

  for (const document of documents) {
    const records = scanMarkdownEquations(document);
    if (includeCallouts) records.push(...scanMarkdownCallouts(document));

    for (const record of records) {
      if (!index.has(record.id)) index.set(record.id, []);
      index.get(record.id).push(record);
    }
  }

  return index;
}

function projectReferenceRecords(index) {
  if (!(index instanceof Map)) return [];
  return Array.from(index.values()).flat();
}

module.exports = {
  buildProjectReferenceIndex,
  projectReferenceRecords
};
