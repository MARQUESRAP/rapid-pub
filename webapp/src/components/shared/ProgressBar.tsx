import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color = 'var(--color-green-accent)',
  height = 4,
  animated = true,
}: ProgressBarProps) {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: 'var(--color-gray-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    position: 'relative',
  };

  const barStyle: React.CSSProperties = {
    height: '100%',
    width: `${Math.min(100, Math.max(0, progress))}%`,
    backgroundColor: color,
    transition: animated ? 'width 0.3s ease-in-out' : 'none',
    borderRadius: 'var(--radius-full)',
  };

  return (
    <div style={containerStyle}>
      <div style={barStyle} />
    </div>
  );
}

interface StepProgressProps {
  steps: Array<{
    label: string;
    completed: boolean;
    active?: boolean;
  }>;
}

export function StepProgress({ steps }: StepProgressProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md) 0',
  };

  const stepStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  });

  const dotStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: completed
      ? 'var(--color-green-accent)'
      : active
      ? 'var(--color-orange-primary)'
      : 'var(--color-gray-300)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: completed || active ? 'var(--color-white)' : 'var(--color-gray-600)',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  });

  const labelStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    fontSize: '0.75rem',
    color: completed || active ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
    fontWeight: completed || active ? 600 : 400,
    textAlign: 'center',
  });

  const lineStyle = (completed: boolean): React.CSSProperties => ({
    flex: 1,
    height: '2px',
    backgroundColor: completed ? 'var(--color-green-accent)' : 'var(--color-gray-300)',
    transition: 'background-color 0.3s ease',
  });

  return (
    <div style={containerStyle}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div style={stepStyle(step.completed, step.active || false)}>
            <div style={dotStyle(step.completed, step.active || false)}>
              {step.completed ? '✓' : index + 1}
            </div>
            <span style={labelStyle(step.completed, step.active || false)}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div style={lineStyle(step.completed)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
