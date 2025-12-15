'use client';

import { ReactNode, cloneElement, isValidElement, ReactElement } from 'react';

interface LockedFeatureProps {
  children: ReactNode;
  isLocked: boolean;
  tooltip?: string;
}

export function LockedFeature({ children, isLocked, tooltip = "Upgrade to unlock" }: LockedFeatureProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  if (isValidElement(children)) {
    const childElement = children as ReactElement<{ className?: string; disabled?: boolean; title?: string }>;
    return cloneElement(childElement, {
      disabled: true,
      title: tooltip,
      className: `${childElement.props.className || ''} opacity-50 cursor-not-allowed`.trim(),
    });
  }

  return (
    <div className="opacity-50 cursor-not-allowed" title={tooltip}>
      {children}
    </div>
  );
}