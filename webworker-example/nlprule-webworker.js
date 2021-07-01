import * as wasm from "nlprule-wasm";

console.time("Initialize nlprule");
const nlpRuleChecker = wasm.NlpRuleChecker.new();
console.timeEnd("Initialize nlprule");

self.onmessage = ({ data: { action, text } }) => {
  console.time(action);
  const results = nlpRuleChecker[action](text);
  console.timeEnd(action);
  self.postMessage({
    eventType: 'results',
    results: results,
  });
};

self.postMessage({eventType: 'loaded'});
