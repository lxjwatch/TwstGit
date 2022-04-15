/*
 * @Author: your name
 * @Date: 2022-04-02 11:06:09
 * @LastEditTime: 2022-04-14 21:01:54
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \bl-device-manage-test\src\routes\BasicRouter\configs.js
 */
import LoadingComponent from 'Components/ComponentLoading';
import Loadable from 'react-loadable';

// 定义
const EditTable = Loadable({
  loader: () => import('layouts/TableEdit'),
  loading: LoadingComponent
});

const FlowTable = Loadable({
    loader: () => import('layouts/FlowManage'),
    loading: LoadingComponent
  });

export {
    EditTable,FlowTable
};