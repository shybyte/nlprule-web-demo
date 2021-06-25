import CodeMirror, {MarkerRange} from 'codemirror';
import 'codemirror/addon/display/placeholder.js';
import 'codemirror/lib/codemirror.css';
import {createSignal, onMount, Show} from 'solid-js';
import {render} from 'solid-js/web';
import './App.css';
import {CorrectionsList} from './CorrectionsList';
import './index.css';
import {Correction} from './nlprule-webworker';

const DEMO_TEXT = [
  'She was not been here since Monday.',
  'Its a lonely week.',
  'This week is longer then before.'
].join('\n');


const nlpruleWorker = new Worker(new URL('./nlprule-webworker.ts', import.meta.url));

function App() {
  const [removedCorrectionIDs, setRemovedCorrectionIDs] = createSignal(new Set<string>());
  const [corrections, setCorrections] = createSignal<Correction[]>([]);
  const [isChecking, setIsChecking] = createSignal(true);
  const [selectedCorrectionId, setSelectedCorrectionId] = createSignal<string | undefined>(undefined);
  let codeMirror: CodeMirror.Editor;

  let codeMirrorContainer!: HTMLDivElement;

  function checkTextInput() {
    console.log('Start Check');
    setIsChecking(true);
    nlpruleWorker.postMessage({text: codeMirror.getValue()});
  }

  function onCheckResult(corrections: Correction[]) {
    setRemovedCorrectionIDs(new Set());
    setCorrections(corrections);

    for (const textMarker of codeMirror.getAllMarks()) {
      textMarker.clear();
    }

    for (const correction of corrections) {
      const textMarker = codeMirror.markText(
        codeMirror.posFromIndex(correction.span.char.start),
        codeMirror.posFromIndex(correction.span.char.end),
        {
          className: 'correction-marker',
          attributes: {id: correction.id}
        }
      );
      textMarker.on('beforeCursorEnter', () => {
        setSelectedCorrectionId(correction.id);
      })
    }
  }

  onMount(() => {
    nlpruleWorker.onmessage = ({data: {eventType, corrections}}) => {
      switch (eventType) {
        case 'loaded':
          checkTextInput();
          return
        case 'checkFinished':
          setIsChecking(false);
          onCheckResult(corrections);
      }
    };

    codeMirror = CodeMirror(codeMirrorContainer, {
      lineNumbers: true,
      lineWrapping: true,
      placeholder: 'Type here!',
      extraKeys: {Tab: false}
    });
    codeMirror.setValue(DEMO_TEXT);
    codeMirror.focus();
  });

  function selectCorrection(correction: Correction) {
    setSelectedCorrectionId(correction.id);
    const marking = codeMirror.getAllMarks().find(it => it.attributes?.id === correction.id);
    if (marking) {
      const markerRange = marking.find() as MarkerRange;
      codeMirror.setSelection(markerRange.from, markerRange.to);
    }
  }

  function replaceCorrection(correction: Correction, replacement: string) {
    const marking = codeMirror.getAllMarks().find(it => it.attributes?.id === correction.id);
    if (marking) {
      const markerRange = marking.find() as MarkerRange;
      codeMirror.setSelection(markerRange.from, markerRange.to);
      codeMirror.replaceRange(replacement, markerRange.from, markerRange.to)
      marking.clear();
      setRemovedCorrectionIDs(new Set(removedCorrectionIDs()).add(correction.id));
    }
  }

  return (
    <main>
      <Show when={isChecking()}>
        <div id="loadingSpinner" class="lds-dual-ring"/>
      </Show>

      <div id="leftColumn">
        <h2>Input Text</h2>
        <div id="codeMirrorContainer" ref={codeMirrorContainer}></div>
      </div>

      <div id="rightColumn">
        <h2>Corrections <button
          id="checkButton"
          disabled={isChecking()}
          onClick={(event) => {
            checkTextInput();
          }}
        >Check</button>
        </h2>
        <Show when={corrections().length > 0} fallback={isChecking() ? 'Checking...' : 'No problems found.'}>
          <CorrectionsList
            corrections={corrections()}
            selectCorrection={selectCorrection}
            replaceCorrection={replaceCorrection}
            selectedCorrectionId={selectedCorrectionId()}
            removedCorrectionIDs={removedCorrectionIDs()}
          />
        </Show>
      </div>
    </main>
  );
}


export function renderApp() {
  render(() => <App/>, document.getElementById('app')!);
}
