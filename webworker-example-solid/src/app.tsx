import CodeMirror from 'codemirror';
import 'codemirror/addon/display/placeholder.js';
import 'codemirror/lib/codemirror.css';
import {createSignal, onMount, Show} from 'solid-js';
import {render} from 'solid-js/web';
import './index.css'


const nlpruleWorker = new Worker(new URL('./nlprule-webworker.ts', import.meta.url));

function App() {
  const [correctionsText, setCorrectionsText] = createSignal('Initializing...');
  const [isChecking, setIsChecking] = createSignal(true);
  let codeMirror: CodeMirror.Editor;

  let codeMirrorContainer!: HTMLDivElement;

  function checkTextInput() {
    console.log('Start Check');
    setIsChecking(true);
    nlpruleWorker.postMessage({text: codeMirror.getValue()});
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

    codeMirror = CodeMirror(codeMirrorContainer, {
      lineNumbers: true,
      placeholder: 'Type here!',
      extraKeys: {Tab: false}
    });
    codeMirror.setValue('She was not been here since Monday.');
    codeMirror.focus();
  });

  return (
    <>
      <h2>Input Text</h2>
      <div ref={codeMirrorContainer}></div>

      <button
        id="checkButton"
        disabled={isChecking()}
        onClick={(event) => {
          checkTextInput();
        }}
      >Check
      </button>

      <Show when={isChecking()}>
        <div id="loadingSpinner" class="lds-dual-ring"/>
      </Show>

      <h2>Corrections</h2>
      <textarea id="correctionsField" cols="80" rows="20" readOnly value={correctionsText()}/>
    </>
  );
}


export function renderApp() {
  render(() => <App/>, document.getElementById('app')!);
}
