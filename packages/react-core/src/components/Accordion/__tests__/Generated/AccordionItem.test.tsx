/**
 * This test was generated
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { AccordionItem } from '../../AccordionItem';
// any missing imports can usually be resolved by adding them here
import {} from '../..';

it('AccordionItem should match snapshot (auto-generated)', () => {
  const view = render(<AccordionItem children={<>ReactNode</>} />);
  expect(view.container.outerHTML).toMatchSnapshot();
});
