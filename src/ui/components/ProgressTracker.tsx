import React from 'react';
import { WorkflowStage, StageColorState } from '../../types/automation';

interface ProgressTrackerProps {
  currentStage: WorkflowStage;
  stageStatuses: Record<WorkflowStage, StageColorState>;
  subText?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStage,
  stageStatuses,
  subText = 'Detected: unknown'
}) => {
  const stages = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="va-stepper-wrap">
      <div className="va-stepper-nodes">
        {stages.map((num, idx) => {
          const status = stageStatuses[num as WorkflowStage] || 'not-started';
          const isActive = num === currentStage;
          const isCompleted = status === 'completed';

          return (
            <React.Fragment key={num}>
              <div
                className={`va-step-dot ${
                  isActive ? 'active' : isCompleted ? 'completed' : ''
                }`}
                title={`Stage ${num} (${status})`}
              >
                {isCompleted ? '✓' : num}
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`va-step-line ${isCompleted ? 'completed' : ''}`}
                />
              )}
            </React.Fragment>
          );
        })}
        {/* Final Checkmark Node */}
        <div className="va-step-line" />
        <div
          className={`va-step-dot ${
            currentStage === 9 && stageStatuses[9] === 'completed'
              ? 'completed'
              : ''
          }`}
        >
          ✓
        </div>
      </div>

      <div className="va-stepper-subtext" title={subText}>
        {subText}
      </div>
    </div>
  );
};
