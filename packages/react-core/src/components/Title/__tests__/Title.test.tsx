import * as React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Title, TitleSizes } from '..';

describe('Title', () => {
  Object.values(TitleSizes).forEach(size => {
    test(`${size} Title`, () => {
      render(
        <Title size={size} headingLevel="h1">
          {size} Title
        </Title>
      );
      expect(screen.getByRole('heading').outerHTML).toMatchSnapshot();
    });
  });

  test('Heading level can be set using a string value', () => {
    render(
      <Title size="lg" headingLevel="h3">
        H3 Heading
      </Title>
    );
    expect(screen.getByRole('heading').parentElement.querySelector('h3')).toBeInTheDocument();
  });
});
