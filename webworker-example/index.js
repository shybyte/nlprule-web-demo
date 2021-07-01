const nlpruleWorker = new Worker(new URL('./nlprule-webworker.js', import.meta.url));

const actionButtons = document.getElementById('actionButtons');
const textInputField = document.getElementById('textInputField');
const correctionsField = document.getElementById('outputField');
const loadingSpinner = document.getElementById('loadingSpinner');

function executeActionOnTextInput(action) {
  console.log('Start Check');
  actionButtons.disabled = true;
  loadingSpinner.style.display = 'block';
  nlpruleWorker.postMessage({action, text: textInputField.value});
}

nlpruleWorker.onmessage = ({data: {eventType, results}}) => {
  switch (eventType) {
    case 'loaded':
      executeActionOnTextInput('check');
      return
    case 'results':
      loadingSpinner.style.display = 'none';
      actionButtons.disabled = false;
      correctionsField.value = JSON.stringify(results, null, 2)
  }
};

function addAction(action) {
  document.getElementById(action + 'Button').addEventListener('click', async (event) => {
    event.preventDefault();
    executeActionOnTextInput(action);
  });
}

['check', 'sentencize', 'tokenize'].forEach(addAction);



