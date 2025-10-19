import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import WithProviders from '@/web/app/providers';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <WithProviders>{children}</WithProviders>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// @testing-library/react의 모든 것을 다시 내보내기
export * from '@testing-library/react';

// render 메소드만 오버라이드
export { customRender as render };
