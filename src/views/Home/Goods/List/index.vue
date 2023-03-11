<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索框 -->
      <el-input
        placeholder="请输入内容"
        style="width: 300px"
        v-model="queryInfo.query"
        clearable
        @clear="getGoodsList"
        class = "addBtn"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="getGoodsList"
        ></el-button>
      </el-input>
      <el-button type="primary" @click="goAddPage">添加商品</el-button>
      <!-- 内容主体区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格（元）"
          width="120px"
        >
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="95px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              class="el-icon-edit"
              @click="editById(scope.row.goods_id)"
            >
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="提示" :visible.sync="editVisible" width="50%">
        <el-form :model="editForm" label-width="100px" ref="editFormRef" :rules="editFormRules">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name" ></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight" type="number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit()"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "GoodsList",
  data() {
    return {
      //商品列表
      goodsList: [],
      //总数据条数
      total: 0,
      //查询参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      editVisible: false,
      editForm:{},
      editFormRules:{
       goods_name:[
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
       ],
       goods_price:[
        { required: true, message: '请输入商品价格', trigger: 'blur' },
       ],
       goods_number:[
        { required: true, message: '请输入商品数量', trigger: 'blur' },
       ],
       goods_weight:[
        { required: true, message: '请输入商品重量', trigger: 'blur' },
       ]
      }
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      (this.goodsList = res.data.goods), (this.total = res.data.total);
      console.log(res.data);
      this.$message.success("获取商品列表成功");
    },

    //监听每页据条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },

    async editById(id) {
      this.editVisible = true;
      const {data:res} =await this.$http.get(`goods/${id}`)
      if(res.meta.status !==200) return this.$message.error('获取商品信息失败')
      this.$message.success('获取商品信息成功')
      this.editForm = res.data

    },

    //提交修改商品信息
     submitEdit() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return this.$message.error('请输入有效的商品信息')
        const {data:res} =await this.$http.put(`goods/${this.editForm.goods_id}`,this.editForm)
        if(res.meta.status !==200) return this.$message.error('提交修改商品信息失败')
        this.$message.success('提交信息修改成功')
        this.getGoodsList()
        this.editVisible = false
      })
      
    },
    //删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.getGoodsList();
      this.$message.success("删除商品成功");
    },
    //添加商品
    goAddPage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style scoped lang="less">
.addBtn {
  margin: 10px 10px 10px 0;
}
</style>