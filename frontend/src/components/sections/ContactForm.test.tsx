import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../services/apiClient';
import { ContactForm } from './ContactForm';

const EMAIL = 'nandhinilingaraj199@gmail.com';

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText('Name'), 'Priya Raman');
  await userEvent.type(screen.getByLabelText('Email'), 'priya@example.com');
  await userEvent.type(screen.getByLabelText('Message'), 'Hi Nandhini, I would like to talk about a role.');
}

describe('ContactForm', () => {
  it('shows every client-side error and focuses the first one without calling the API', async () => {
    const service = { send: jest.fn() };
    render(<ContactForm email={EMAIL} service={service} />);

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your message.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(service.send).not.toHaveBeenCalled();
  });

  it('clears an error as soon as the field becomes valid', async () => {
    render(<ContactForm email={EMAIL} service={{ send: jest.fn() }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await userEvent.type(screen.getByLabelText('Name'), 'Priya');

    expect(screen.queryByText('Enter your name.')).not.toBeInTheDocument();
  });

  it('shows a sending state, then success, and can reset', async () => {
    let resolve!: (value: { id: string; message: string }) => void;
    const service = { send: jest.fn(() => new Promise<{ id: string; message: string }>((r) => (resolve = r))) };
    render(<ContactForm email={EMAIL} service={service} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    expect(service.send).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Priya Raman', email: 'priya@example.com', website: '' }),
    );

    resolve({ id: '1', message: 'Thanks for reaching out. Your message has been sent.' });
    expect(await screen.findByText('Message sent')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send another message' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows server-side validation errors next to the fields', async () => {
    const service = {
      send: jest.fn().mockRejectedValue(new ApiError('validation', 'Some fields need attention.', 400, { email: 'Enter a valid email address, like name@example.com.' })),
    };
    render(<ContactForm email={EMAIL} service={service} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Enter a valid email address, like name@example.com.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('offers the direct email address when the API is unreachable', async () => {
    const service = { send: jest.fn().mockRejectedValue(new ApiError('network', 'Couldn’t reach the server.')) };
    render(<ContactForm email={EMAIL} service={service} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(EMAIL);
    // The typed message is kept so nothing is lost.
    expect(screen.getByLabelText('Message')).toHaveValue('Hi Nandhini, I would like to talk about a role.');
  });

  it('shows the rate-limit explanation from the server', async () => {
    const service = { send: jest.fn().mockRejectedValue(new ApiError('rateLimited', 'Wait a minute and try again.', 429)) };
    render(<ContactForm email={EMAIL} service={service} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wait a minute and try again.');
  });

  it('pre-fills and focuses the message when a project is asked about', async () => {
    const { rerender } = render(<ContactForm email={EMAIL} service={{ send: jest.fn() }} draft={null} />);

    rerender(<ContactForm email={EMAIL} service={{ send: jest.fn() }} draft={{ message: 'Tell me about Sentinel.', key: 1 }} />);

    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue('Tell me about Sentinel.'));
    expect(screen.getByLabelText('Message')).toHaveFocus();
  });
});
