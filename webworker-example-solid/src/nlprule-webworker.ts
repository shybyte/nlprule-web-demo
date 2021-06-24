import * as wasm from '../../nlprule-wasm/pkg';

export interface Correction {
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
  const corrections = nlpRuleChecker.check(text);
  console.timeEnd('Check');
  self.postMessage({
    eventType: 'checkFinished',
    corrections: corrections,
  });
};

self.postMessage({eventType: 'loaded'});
