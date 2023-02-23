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
  Spin,
  message,
  Popconfirm,
  Upload,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import type { PaginationProps } from 'antd';

import './index.less';

import type { SelectProps, RadioChangeEvent } from 'antd';

import { Search } from '@/serivces/Ingredients';

import { Search as SearchData, Update, Delete } from '@/serivces/Drugs';

import { Add } from '@/serivces/Drugs';

import { produce, enableES5 } from 'immer';

import { apiBaseUrl as BaseUrl } from '@/utils/domain';
const { Dragger } = Upload;
enableES5();
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

import type { FormInstance } from 'antd/es/form';

import excel from '@/assets/excel.png';

import nprogress from 'nprogress';
import 'nprogress/nprogress.css'; // 这个nprogress样式必须引入

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

export default class index extends Component {
  formRef = React.createRef<FormInstance>();
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {
        current: 1,
        defaultCurrent: 1,
        pageSize: 20,
        total: 50,
      },
      dataList: [],
      isModalOpen: false,
      initLoading: false,
      initData: [],
      optype: 'add',
      editData: {},
      exeloading: false,
      isUploadModalOpen: false,
      uploadloading: false,
      FailCount: 0,
      FailData: [],
      SuccessCount: 0,
      SuccessData: [],
      isSumaryModalOpen: false,
      y: 200,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (prevState.loading) {
      nprogress.start();
    } else {
      nprogress.done();
    }
    return null;
  };
  initData = async () => {
    try {
      let sth = await Search({ data: { PageIndex: -1, PageSize: -1 } });
      const { remark, rows, status, suc, total } = sth;
      let initData = rows.map((item) => {
        return {
          value: item.IngredientID,
          label: item.IngredientCNName,
        };
      });
      this.setState({ initData });
    } catch (ex) {
      message.error(ex.toString());
    }
  };

  props1 = {
    name: 'file',
    multiple: true,
    action: `${BaseUrl}/management/Drug/UpLoadExcel`,
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

  componentDidMount(): void {
    this.initData();
    this.serchData();
    var y = document.getElementById('tableContainer').offsetHeight - 40;
    this.setState({ y });
  }

  newDrug = () => {
    this.setState({ isModalOpen: true });
  };
  submit = async (values) => {
    try {
      this.setState({ exeloading: true });
      const { editData, optype } = this.state;
      if (optype == 'add') {
        await Add({ data: { ...values } });
        this.setState({ isModalOpen: false });
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
        const data = { ...editData, ...values };
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

  serchData = async () => {
    try {
      const {
        searchForm: {
          current = 1,
          defaultCurrent = 1,
          PageSize = 10,
          DrugEnglishName,
          DrugCommodityName,
          DrugCommonName,
          IngredientCNName,
        },
      } = this.state;
      this.setState({ loading: true });
      const data = await SearchData({
        data: {
          DrugEnglishName,
          DrugCommodityName,
          DrugCommonName,
          IngredientCNName,
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

  onFinish = ({
    DrugEnglishName,
    DrugCommodityName,
    DrugCommonName,
    IngredientCNName,
  }) => {
    this.setState(
      produce((draft) => {
        draft.searchForm.DrugEnglishName = DrugEnglishName;
        draft.searchForm.DrugCommodityName = DrugCommodityName;
        draft.searchForm.DrugCommonName = DrugCommonName;
        draft.searchForm.IngredientCNName = IngredientCNName;
        draft.searchForm.current = 1;
      }),
      () => {
        this.serchData();
      },
    );
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

  onConfirm = async (id, b, c) => {
    try {
      await Delete({ data: { id } });
      message.success('删除成功');
      await this.serchData();
    } catch (ex) {
      message.error(ex.toString());
    }
  };

  newUpLoad = () => {
    this.setState({ isUploadModalOpen: true });
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

  render() {
    const {
      FailCount,
      FailData,
      SuccessCount,
      SuccessData,
      isSumaryModalOpen,
      optype,
      loading,
      isModalOpen,
      searchForm: {
        current = 1,
        defaultCurrent = 1,
        pageSize = 10,
        total = 50,
      },
      dataList = [],
      initLoading,
      initData,
      exeloading = false,
      isUploadModalOpen = false,
      uploadloading = false,
    } = this.state;
    const columns: ColumnsType<DataType> = [
      {
        title: '序号',
        dataIndex: 'name',
        key: 'name',
        render: (a, b, c) => <div>{(current - 1) * pageSize + c + 1}</div>,
        width: 60,
        fixed: 'left',
      },
      {
        title: '药品通用名称',
        dataIndex: 'DrugCommonName',
        key: 'DrugCommonName',
        width: 200,
        fixed: 'left',
      },

      {
        title: '药品英文名称',
        dataIndex: 'DrugEnglishName',
        key: 'DrugEnglishName',
        width: 280,
        fixed: 'left',
      },

      {
        title: '药品商品名',
        dataIndex: 'DrugCommodityName',
        key: 'DrugCommodityName',
        width: 200,
      },

      {
        title: '药品规格',
        dataIndex: 'DrugSpecification',
        key: 'DrugSpecification',
        width: 400,
      },

      {
        title: '药品持证商',
        dataIndex: 'DrugMerchant',
        key: 'DrugMerchant',
        width: 200,
      },

      {
        title: '药品备注1',
        dataIndex: 'DrugRemark1',
        key: 'DrugRemark1',
        width: 200,
      },

      {
        title: '药品备注2',
        dataIndex: 'DrugRemark2',
        key: 'DrugRemark2',
        width: 200,
      },

      {
        title: '组成辅料',
        dataIndex: 'IngredientCNName',
        key: 'IngredientCNName',
        width: 450,
        fixed: 'right',
        render: (_, { DrugIngredients }) => (
          <>
            {DrugIngredients.map((item) => {
              let a = false;
              if (this.state.searchForm.IngredientCNName) {
                a = item.IngredientCNName.toUpperCase().includes(
                  this.state.searchForm.IngredientCNName.toUpperCase(),
                );
              } else {
                a = false;
              }
              let color = a ? '#87d068' : 'geekblue';

              return (
                <Tag color={color} key={item.IngredientID}>
                  {item.IngredientCNName.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
      },
    ];
    return (
      <Spin spinning={initLoading} wrapperClassName="spin">
        <div className="Drugs">
          <Modal
            keyboard={false}
            maskClosable={false}
            footer={null}
            title={(optype == 'edit' ? '编辑' : '新建') + '药品'}
            open={isModalOpen}
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
                label="药品通用名称"
                name="DrugCommonName"
                rules={[{ required: true, message: '药品通用名称必填' }]}
              >
                <Input placeholder="请输入药品通用名称" />
              </Form.Item>
              <Form.Item label="药品英文名称" name="DrugEnglishName">
                <Input placeholder="请输入药品英文名称" />
              </Form.Item>

              <Form.Item label="药品商品名" name="DrugCommodityName">
                <Input placeholder="请输入药品商品名" />
              </Form.Item>
              <Form.Item label="药品规格" name="DrugSpecification">
                <Input placeholder="请输入药品规格" />
              </Form.Item>

              <Form.Item label="药品持证商" name="DrugMerchant">
                <Input placeholder="请输入药品持证商" />
              </Form.Item>

              <Form.Item label="药品备注1" name="DrugRemark1">
                <Input placeholder="请输入药品备注1" />
              </Form.Item>

              <Form.Item label="药品备注2" name="DrugRemark2">
                <Input placeholder="请输入药品备注2" />
              </Form.Item>

              <Form.Item label="组成辅料" name="DrugIngredientIds">
                <Select
                  mode="multiple"
                  placeholder="请选择组成辅料"
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    console.log((option?.label ?? '').includes(input));
                    return (option?.label ?? '').includes(input);
                  }}
                  options={initData}
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
            title="药品批量导入"
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
                <Breadcrumb.Item>用户界面</Breadcrumb.Item>
                <Breadcrumb.Item>药品信息检索</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
          <div className="serchForm">
            <div>
              <Form layout="inline" onFinish={this.onFinish}>
                <Form.Item label="药品通用名称" name="DrugCommonName">
                  <Input
                    placeholder="请输入药品通用名称"
                    allowClear={true}
                    style={{ width: 170 }}
                  />
                </Form.Item>
                <Form.Item label="药品英文名称" name="DrugEnglishName">
                  <Input
                    placeholder="请输入药品英文名称"
                    allowClear={true}
                    style={{ width: 170 }}
                  />
                </Form.Item>
                <Form.Item label="药品商品名" name="DrugCommodityName">
                  <Input
                    placeholder="请输入药品商品名"
                    allowClear={true}
                    style={{ width: 170 }}
                  />
                </Form.Item>

                <Form.Item label="组成辅料" name="IngredientCNName">
                  <Input
                    placeholder="请输入组成辅料名称"
                    allowClear={true}
                    style={{ width: 170 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    查询
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>

          <div className="tableContainer" id="tableContainer">
            <Table
              scroll={{ y: this.state.y }}
              columns={columns}
              size="small"
              bordered
              loading={{ size: 'large', spinning: loading, tip: 'Loading' }}
              dataSource={dataList}
              disabled={loading}
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
              pageSize={pageSize}
              showSizeChanger={false}
            />
          </div>
        </div>
      </Spin>
    );
  }
}
