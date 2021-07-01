import PromiseWorker from 'promise-worker';
import {Correction, CorrectionFromWasm, Range, Sentence} from './nlprule-webworker';

const NUMBER_OF_WORKERS = Math.max(2, Math.floor(navigator.hardwareConcurrency / 4));

console.log(`Starting ${NUMBER_OF_WORKERS} NlpRule workers ...`);

function createNlpRuleWorker() {
  return new Worker(new URL('./nlprule-webworker.ts', import.meta.url));
}

const nlpruleWorkers = Array.from(new Array(NUMBER_OF_WORKERS), createNlpRuleWorker);
const promiseWorkers = nlpruleWorkers.map(worker => new PromiseWorker(worker));

let correctionIdCounter = 0;

const correctionBySentenceCache = new Map<string, CorrectionFromWasm[]>();

let currentWorkerIndex = 0;

async function checkSentenceWithCaching(sentence: string): Promise<CorrectionFromWasm[]> {
  const cachedResult = correctionBySentenceCache.get(sentence);
  if (cachedResult) {
    return cachedResult;
  }

  const promiseWorker = promiseWorkers[currentWorkerIndex];
  currentWorkerIndex = (currentWorkerIndex + 1) % NUMBER_OF_WORKERS;
  const result = await promiseWorker.postMessage({command: 'check', text: sentence});
  correctionBySentenceCache.set(sentence, result);
  return result;
}


self.onmessage = async ({data: {text}}) => {
  console.time('Check');

  const sentences: Sentence[] = await promiseWorkers[0].postMessage({command: 'sentencize', text: text});

  currentWorkerIndex = 0;
  const sentencePromises = sentences.map(async (sentence) => {
    const correctionsWasm: CorrectionFromWasm[] = await checkSentenceWithCaching(sentence.text);

    const corrections: Correction[] = correctionsWasm.map((it) => {
      const position: Range = {
        start: sentence.position + it.span.char.start,
        end: sentence.position + it.span.char.end
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
  })

  await Promise.allSettled(sentencePromises);

  console.timeEnd('Check');

  self.postMessage({
    eventType: 'checkFinished'
  });
};


let loadedWorkerCount = 0;

function onNlpWorkerLoaded() {
  loadedWorkerCount += 1;
  if (loadedWorkerCount === NUMBER_OF_WORKERS) {
    self.postMessage({eventType: 'loaded'});
  }
}

for (const nlpruleWorker of nlpruleWorkers) {
  nlpruleWorker.onmessage = (message) => {
    if (message.data.eventType === 'loaded') {
      onNlpWorkerLoaded();
    }
  }
}
