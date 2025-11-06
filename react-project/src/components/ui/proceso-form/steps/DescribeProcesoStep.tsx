import React from 'react';
import DescribeProcesoStepTabs from './DescribeProcesoStepTabs';

export type DescribeProcesoStepProps = React.ComponentProps<typeof DescribeProcesoStepTabs>;

export const DescribeProcesoStep: React.FC<DescribeProcesoStepProps> = (props) => {
  return <DescribeProcesoStepTabs {...props} />;
};

export default DescribeProcesoStep;