import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@ant-design/compatible';
import { Table, Input, InputNumber, Button } from 'antd';

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入 ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    const { options } = this.props;
    this.state = {
      data: options, editingKey: '', count: options.length, columns: [
        {
          title: '显示值',
          dataIndex: 'label',
          width: '30%',
          editable: true,
        },
        {
          title: '传递值',
          dataIndex: 'value',
          width: '30%',
          editable: true,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render: (text, record) => {
            const { editingKey } = this.state;
            const editable = this.isEditing(record);
            return editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <a
                      onClick={() => this.save(form, record.key)}
                      style={{ marginRight: 15 }}
                    >
                      保存
                    </a>
                  )}
                </EditableContext.Consumer>
                <a onClick={() => this.cancel(record.key)}>取消</a>
              </span>
            ) : (
              <span>
                <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>编辑</a>
                <a style={{ marginLeft: 15, color: '#FF3333' }} onClick={() => this.delete(record.key)}>删除</a>
              </span>
            );
          },
        },
      ]
    };
  }

  componentDidUpdate({ curItemKey }) {
    if (curItemKey !== this.props.curItemKey) {
      this.setState({ data: this.props.options })
    }
  }

  isEditing = record => {
    return record.key == this.state.editingKey
  };

  cancel = () => {
    this.reset()
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    this.reset()
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }
      this.props.getDataSource(newData)
      this.setState({ data: newData, editingKey: '' });
    });
  }

  edit(key) {
    this.reset()
    this.setState({ editingKey: key});
  }
  reset(key){
    let columns = this.state.columns
    columns.pop()
    columns.push({
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => {
        const { editingKey } = this.state;
        const editable = this.isEditing(record);
        return editable ? (
          <span>
            <EditableContext.Consumer>
              {form => (
                <a
                  onClick={() => this.save(form, record.key)}
                  style={{ marginRight: 15 }}
                >
                  保存
                </a>
              )}
            </EditableContext.Consumer>
            <a onClick={() => this.cancel(record.key)}>取消</a>
          </span>
        ) : (
          <span>
            <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>编辑</a>
            <a style={{ marginLeft: 15, color: '#FF3333' }} onClick={() => this.delete(record.key)}>删除</a>
          </span>
        );
      },
    })
  }
  delete = key => {
    const data = [...this.state.data];
    this.props.getDataSource(data.filter(item => item.key !== key))
    this.setState({ data: data.filter(item => item.key !== key), editingKey: '' });
  };

  add = () => {
    const { count, data } = this.state;
    const newData = {
      key: count,
      label: `选项 ${count}`,
      value: count
    };
    this.props.getDataSource([...data, newData])
    this.setState({
      data: [...data, newData],
      count: count + 1,
    });
  };

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };
    const columns = this.state.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Button disabled={this.props.disabled} onClick={this.add} type="primary" style={{ marginBottom: 16 }}>添加选项</Button>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

EditableCell.propTypes = {
  editing: PropTypes.bool,
  dataIndex: PropTypes.string,
  title: PropTypes.string,
  inputType: PropTypes.string,
  record: PropTypes.object,
  index: PropTypes.string,
  children: PropTypes.array.isRequired,
  restProps: PropTypes.object,
}

EditableTable.propTypes = {
  form: PropTypes.object.isRequired,
  getDataSource: PropTypes.func.isRequired,
  curItemKey: PropTypes.string.isRequired,
  options: PropTypes.array,
  disabled: PropTypes.bool.isRequired
}

export default EditableFormTable