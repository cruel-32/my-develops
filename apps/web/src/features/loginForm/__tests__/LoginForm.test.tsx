import React from 'react';
import { render, screen } from '@/web/shared/lib/test-utils';
import { LoginForm } from '../ui';

// next/navigation 모의(mock) 처리
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
}));

describe('LoginForm Component', () => {
  it('should render email and password inputs, and a login button', () => {
    render(<LoginForm />);

    // 이메일 입력 필드가 있는지 확인
    const emailInput = screen.getByPlaceholderText(
      'super_admin@mydevelops.com'
    );
    expect(emailInput).toBeInstanceOf(HTMLInputElement);

    // 비밀번호 입력 필드가 있는지 확인
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toBeInstanceOf(HTMLInputElement);

    // 로그인 버튼이 있는지 확인
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInstanceOf(HTMLButtonElement);

    // 회원가입 버튼이 있는지 확인
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    expect(signUpButton).toBeInstanceOf(HTMLButtonElement);
  });
});
