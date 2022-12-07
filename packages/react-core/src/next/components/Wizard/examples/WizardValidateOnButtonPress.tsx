import React from 'react';

import {
  Button,
  Alert,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  Progress,
  EmptyStateSecondaryActions,
  Form,
  FormGroup,
  TextInput
} from '@patternfly/react-core';
import { Wizard, WizardStep, WizardFooterWrapper, useWizardContext } from '@patternfly/react-core/next';
import CogsIcon from '@patternfly/react-icons/dist/esm/icons/cogs-icon';

interface ValidationProgressProps {
  onClose(): void;
}

const ValidationProgress: React.FunctionComponent<ValidationProgressProps> = ({ onClose }) => {
  const [percentValidated, setPercentValidated] = React.useState(0);

  const tick = React.useCallback(() => {
    if (percentValidated < 100) {
      setPercentValidated(prevValue => prevValue + 20);
    }
  }, [percentValidated]);

  React.useEffect(() => {
    const interval = setInterval(() => tick(), 1000);

    return () => {
      clearInterval(interval);
    };
  }, [tick]);

  return (
    <div className="pf-l-bullseye">
      <EmptyState variant="large">
        <EmptyStateIcon icon={CogsIcon} />
        <Title headingLevel="h4" size="lg">
          {percentValidated === 100 ? 'Validation complete' : 'Validating credentials'}
        </Title>
        <EmptyStateBody>
          <Progress value={percentValidated} measureLocation="outside" aria-label="Wizard validation progress" />
        </EmptyStateBody>
        <EmptyStateBody>
          Description can be used to further elaborate on the validation step, or give the user a better idea of how
          long the process will take.
        </EmptyStateBody>
        <EmptyStateSecondaryActions>
          <Button isDisabled={percentValidated !== 100} onClick={onClose}>
            Log to console
          </Button>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </div>
  );
};

interface LastStepFooterProps {
  isValid: boolean;
  hasErrorOnSubmit: boolean;
  setIsSubmitted(isSubmitted: boolean): void;
  setHasErrorOnSubmit(isSubmitted: boolean): void;
}

const LastStepFooter: React.FunctionComponent<LastStepFooterProps> = ({
  isValid,
  hasErrorOnSubmit,
  setIsSubmitted,
  setHasErrorOnSubmit
}) => {
  const { goToStepByName, goToNextStep } = useWizardContext();

  const validateLastStep = (onNext: () => void) => {
    setIsSubmitted(true);

    if (!isValid) {
      setHasErrorOnSubmit(true);
      setIsSubmitted(false);
    } else {
      onNext();
    }
  };

  return (
    <>
      {hasErrorOnSubmit && <Alert isInline variant="danger" title="Validation failed. Go back to the Step 1." />}

      <WizardFooterWrapper>
        <Button onClick={() => validateLastStep(goToNextStep)}>Validate</Button>
        <Button onClick={() => goToStepByName('Step 1')}>Go to Beginning</Button>
      </WizardFooterWrapper>
    </>
  );
};

interface SampleFormProps {
  value: string;
  isValid: boolean;
  setValue: (value: string) => void;
  setIsValid: (isValid: boolean) => void;
}

const SampleForm: React.FunctionComponent<SampleFormProps> = ({ value, isValid, setValue, setIsValid }) => {
  const validated = isValid ? 'default' : 'error';

  const handleTextInputChange = (value: string) => {
    const isValid = /^\d+$/.test(value);

    setValue(value);
    setIsValid(isValid);
  };

  return (
    <Form>
      <FormGroup
        label="Age:"
        type="number"
        helperTextInvalid="Age has to be a number"
        fieldId="age"
        validated={validated}
      >
        <TextInput
          validated={validated}
          value={value}
          id="age"
          aria-describedby="age-helper"
          onChange={handleTextInputChange}
        />
      </FormGroup>
    </Form>
  );
};

export const WizardValidateOnButtonPress: React.FunctionComponent = () => {
  const [ageValue, setAgeValue] = React.useState('Thirty');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isFirstStepValid, setIsFirstStepValid] = React.useState(false);
  const [hasErrorOnSubmit, setHasErrorOnSubmit] = React.useState(false);

  // eslint-disable-next-line no-console
  const onClose = () => console.log('Some close action occurs here.');

  if (isSubmitted && isFirstStepValid) {
    return <ValidationProgress onClose={onClose} />;
  }

  return (
    <Wizard
      title="Validate on button press wizard"
      onClose={onClose}
      footer={{ nextButtonText: 'Forward', backButtonText: 'Backward' }}
      height={400}
    >
      <WizardStep name="Step 1" id="validate-btn-step-1" status={hasErrorOnSubmit ? 'error' : 'default'}>
        <SampleForm
          value={ageValue}
          setValue={value => {
            setAgeValue(value);
            setHasErrorOnSubmit(false);
          }}
          isValid={isFirstStepValid}
          setIsValid={setIsFirstStepValid}
        />
      </WizardStep>
      <WizardStep name="Step 2" id="validate-btn-step-2">
        Step 2 content
      </WizardStep>
      <WizardStep
        name="Final Step"
        id="validate-btn-finish-step"
        footer={
          <LastStepFooter
            isValid={isFirstStepValid}
            setIsSubmitted={setIsSubmitted}
            hasErrorOnSubmit={hasErrorOnSubmit}
            setHasErrorOnSubmit={setHasErrorOnSubmit}
          />
        }
      >
        Your age: {ageValue}
      </WizardStep>
    </Wizard>
  );
};
