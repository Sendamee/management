<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加分类按钮 -->
      <el-button type="primary" @click="addCateDialog">添加分类</el-button>
      <!-- 主题区-->
      <tree-table
        :data="categoriseList"
        :columns="columns"
        :selection-type="false"
        show-index
        :expand-type="false"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="range" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success"
            >二级</el-tag
          >
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="set" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="editDialog(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- </el-table> -->

      <!-- 分页区-->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateDialogForm"
        :rules="addCateRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateDialogForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button @click="addCateDialogVisible = false">取消</el-button>
          <el-button @click="submitAddCate" type="primary">确认</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑" 
    :visible.sync="editDialogVisible" 
    width="50%"
    @close="editDialogClosed"
    >
     
        <el-form
        :model="editDialogForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
      > 
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editDialogForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button @click="submitEdit()" type="primary">确认</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodsCategorise",
  data() {
    return {
      //商品分类列表
      categoriseList: [],
      //查询条件
      queryInfo: {
        type: 3,
        pagesize: 5,
        pagenum: 1,
      },
      // 总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示将当前列定义为模版列
          type: "template",
          //表示当前这一列使用模板的名称
          template: "isok",
        },
        {
          label: "排序",
          //表示将当前列定义为模版列
          type: "template",
          //表示当前这一列使用模板的名称
          template: "range",
        },
        {
          label: "操作",
          type: "template",
          template: "set",
        },
      ],
      //编辑对话框是否展示
      editDialogVisible: false,
      //获取编辑对话框对象
      editDialogForm: {},
      //编辑规则
      editRules: {
        name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
      //添加分类对话框是否展示
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateDialogForm: {
        //将要添加分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        //添加的等级默认是一级分类
        cat_level: 0,
      },
      //添加类别规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
      //父级分类选中项的id
      selectedKeys:[],
      //父级分类列表
      parentCateList: [],
      // 父级分类配置项
      cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children:'children',
          expandTrigger:'hover',
          checkStrictly:true,
        },
      //分类信息对象
      categoriseObj:''

    };
  },
  created() {
    this.getCategoriseList();
  },
  methods: {
    //获取商品分类列表
    async getCategoriseList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取分类列表失败");
      //把数据列表，赋值给catelist
      this.categoriseList = res.data.result;
      //为总条数赋值
      this.total = res.data.total;
    },
    //监听当前页面
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCategoriseList();
    },
    
    //展示添加分类对话框
    addCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList();
      //在展示对话框
      this.addCateDialogVisible = true;
    },
    //获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      });
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类失败');
      this.parentCateList = res.data;
      console.log(res)
    },
    // 选择项发生改变出发此函数
    parentCateChanged() {
     if(this.selectedKeys.length > 0){
      //父级分类的id
      this.addCateDialogForm.cat_pid = this.selectedKeys[
        this.selectedKeys.length - 1
      ]
      //父级分类的级别
      this.addCateDialogForm.cat_level= this.selectedKeys.length
      return 
     } else {
        this.addCateDialogForm.cat_pid = 0,
        this.addCateDialogForm.cat_level = 0
     }
    
    },
    //监听添加分类对话框关闭事件，重置表单数据
    addCateDialogClosed(){
       this.$refs.addCateFormRef.resetFields()
       //将选中的数组清空
       this.selectedKeys =[]
       this.addCateDialogForm.cat_level = 0
       this.addCateDialogForm.cat_pid = 0
    },
    //提交分类类别
    submitAddCate() {
      //表单预验证
      this.$refs.addCateFormRef.validate(async (valid) => {
         console.log(this.addCateDialogForm)
        if (!valid) return;
        const { data: res } = await this.$http.post('categories', this.addCateDialogForm);
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error('添加分类失败');
        this.addCateDialogVisible = false;
         this.getCategoriseList();
      });
    },
    //展示编辑对话框
    editDialog(cate) {
      console.log(cate)
      this.editDialogVisible = true;
      
      this.editDialogForm = cate
      this.getCategoriseById(cate.cat_id)
    },

    //查询分类信息对象
    async getCategoriseById(id) {
    const {data:res} =await this.$http.get('categories/'+id)
    console.log(res.meta.status)
    },
    //监听编辑对话框关闭事件,重置编辑对话框
    editDialogClosed(){
      this.editDialogForm=''
      this.editDialogVisible = false
    },
       //提交编辑分类
    submitEdit() {
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('验证不通过')
        const {data:res} = await this.$http.put(`categories/${this.editDialogForm.cat_id}`,{
        cat_name:this.editDialogForm.cat_name})
        if(res.meta.status !== 200) return this.$message.error('修改失败')
        this.editDialogVisible = false
        this.getCategoriseList()       
      })
    },
    //删除分类
    async deleteCate(cate){
     const confirmResult =await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).catch((err) => err)
        if(confirmResult !=='confirm') return this.$message.info('取消删除')
     const {data:res} = await this.$http.delete(`categories/${cate.cat_id}`)
     console.log(res)
     if(res.meta.status !==200) this.$message.error('删除分类失败')
     this.$message.success('删除分类成功')
     this.getCategoriseList()
    }
  },
};
</script>

<style scoped lang="less">
.el-button {
  margin-bottom: 15px;
}
</style>