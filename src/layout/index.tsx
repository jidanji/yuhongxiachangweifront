import React, { Component } from 'react';
import './index.less';

import { Layout, Space, Menu, Avatar } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
import Logo from '@/assets/logo.png';

import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { ConfigProvider } from 'antd';

import { WaterMark } from '@ant-design/pro-components';

import { history } from 'umi';

import 'antd/dist/antd.css';

const items: MenuProps['items'] = [
  {
    label: '信息检索',
    key: 'index',
    icon: <HomeOutlined />,
  },

  {
    label: '药品信息维护',
    key: 'Drugs',
    icon: <SettingOutlined />,
  },

  {
    label: '辅料信息维护',
    key: 'Ingredients',
    icon: <SettingOutlined />,
  },
];

import zhCN from 'antd/es/locale/zh_CN';

export default class index extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { mode: 'full' };
  }
  componentDidMount(): void {
    const itme = history.location.query;
    const { mode } = itme;
    if (!!mode) {
      this.setState({ mode });
    }
  }
  render() {
    const { mode } = this.state;

    return (
      <ConfigProvider locale={zhCN}>
        {mode === 'full' && (
          <div className="main">
            <Layout className="Layout">
              <Header className="Header">
                <div className="brandName">药品辅料关系数据分析系统</div>

                <div className="toolBar">
                  <div className="MenuContainer">
                    <Menu
                      style={{ lineHeight: '35px' }}
                      onClick={this.nav}
                      mode="horizontal"
                      items={items}
                    />
                  </div>
                  <div className="welcomeContainer">
                    <Avatar
                      style={{ marginRight: '5px' }}
                      icon={<UserOutlined />}
                    />
                    欢迎，于红霞
                  </div>
                </div>
              </Header>
              <Content className="Content">{this.props?.children}</Content>
            </Layout>
          </div>
        )}
        {mode === 'single' && (
          <div style={{ height: '100vh' }}>{this.props?.children}</div>
        )}
      </ConfigProvider>
    );
  }

  nav = ({ key }) => {
    history.push({
      pathname: `/${key}`,
      query: {},
    });
  };
}
