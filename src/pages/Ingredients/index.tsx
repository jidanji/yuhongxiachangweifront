import React, { Component } from 'react';
import {
  AutoComplete,
  Input,
  Table,
  Tag,
  Space,
  Button,
  Breadcrumb,
  Pagination,
  Form,
  Modal,
  Select,
  Upload,
  message,
  Popconfirm,
  Spin,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import type { PaginationProps } from 'antd';

import './index.less';

import type { SelectProps, RadioChangeEvent } from 'antd';

const { Dragger } = Upload;

import excel from '@/assets/excel.png';

import { produce, enableES5 } from 'immer';
enableES5();
const options: SelectProps['options'] = [];
for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  });
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}
import {
  HomeOutlined,
  LoadingOutlined,
  SettingFilled,
  SmileOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import type { UploadProps } from 'antd';

import { apiBaseUrl as BaseUrl } from '@/utils/domain';

import nprogress from 'nprogress';
import 'nprogress/nprogress.css'; // 这个nprogress样式必须引入

import ValidStatus from '@/components/ValidStatus';

const showTotal: PaginationProps['showTotal'] = (total) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      marginRight: 15,
      justifyContent: 'center',
    }}
  >
    <div>共</div>
    <div
      style={{
        fontSize: 24,
        padding: '0 12px',
        color: '#108ee9',
        fontStyle: 'italic',
      }}
    >
      {total}
    </div>

    <div>条数据</div>
  </div>
);

import { Search, Add, Delete, Update } from '@/serivces/Ingredients';

import type { FormInstance } from 'antd/es/form';

import moment from 'moment';

const { TextArea } = Input;

