import {Correction, CorrectionFromWasm} from './nlprule-webworker';

const DUMMY_RESULT = [
  {
    'source': 'GRAMMAR/WAS_BEEN/1',
    'message': 'Did you mean was not or has not been?',
    'span': {
      'byte': {
        'start': 4,
        'end': 16
      },
      'char': {
        'start': 4,
        'end': 16
      }
    },
    'replacements': [
      'was not',
      'has not been'
    ],
    'id': 'id_0',
    'issueText': 'was not been'
  },
  {
    'source': 'TYPOS/IT_IS/36',
    'message': 'Did you mean it\'s (short for \'it is\') instead of \'its\' (possessive pronoun)?',
    'span': {
      'byte': {
        'start': 36,
        'end': 39
      },
      'char': {
        'start': 36,
        'end': 39
      }
    },
    'replacements': [
      'It\'s'
    ],
    'id': 'id_1',
    'issueText': 'Its'
  }
];

self.onmessage = ({data: {text}}) => {
  console.time('Check');
  const corrections: CorrectionFromWasm[] = DUMMY_RESULT;
  console.timeEnd('Check');

  const correctionsResult: Correction[] = corrections.map((it, i) => ({
    ...it,
    id: 'id_' + i,
    position: it.span.char,
    issueText: text.slice(it.span.char.start, it.span.char.end)
  }));

  self.postMessage({
    eventType: 'corrections',
    corrections: correctionsResult,
  })

  self.postMessage({
    eventType: 'checkFinished',
  });
};

self.postMessage({eventType: 'loaded'});
