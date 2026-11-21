import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../api/endpoints', () => ({
  authApi: {
    passwordResetRequest: vi.fn().mockResolvedValue({}),
    passwordResetConfirm: vi.fn().mockResolvedValue({}),
  },
}));

import { authApi } from '../../api/endpoints';
import ForgotPassword from './ForgotPassword';

it('asks for the phone, then the code and new password', async () => {
  render(<MemoryRouter><ForgotPassword /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Telefon raqam'), { target: { value: '+998901234567' } });
  fireEvent.click(screen.getByRole('button', { name: 'Kod yuborish' }));
  await waitFor(() => expect(authApi.passwordResetRequest).toHaveBeenCalledWith('+998901234567'));

  fireEvent.change(await screen.findByLabelText("Telegram'dagi kod"), { target: { value: '123456' } });
  fireEvent.change(screen.getByLabelText(/Yangi parol/), { target: { value: 'NewPass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Parolni yangilash' }));
  await waitFor(() =>
    expect(authApi.passwordResetConfirm).toHaveBeenCalledWith({
      phone: '+998901234567', code: '123456', new_password: 'NewPass123',
    })
  );
});
