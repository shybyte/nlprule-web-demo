import {renderApp} from "./app";

const nlpruleWorker = new Worker(new URL('./nlprule-webworker.js', import.meta.url));

const textInputForm = document.getElementById('textInputForm')!;
const textInputField = document.getElementById('textInputField') as HTMLTextAreaElement;
const checkButton = document.getElementById('checkButton') as HTMLButtonElement;
const correctionsField = document.getElementById('correctionsField') as HTMLTextAreaElement;
const loadingSpinner = document.getElementById('loadingSpinner')!;

function checkTextInput() {
  console.log('Start Check');
  checkButton.disabled = true;
  loadingSpinner.style.display = 'block';
  nlpruleWorker.postMessage({text: textInputField.value});
}

nlpruleWorker.onmessage = ({data: {eventType, corrections}}) => {
  switch (eventType) {
    case 'loaded':
      checkTextInput();
      return
    case 'checkFinished':
      loadingSpinner.style.display = 'none';
      checkButton.disabled = false;
      correctionsField.value = corrections.length > 0
        ? JSON.stringify(corrections, null, 2)
        : 'I have found no issue.'
  }
};

textInputForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  checkTextInput();
})

renderApp();
