import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@stores/uiStore';
import { ROUTES } from '@utils/constants';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const menuItems: MenuProps['items'] = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: ROUTES.SET_TEST,
      icon: <FormOutlined />,
      label: 'Set Test Formats',
    },
    {
      key: ROUTES.ADMIN_PREDEFINED_TESTS,
      icon: <FileTextOutlined />,
      label: 'Predefined Tests',
    },
    {
      key: ROUTES.ADMIN_USERS,
      icon: <TeamOutlined />,
      label: 'Users',
    },
    {
      key: ROUTES.ADMIN_SETTINGS,
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={setSidebarCollapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: sidebarCollapsed ? 16 : 20,
          fontWeight: 600,
        }}
      >
        {sidebarCollapsed ? 'A' : 'App'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};
