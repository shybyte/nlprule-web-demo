import * as wasm from '../../nlprule-wasm/pkg';

export interface Correction extends CorrectionFromWasm {
  id: string;
  issueText: string;
}

export interface CorrectionFromWasm {
  source: string;
  message: string;
  span: Span;
  replacements: string[];
}


export interface Span {
  byte: Range;
  char: Range;
}

export interface Range {
  start: number;
  end: number;
}

console.time('Initialize nlprule');
const nlpRuleChecker = wasm.NlpRuleChecker.new();
console.timeEnd('Initialize nlprule');

self.onmessage = ({data: {text}}) => {
  console.time('Check');
  const corrections: CorrectionFromWasm[] = nlpRuleChecker.check(text);
  console.timeEnd('Check');

  const correctionsResult: Correction[] = corrections.map((it, i) => ({
    ...it,
    id: 'id_' + i,
    issueText: text.slice(it.span.char.start, it.span.char.end)
  }));

  self.postMessage({
    eventType: 'checkFinished',
    corrections: correctionsResult,
  });
};

self.postMessage({eventType: 'loaded'});
