import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';

// Mock组件以避免测试依赖问题
jest.mock('@/components/settings/GeneralSettingsForm', () => {
  return function MockGeneralSettingsForm() {
    return <div data-testid="general-settings-form">General Settings Form</div>;
  };
});

jest.mock('@/components/settings/ModelSettingsManager', () => {
  return function MockModelSettingsManager() {
    return <div data-testid="model-settings-manager">Model Settings Manager</div>;
  };
});

describe('SettingsPage', () => {
  it('renders the page title', () => {
    render(<SettingsPage />);
    expect(screen.getByText('系统设置')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<SettingsPage />);
    
    // 初始应该显示通用设置标签
    expect(screen.getByTestId('general-settings-form')).toBeInTheDocument();
    
    // 点击模型设置标签
    fireEvent.click(screen.getByText('模型设置'));
    
    // 应该显示模型设置管理器
    expect(screen.getByTestId('model-settings-manager')).toBeInTheDocument();
  });
}); 