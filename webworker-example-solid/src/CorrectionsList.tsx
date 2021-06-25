import {For, onMount} from 'solid-js';

import './CorrectionsList.css'

import {Correction} from './nlprule-webworker';

interface CorrectionsListProps {
  corrections: Correction[];
  selectCorrection: (correction: Correction) => void;
  selectedCorrectionId: string | undefined;
  removedCorrectionIDs: Set<string>;
  replaceCorrection: (correction: Correction, replacement: string) => void;
}

export function CorrectionsList(props: CorrectionsListProps) {
  return <ul className="corrections-list">
    <For each={props.corrections} fallback={<div>No problem found.</div>}>
      {correction => <CorrectionCard
        correction={correction}
        selectCorrection={props.selectCorrection}
        replaceCorrection={props.replaceCorrection}
        isSelected={correction.id === props.selectedCorrectionId}
        isRemoved={props.removedCorrectionIDs.has(correction.id)}
      />
      }
    </For>
  </ul>
}

interface CorrectionCardProps {
  selectCorrection: (correction: Correction) => void;
  replaceCorrection: (correction: Correction, replacement: string) => void;
  correction: Correction;
  isSelected: boolean;
  isRemoved: boolean;
}

function CorrectionCard(props: CorrectionCardProps) {
  return <li
    className="correction-card"
    classList={{
      'selected-correction': props.isSelected,
      'removed-correction': props.isRemoved
    }}
    onClick={() => {
      props.selectCorrection(props.correction)
    }}>
    <div>
      <span className="issue-text">{props.correction.issueText}</span>
      <span className="arrow-right">&rArr;</span>
      <ul className="correction-card-replacements">
        <For each={props.correction.replacements}>
          {replacement =>
            <li
              title="Replace with suggestions"
              onClick={() => {
                props.replaceCorrection(props.correction, replacement);
              }}>
              {replacement}
            </li>
          }
        </For>
      </ul>
    </div>

    <div className="correction-card-message">{props.correction.message}</div>
  </li>
}
