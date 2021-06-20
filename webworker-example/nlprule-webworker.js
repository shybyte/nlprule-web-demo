import * as wasm from "nlprule-wasm";

console.time("Initialize nlprule");
const nlpRuleChecker = wasm.NlpRuleChecker.new();
console.timeEnd("Initialize nlprule");

self.onmessage = ({ data: { text } }) => {
  console.time('Check');
  const corrections = nlpRuleChecker.check(text);
  console.timeEnd('Check');
  self.postMessage({
    eventType: 'checkFinished',
    corrections: corrections,
  });
};

self.postMessage({eventType: 'loaded'});
