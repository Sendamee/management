<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 查询按钮 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="90px">
        </el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="90px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="90px">
        </el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              class="el-icon-edit"
              size="small"
              @click="showEditForm(scope.row)"
            ></el-button>
            <el-button
              type="success"
              class="el-icon-location-outline"
              size="small"
              @click="showProgressForm(scope.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editFormVisible"
      width="50%"
      @close="editFormClosed"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="editForm.address"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="editForm.detail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressFormVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressForm = false">取 消</el-button>
        <el-button type="primary" @click="progressForm = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";
export default {
  name: "OrderPage",
  data() {
    return {
      //查询对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      //订单列表
      orderList: [],
      //修改地址对话框展示与否
      editFormVisible: false,
      //修改表单的数据对象
      editForm: {
        address: [],
        detail: "",
      },
      // 修改表单的数据规则对象
      editRules: {
        address: [{ required: true, message: "请选择省市区", trigger: "blur" }],
        detail: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      //城市数据
      cityData: cityData,
      progressFormVisible: false,
      //物流信息
      progressInfo: [
        {
          time: "2018-05-10 09:39:00",
          ftime: "2018-05-10 09:39:00",
          context: "已签收,感谢使用顺丰,期待再次为您服务",
          location: "",
        },
        {
          time: "2018-05-10 08:23:00",
          ftime: "2018-05-10 08:23:00",
          context:
            "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          location: "",
        },
        {
          time: "2018-05-10 07:32:00",
          ftime: "2018-05-10 07:32:00",
          context: "快件到达 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-10 02:03:00",
          ftime: "2018-05-10 02:03:00",
          context:
            "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-09 23:05:00",
          ftime: "2018-05-09 23:05:00",
          context: "快件到达 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 21:21:00",
          ftime: "2018-05-09 21:21:00",
          context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 13:07:00",
          ftime: "2018-05-09 13:07:00",
          context: "顺丰速运 已收取快件",
          location: "",
        },
        {
          time: "2018-05-09 12:25:03",
          ftime: "2018-05-09 12:25:03",
          context: "卖家发货",
          location: "",
        },
        {
          time: "2018-05-09 12:22:24",
          ftime: "2018-05-09 12:22:24",
          context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          location: "",
        },
        {
          time: "2018-05-08 21:36:04",
          ftime: "2018-05-08 21:36:04",
          context: "商品已经下单",
          location: "",
        },
      ],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    //获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // 监听页面数据条数改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 监听页面页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    //展示修改订单地址对话框
    showEditForm() {
      this.editFormVisible = true;
    },
    //监听修改地址对话关闭事件,清空表单
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 展示物流进度表单
    async showProgressForm() {
      this.progressFormVisible = true;
      //   const {data:res} = await this.$http.get(`/kuaidi/1106975712662}`)
      //   if(res.meta.status !==200) return this.$message.error(res.meta.msg)
      //   this.$message.success(res.meta.msg)
      //   this.progressInfo = res.data
      //   console.log(res)
    },
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>