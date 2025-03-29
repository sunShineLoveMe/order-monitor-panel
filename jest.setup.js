// 为所有测试添加Jest-DOM扩展
import '@testing-library/jest-dom';

// Mock Next.js的useRouter
jest.mock('next/navigation', () => ({
  usePathname: () => '',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// 必要时可以在这里添加更多的全局设置 