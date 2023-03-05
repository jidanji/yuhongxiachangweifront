import React, { Component } from 'react';
import { LoginStatus } from '@/serivces/login';
import { Alert, Space, Spin, Button, Result } from 'antd';

class Index extends Component {
  state = {
    loginStatus: 'logining',
    approval: false,
  };

  async componentDidMount() {
    try {
      let { UserName, UserAccount } = await LoginStatus();
      localStorage.setItem('UserName', UserName);
      localStorage.setItem('UserAccount', UserAccount);
      this.setState({ loginStatus: 'loginAndApproval' });
    } catch (err) {
      console.log(err);
      this.setState({
        loginStatus: 'nologin',
      });
    }
  }

  gotoLogin = () => {
    window.location.href = 'http://139.224.193.145:7744/admin/login';
  };

  render() {
    // @ts-ignore
    const { loginStatus } = this.state;

    const dict = {
      nologin: (
        <div
          style={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 400 }}>
            <Result
              status="error"
              title="您没有登录"
              subTitle="请检查您的登录的状态"
              extra={[
                <div>
                  <Button block color="primary" onClick={this.gotoLogin}>
                    去登录
                  </Button>
                </div>,
              ]}
            />
          </div>
        </div>
      ),
      loginAndApproval: this.props.children,
      logining: <Spin tip="数据加载中......" size="small"></Spin>,
    };
    return <>{dict[loginStatus]}</>;
  }
}

export default Index;
