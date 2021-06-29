import * as wasm from '../../nlprule-wasm/pkg';

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

let correctionIdCounter = 0;

const correctionBySentenceCache = new Map<string, CorrectionFromWasm[]>();

function checkSentenceWithCaching(sentence: string): CorrectionFromWasm[]{
  const cachedResult = correctionBySentenceCache.get(sentence);
  if (cachedResult) {
    return cachedResult;
  }

  const result = nlpRuleChecker.check(sentence);
  correctionBySentenceCache.set(sentence, result);
  return result;
}


self.onmessage = ({data: {text}}) => {
  console.time('Check');

  const sentences: string[] = nlpRuleChecker.sentencize(text);

  let sentenceStartPosition = 0;

  for (const sentence of sentences) {
    const correctionsWasm: CorrectionFromWasm[] = checkSentenceWithCaching(sentence);

    const corrections: Correction[] = correctionsWasm.map((it) => {
      const position: Range = {
        start: sentenceStartPosition + it.span.char.start,
        end: sentenceStartPosition + it.span.char.end
      };

      return ({
        ...it,
        id: 'id_' + (correctionIdCounter++),
        position: position,
        issueText: text.slice(position.start, position.end)
      });
    });

    if (corrections.length > 0) {
      self.postMessage({
        eventType: 'corrections',
        corrections: corrections,
      });
    }

    sentenceStartPosition += sentence.length;
  }

  console.timeEnd('Check');

  self.postMessage({
    eventType: 'checkFinished'
  });
};

self.postMessage({eventType: 'loaded'});
