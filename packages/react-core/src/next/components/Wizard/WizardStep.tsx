import React from 'react';

import { WizardNavItemType } from './types';
import { WizardBodyProps } from './WizardBody';
import { useWizardContext } from './WizardContext';
import { WizardFooterProps } from './WizardFooter';

/**
 * The primary child component for Wizard. Step props are used for the list of steps managed in context.
 */

export interface WizardStepProps {
  /** Name of the step's navigation item */
  name: React.ReactNode;
  /** Unique identifier */
  id: string | number;
  /** Optional for when the step is used as a parent to sub-steps */
  children?: React.ReactNode;
  /** Props for WizardBody that wraps content by default. Can be set to null for exclusion of WizardBody. */
  body?: Omit<Omit<WizardBodyProps, 'children'>, 'children'> | null;
  /** Optional list of sub-steps */
  steps?: React.ReactElement<WizardStepProps>[];
  /** Flag to disable the step's navigation item */
  isDisabled?: boolean;
  /** Flag to determine whether the step is hidden */
  isHidden?: boolean;
  /** Replaces the step's navigation item or its properties. */
  navItem?: WizardNavItemType;
  /** Replaces the step's footer. The step's footer takes precedance over the wizard's footer. */
  footer?: React.ReactElement | Partial<WizardFooterProps>;
  /** Used to determine icon next to the step's navigation item */
  status?: 'default' | 'error';
}

export const WizardStep = ({ children, steps: _subSteps, ...props }: WizardStepProps) => {
  const { activeStep, steps, setStep, setSteps } = useWizardContext();
  const { id, name, body, isDisabled, isHidden, navItem, footer, status } = props;
  const isHiddenRef = React.useRef(isHidden);

  // Update step in context when props change or when the step is active has yet to be marked as visited.
  React.useEffect(() => {
    setStep({
      id,
      name,
      ...(body && { body }),
      ...(isDisabled && { isDisabled }),
      ...(isHidden && { isHidden }),
      ...(navItem && { navItem }),
      ...(footer && { footer }),
      ...(status && { status }),
      ...(id === activeStep?.id && !activeStep?.isVisited && { isVisited: true })
    });
  }, [body, footer, id, isDisabled, isHidden, name, navItem, status, activeStep?.id, activeStep?.isVisited, setStep]);

  // If the step was previously hidden and not visited yet, when it is shown,
  // all steps beyond it should be disabled to ensure it is visited.
  React.useEffect(() => {
    if (isHiddenRef.current && !isHidden) {
      const currentStep = steps.find(step => step.id === id);

      setSteps(prevSteps =>
        prevSteps.map(prevStep => {
          if (prevStep.index > currentStep.index && prevStep.isVisited && !currentStep.isVisited) {
            return { ...prevStep, isVisited: false };
          }

          return prevStep;
        })
      );
    }

    if (isHiddenRef.current !== isHidden) {
      isHiddenRef.current = isHidden;
    }
  }, [id, isHidden, setSteps, steps]);

  return <>{children}</>;
};

WizardStep.displayName = 'WizardStep';
