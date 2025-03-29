// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // 指向Next.js应用的路径
  dir: './',
});

// Jest的自定义配置
const customJestConfig = {
  // 添加更多的设置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig处理所有的Next.js特定设置，导出合并的配置
module.exports = createJestConfig(customJestConfig); 