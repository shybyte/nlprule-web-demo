import {createSignal, onMount, Show} from 'solid-js';
import {render} from 'solid-js/web';

const nlpruleWorker = new Worker(new URL('./nlprule-webworker.ts', import.meta.url));

function App() {
  const [text, setText] = createSignal('She was not been here since Monday.');
  const [correctionsText, setCorrectionsText] = createSignal('Initializing...');
  const [isChecking, setIsChecking] = createSignal(true);

  function checkTextInput() {
    console.log('Start Check');
    setIsChecking(true);
    nlpruleWorker.postMessage({text: text()});
  }

  onMount(() => {
    nlpruleWorker.onmessage = ({data: {eventType, corrections}}) => {
      switch (eventType) {
        case 'loaded':
          checkTextInput();
          return
        case 'checkFinished':
          setIsChecking(false);
          setCorrectionsText(corrections.length > 0
            ? JSON.stringify(corrections, null, 2)
            : 'I have found no issue.'
          )
      }
    };
  });

  return (
    <>
      <form id="textInputForm" onSubmit={(event) => {
        event.preventDefault();
        checkTextInput();
      }}>
        <label for="textInputField">Text:</label>
        <textarea id="textInputField" cols="80" rows="10" value={text()} onInput={(event) => {
          setText((event.target as HTMLTextAreaElement).value)
        }}/>
        <button id="checkButton" disabled={isChecking()}>Check</button>
      </form>

      <Show when={isChecking()}>
        <div id="loadingSpinner" class="lds-dual-ring"/>
      </Show>

      <label for="correctionsField">Corrections:</label>
      <textarea id="correctionsField" cols="80" rows="20" readOnly value={correctionsText()}/>
    </>
  );
}


export function renderApp() {
  render(() => <App/>, document.getElementById('app')!);
}
