import * as wasm from "nlprule-wasm";

const nlpRuleChecker = wasm.NlpRuleChecker.new();

console.log("suggestions2: " ,nlpRuleChecker.check('She was not been here since Monday.'))

window.nlpRuleChecker = nlpRuleChecker;

const textInputField = document.getElementById('textInputField');
const correctionsField = document.getElementById('correctionsField');

function checkTextInput() {
  const corrections = nlpRuleChecker.check(textInputField.value);
  correctionsField.value = corrections.length > 0
    ? JSON.stringify(corrections, null, 2)
    : 'I have found no issue.'

}

textInputField.addEventListener('input', checkTextInput);

checkTextInput();
