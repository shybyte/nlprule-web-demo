import registerPromiseWorker from 'promise-worker/register';
import * as wasm from '../../nlprule-wasm/pkg';

export interface Sentence {
  text: string;
  position: number;
}

export interface Correction extends CorrectionFromWasm {
  id: string;
  issueText: string;
  position: Range;
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


function sentencize(text: string): Sentence[] {
  const sentenceTexts: string[] = nlpRuleChecker.sentencize(text);
  let pos = 0;
  return sentenceTexts.map(sentenceText => {
    const sentenceWithPos: Sentence = {
      text: sentenceText,
      position: pos
    };
    pos += sentenceText.length;
    return sentenceWithPos;
  });
}


function check(text: string): CorrectionFromWasm[] {
  return nlpRuleChecker.check(text);
}

const publicApi = {sentencize, check};

interface PromiseWorkerMessage {
  command: keyof typeof publicApi;
  text: string;
}

registerPromiseWorker((message: PromiseWorkerMessage) => {
  return publicApi[message.command](message.text);
});

self.postMessage({eventType: 'loaded'});
