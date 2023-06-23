import React from 'react';
import { Select, SelectList, SelectOption } from '@patternfly/react-core';

export const SelectBasic: React.FunctionComponent = () => (
  <Select id="single-select" placeholder="Select a value">
    <SelectList>
      <SelectOption value="Option 1">Option 1</SelectOption>
      <SelectOption value="Option 2">Option 2</SelectOption>
      <SelectOption value="Option 3">Option 3</SelectOption>
    </SelectList>
  </Select>
);
