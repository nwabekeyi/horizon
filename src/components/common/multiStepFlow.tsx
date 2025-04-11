import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface Step {
  label: string; // Tab label (e.g., "ID Card")
  content: React.ReactNode; // Content to render for this step
  validate?: () => boolean; // Optional validation function to enable/disable "Next"
  disableNext?: boolean; // Optional prop to disable "Next" button explicitly
}

interface MultiStepFlowProps {
  steps: Step[]; // Array of steps
  onSubmit?: () => void; // Callback for final submission
  initialStep?: string; // Initial tab value (defaults to "1")
}

export const MultiStepFlow: React.FC<MultiStepFlowProps> = ({ steps, onSubmit, initialStep = '1' }) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const handleNext = () => {
    const currentIndex = parseInt(currentStep) - 1;
    if (currentIndex < steps.length - 1) {
      setCurrentStep((currentIndex + 2).toString());
    }
  };

  const handleBack = () => {
    const currentIndex = parseInt(currentStep) - 1;
    if (currentIndex > 0) {
      setCurrentStep((currentIndex).toString());
    }
  };

  const isFirstStep = parseInt(currentStep) === 1;
  const isLastStep = parseInt(currentStep) === steps.length;

  // const currentStepData = steps[parseInt(currentStep) - 1];

  return (
    <Box sx={{ width: '100%', typography: 'body1', p: 2 }}>
      <TabContext value={currentStep}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            aria-label="multi-step tabs"
            TabIndicatorProps={{ style: { backgroundColor: '#1976d2' } }}
          >
            {steps.map((step, index) => (
              <Tab
                key={index}
                label={step.label}
                value={(index + 1).toString()}
                disabled // Tabs are disabled for navigation; use buttons instead
              />
            ))}
          </TabList>
        </Box>

        {steps.map((step, index) => (
          <TabPanel key={index} value={(index + 1).toString()}>
            <Stack direction="column" spacing={2}>
              {step.content}
              <Stack direction="row" spacing={2}>
                {!isFirstStep && (
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {!isLastStep ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      step.disableNext !== undefined
                        ? step.disableNext
                        : step.validate
                        ? !step.validate()
                        : false
                    }
                  >
                    Next
                  </Button>
                ) : (
                  onSubmit && (
                    <Button variant="contained" onClick={onSubmit}>
                      Submit
                    </Button>
                  )
                )}
              </Stack>
            </Stack>
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
};