import * as wasm from "nlprule-wasm";

const nlpRuleChecker = wasm.NlpRuleChecker.new();

console.log("suggestions: " ,nlpRuleChecker.check('She was not been here since Monday.'))

window.nlpRuleChecker = nlpRuleChecker;
