import * as wasm from "nlprule-wasm";

const nlpRuleChecker = wasm.NlpRuleChecker.new();

window.nlpRuleChecker = nlpRuleChecker; // Export for debugging

const textInputForm = document.getElementById('textInputForm');
const textInputField = document.getElementById('textInputField');
const correctionsField = document.getElementById('correctionsField');
const loadingSpinner = document.getElementById('loadingSpinner');

function checkTextInput() {
  const corrections = nlpRuleChecker.check(textInputField.value);
  correctionsField.value = corrections.length > 0
    ? JSON.stringify(corrections, null, 2)
    : 'I have found no issue.'
}

async function checkTextInputWithLoadingSpinner() {
  loadingSpinner.style.display = 'block';
  await sleep(1); // Allow the UI thread to show the spinner.
  console.log('Start Check');
  console.time('Check');
  checkTextInput();
  console.timeEnd('Check');
  loadingSpinner.style.display = 'none';
}

textInputForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  checkTextInputWithLoadingSpinner();
})

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    });
  }, ms);
}

checkTextInputWithLoadingSpinner();
