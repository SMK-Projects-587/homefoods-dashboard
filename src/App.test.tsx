import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Get started',
    );
  });

  it('increments the counter on click', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button', { name: /count is/i });
    expect(button).toHaveTextContent('Count is 0');

    await user.click(button);
    expect(button).toHaveTextContent('Count is 1');

    await user.click(button);
    expect(button).toHaveTextContent('Count is 2');
  });
});
