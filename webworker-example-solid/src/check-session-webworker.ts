import PromiseWorker from 'promise-worker';
import {Correction, CorrectionFromWasm, Range, Sentence} from './nlprule-webworker';

const NUMBER_OF_WORKERS = Math.max(2, Math.floor(navigator.hardwareConcurrency / 4));

console.log(`Starting ${NUMBER_OF_WORKERS} NlpRule workers ...`);

function createNlpRuleWorker() {
  return new Worker(new URL('./nlprule-webworker.ts', import.meta.url));
}

let currentLoadingNlpRuleWorker: Worker = createNlpRuleWorker();
const promiseWorkers: PromiseWorker[] = [];

let correctionIdCounter = 0;

const correctionBySentenceCache = new Map<string, CorrectionFromWasm[]>();

let currentWorkerIndex = 0;

async function checkSentenceWithCaching(sentence: string): Promise<CorrectionFromWasm[]> {
  const cachedResult = correctionBySentenceCache.get(sentence);
  if (cachedResult) {
    return cachedResult;
  }

  const promiseWorker = promiseWorkers[currentWorkerIndex];
  currentWorkerIndex = (currentWorkerIndex + 1) % promiseWorkers.length;
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



function onNlpWorkerLoaded() {
  promiseWorkers.push(new PromiseWorker(currentLoadingNlpRuleWorker));

  if (promiseWorkers.length === 1) {
    self.postMessage({eventType: 'loaded'});
  }

  if (promiseWorkers.length < NUMBER_OF_WORKERS) {
    currentLoadingNlpRuleWorker = createNlpRuleWorker();
    setWorkerOnLoadHandler(currentLoadingNlpRuleWorker);
  }
}

function setWorkerOnLoadHandler(worker: Worker) {
  worker.onmessage = (message) => {
    if (message.data.eventType === 'loaded') {
      onNlpWorkerLoaded();
    }
  }
}

setWorkerOnLoadHandler(currentLoadingNlpRuleWorker);