export class Output extends Component {
  formRef = React.createRef<FormInstance>();
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {
        current: 1,
        defaultCurrent: 1,
        PageSize: 10,
        total: 0,
        IngredientCNName: '',
        IngredientShortName: '',
      },
      dataList: [],
      isModalOpen: false,
      isUploadModalOpen: false,
      FailCount: 0,
      FailData: [],
      SuccessCount: 0,
      SuccessData: [],
      isSumaryModalOpen: false,
      loading: false,
      optype: 'add',
      editData: {},
      exeloading: false,
      uploadloading: false,
      y: 200,
    };
  }

  props1 = {
    name: 'file',
    multiple: true,
    action: `${BaseUrl}/management/Ingredient/UpLoadExcel`,
    onChange: (info) => {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status == 'uploading') {
        this.setState({ uploadloading: true });
      }
      if (status === 'done') {
        const {
          Data,
          remark,
          status,
          suc,
          FailCount,
          FailData,
          SuccessCount,
          SuccessData,
        } = info.file.response;
        if (suc) {
          message.info(`${info.file.name} 文件处理完毕`);
          this.setState({
            FailCount,
            FailData,
            SuccessCount,
            SuccessData,
            isSumaryModalOpen: true,
          });
        } else {
          message.error(`${info.file.name} 文件上传失败，原因:${remark}`);
        }

        this.setState({ uploadloading: false });
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        this.setState({ uploadloading: true });
      }
    },
    onDrop: (e) => {
      console.log('Dropped files', e.dataTransfer.files);
    },

    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === 'application/vnd.ms-excel' ||
        file.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isJpgOrPng) {
        message.error('请上传Excel文件');
      }
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isLt2M) {
        message.error('文件大小必须小于10MB!');
      }
      return isJpgOrPng && isLt2M;
    },
  };

  async componentDidMount(): void {
    await this.serchData();

    var y = document.getElementById('tableContainer').offsetHeight - 40;
    this.setState({ y });
  }

  newDrug = () => {
    this.setState({ isModalOpen: true });
  };

  newUpLoad = () => {
    this.setState({ isUploadModalOpen: true });
  };

  onFinish = ({ IngredientCNName, IngredientShortName }) => {
    this.setState(
      produce((draft) => {
        draft.searchForm.IngredientCNName = IngredientCNName;
        draft.searchForm.IngredientShortName = IngredientShortName;
        draft.searchForm.current = 1;
      }),
      () => {
        this.serchData();
      },
    );
  };

  serchData = async () => {
    try {
      const {
        searchForm: {
          current = 1,
          defaultCurrent = 1,
          PageSize = 10,
          IngredientCNName = '',
          IngredientShortName = '',
        },
      } = this.state;
      this.setState({ loading: true });
      const data = await Search({
        data: {
          IngredientCNName,
          IngredientShortName,
          PageIndex: current,
          PageSize,
        },
      });
      const { rows, suc, total } = data;
      this.setState(
        produce((draft) => {
          draft.dataList = rows;
          draft.searchForm.total = total;
          draft.loading = false;
        }),
      );
    } catch (ex) {
      this.setState({ loading: false });
      message.error(ex.toString());
    }
  };

  onPageChange = (data) => {
    this.setState(
      produce((draft) => {
        draft.searchForm.current = data;
      }),
      () => {
        this.serchData();
      },
    );
  };

  submit = async (input) => {
    try {
      this.setState({ exeloading: true });
      const { editData, optype } = this.state;
      if (optype == 'add') {
        const data = { ...input };
        const d1 = await Add({ data });
        const { Data, suc, total } = d1;
        message.success('录入成功');
        this.setState(
          produce((draft) => {
            draft.isModalOpen = false;
            draft.searchForm.current = 1;
          }),
          () => {
            this.serchData();
            this.formRef.current!.resetFields();
          },
        );
      } else if (optype == 'edit') {
        const data = { ...editData, ...input };
        const d1 = await Update({ data });
        const { Data, suc, total } = d1;
        message.success('更新成功');
        this.setState({ isModalOpen: false }, () => {
          this.serchData();
          this.formRef.current!.resetFields();
        });
      }
    } catch (ex) {
      message.error(ex.toString());
    } finally {
      this.setState({ exeloading: false });
    }
  };

  onConfirm = async (id, b, c) => {
    try {
      await Delete({ data: { id } });
      message.success('删除成功');
      await this.serchData();
    } catch (ex) {
      message.error(ex.toString());
    }
  };

  beginEdit = (a, editData, c) => {
    this.setState(
      {
        optype: 'edit',
        editData,
        isModalOpen: true,
      },
      () => {
        this.formRef.current!.setFieldsValue(editData);
      },
    );
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (prevState.loading) {
      nprogress.start();
    } else {
      nprogress.done();
    }
    return null;
  };

  render() {
    const {
      FailCount,
      FailData,
      SuccessCount,
      SuccessData,
      isSumaryModalOpen,
      isUploadModalOpen,
      isModalOpen,
      searchForm: { current = 1, defaultCurrent = 1, PageSize = 10, total = 0 },
      dataList = [],
      loading = false,
      exeloading = false,
      uploadloading = false,
      optype,
    } = this.state;
    const columns: ColumnsType<DataType> = [
      {
        title: '序号',
        dataIndex: 'name',
        key: 'name',
        render: (a, b, c) => <div>{(current - 1) * PageSize + c + 1}</div>,
        width: 50,
        fixed: 'left',
      },
      {
        title: '辅料中文名',
        dataIndex: 'IngredientCNName',
        key: 'IngredientCNName',
        width: 230,
        fixed: 'left',
      },
      {
        title: '辅料简称',
        dataIndex: 'IngredientShortName',
        key: 'IngredientShortName',
        width: 120,
        fixed: 'left',
      },
      {
        title: '辅料别名',
        dataIndex: 'IngredientAlias',
        key: 'IngredientAlias',
        width: 120,
      },

      {
        title: 'CP名称',
        dataIndex: 'CPName',
        key: 'CPName',
        width: 300,
      },
      {
        title: 'USP-NF名称',
        dataIndex: 'USPName',
        key: 'USPName',
        width: 300,
      },
      {
        title: 'EP名称',
        dataIndex: 'EPName',
        key: 'EPName',
        width: 300,
      },
      {
        title: 'JP/JPE名称',
        dataIndex: 'JPName',
        key: 'JPName',
        width: 300,
      },
      // {
      //   title: '最近更新时间',
      //   dataIndex: 'LastUpdateTime',
      //   key: 'LastUpdateTime',
      //   render: (a, b, c) => <div>{moment(a).format('YYYY-MM-DD HH:mm:ss')}</div>,
      //   width: 160,
      //   fixed: 'left',
      // },
      {
        fixed: 'right',
        title: '操作',
        dataIndex: 'IngredientID',
        key: 'IngredientID',
        render: (a, b, c) => (
          <div>
            <Button
              type="link"
              size="small"
              onClick={() => {
                this.beginEdit(a, b, c);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="您确定要删除这条记录吗？"
              okText="是"
              cancelText="否"
              onConfirm={() => {
                this.onConfirm(a, b, c);
              }}
            >
              <Button type="text" danger size="small">
                删除
              </Button>
            </Popconfirm>
          </div>
        ),
        width: 110,
        fixed: 'right',
      },
    ];
    return (
      <div className="Drugs">
        <Modal
          keyboard={false}
          maskClosable={false}
          footer={null}
          title={(optype == 'edit' ? '编辑' : '新建') + '辅料'}
          open={isModalOpen}
          width={580}
          onCancel={() => {
            this.setState({ isModalOpen: false, optype: 'add' }, () => {
              this.formRef.current!.resetFields();
            });
          }}
        >
          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.submit}
          >
            <Form.Item
              label="辅料中文名称"
              name="IngredientCNName"
              rules={[{ required: true, message: '辅料中文名称必填' }]}
            >
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入辅料中文名称"
              />
            </Form.Item>
            <Form.Item label="辅料简称" name="IngredientShortName">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入辅料简称"
              />
            </Form.Item>

            <Form.Item label="辅料别名" name="IngredientAlias">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入辅料别名"
              />
            </Form.Item>

            <Form.Item label="CP名称" name="CPName">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入CP名称"
              />
            </Form.Item>

            <Form.Item label="USP-NF名称" name="USPName">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入USP-NF名称"
              />
            </Form.Item>

            <Form.Item label="EP名称" name="EPName">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入EP名称"
              />
            </Form.Item>

            <Form.Item label="JP/JPE名称" name="JPName">
              <TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                showCount
                maxLength={200}
                placeholder="请输入JP/JPE名称"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={exeloading}>
                提交
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          keyboard={false}
          maskClosable={false}
          footer={null}
          title="辅料批量导入"
          open={isUploadModalOpen}
          onCancel={() => {
            this.setState({ isUploadModalOpen: false });
          }}
        >
          <Spin spinning={uploadloading} delay={500}>
            <Dragger {...this.props1}>
              <p className="ant-upload-drag-icon">
                <img src={excel} alt="" className="uploadicon" />
              </p>
              <p className="ant-upload-text">
                点击或拖拽 Excel文件到这个区域上传
              </p>
            </Dragger>

            <Button
              type="link"
              onClick={() => {
                window.open(
                  'http://139.224.193.145:7744/Upload/导入数据-辅料名称.xlsx?id=10000',
                );
              }}
            >
              下载模板
            </Button>
          </Spin>
        </Modal>

        <Modal
          title="上传结果展示"
          open={isSumaryModalOpen}
          footer={[
            <Button
              key="back"
              type="primary"
              onClick={() => {
                this.setState(
                  produce((draft) => {
                    draft.isSumaryModalOpen = false;
                    draft.isUploadModalOpen = false;
                    draft.searchForm.current = 1;
                  }),
                  () => {
                    this.serchData();
                  },
                );
              }}
            >
              我知道了
            </Button>,
          ]}
          onCancel={() => {
            () => {
              this.setState({
                isSumaryModalOpen: false,
                isUploadModalOpen: false,
              });
            };
          }}
        >
          <div className="summryShow">
            <div className="leftBox">
              <div className="title">导入成功数量</div>
              <div className="Success">{SuccessCount}</div>

              <div className="title">导入失败数量</div>
              <div className="fail">{FailCount}</div>
            </div>
            <div className="rightBox">
              <div>
                <div className="title">导入失败的数据列表</div>
                <div className="failContent">
                  {FailData.map((item, index) => (
                    <div className="failItem">
                      {index + 1}、{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <div>
          <div style={{ marginBottom: 10 }}>
            <Breadcrumb>
              <Breadcrumb.Item>系统维护</Breadcrumb.Item>

              <Breadcrumb.Item>辅料信息维护</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        <div className="serchForm">
          <div>
            <Form layout="inline" onFinish={this.onFinish}>
              <Form.Item label="辅料中文名" name="IngredientCNName">
                <Input placeholder="请输入辅料中文名" allowClear={true} />
              </Form.Item>
              <Form.Item label="辅料简称" name="IngredientShortName">
                <Input placeholder="请输入辅料简称" allowClear={true} />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  查询
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="tool">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={this.newDrug}
              >
                新建辅料
              </Button>
              <Button type="primary" onClick={this.newUpLoad}>
                数据导入
              </Button>
            </Space>
          </div>
        </div>

        <div className="tableContainer" id="tableContainer">
          <Table
            size="small"
            scroll={{ y: this.state.y }}
            bordered
            loading={{ size: 'large', spinning: loading, tip: 'Loading' }}
            columns={columns}
            dataSource={dataList}
            pagination={false}
          />
        </div>

        <div className="pagerContainer">
          <Pagination
            disabled={loading}
            onChange={this.onPageChange}
            defaultCurrent={defaultCurrent}
            current={current}
            total={total}
            showTotal={showTotal}
            pageSize={PageSize}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  }
}

export default class index extends Component {
  render() {
    return (
      <ValidStatus>
        <Output />
      </ValidStatus>
    );
  }
}
