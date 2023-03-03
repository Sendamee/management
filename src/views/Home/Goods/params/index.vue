<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <!-- 选择商品分类 -->
      <el-row>
        <span style="font-size: 14px">选择商品分类:</span>
        <!-- 选择商品分类的级联选择框 -->
        <el-cascader
          v-model="seletedKeys"
          :options="cateList"
          :props="cascaderProps"
          @change="selectedChanged"
        ></el-cascader>
      </el-row>

      <!-- tab导航 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <!-- 动态参数列表 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(attr, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                  closable
                  :disable-transitions="false"
                >
                  {{ attr }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(attr, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                  closable
                  :disable-transitions="false"
                >
                  {{ attr }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogclosed"
    >
      <!-- Tina级参数的对话框 -->
      <el-form
        :model="addForm"
        :rules="formRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="formRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodsParams",
  data() {
    return {
      //商品分类列表
      cateList: [],
      // 选中的选项id
      seletedKeys: [],
      //props配置项，配置级联选择框
      cascaderProps: {
        label: "cat_name", //选项名
        value: "cat_id", //选项id
        children: "children",
        expandTrigger: "hover",
      },
      // 被激活的页签名称
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态参数数据
      onlyTableData: [],
      // 是否展示添加动态参数对话框
      addDialogVisible: false,
      //添加表单的对象
      addForm: {},
      //添加表单的验证规则对象
      formRules: {
        attr_name: [
          { required: true, message: "请输入动态参数", trigger: "blur" },
          {
            min: 2,
            max: 15,
            message: "长度在 2 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
      //编辑对话框展示与否
      editDialogVisible: false,
      //修改表单数据对象
      editForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取分类列表失败");
      this.cateList = res.data;
    },
    //监听选项改变
    selectedChanged() {
      this.getParamsData();
    },
    //tab标签点击事件的处理函数
    handleTabClick() {
      this.getParamsData()
    },
    //获取参数
    async getParamsData() {
      //证明选中的不是三级分类
      if(this.seletedKeys.length !==3){
        this.seletedKeys =[]
        this.manyTableData=[]
        this.onlyTableData=[]
      }
      //根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) return this.$message.error("获取参数失败");
      //切割attr_vals属性，返回一个数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === "many") return (this.manyTableData = res.data);
      this.onlyTableData = res.data;
    },

    // 展示动态参数对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },
    //监听添加对话框的关闭事件
    addDialogclosed() {
      this.addDialogVisible = false;
      this.$refs.addFormRef.resetFields();
    },
    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.addForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 201) return this.$message.error("添加属性失败");
        this.addDialogVisible = false;
        this.$message.success("添加属性成功");
        this.getParamsData();
      });
    },
    //展示修改对话框
    async showEditDialog(info) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${info.attr_id}`,
        {
          params: { attr_sel: info.attr_sel, attr_vals: info.attr_vals },
        }
      );
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      this.$message.success("获取参数成功");
      this.editForm = res.data;
    },
    //监听修改参数对话框关闭,重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮,修改参数
    editParams() {
      //表单预验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel,
            attr_vals: this.editForm.attr_vals,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("提交参数失败");
        this.$message.success("修改参数成功");
        this.editDialogVisible = false;
        this.getParamsData();
        console.log(res);
      });
    },
    //点击按钮，删除参数
    async deleteParams(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //用户取消删除
      if (confirmResult !== "confirm")
        return this.$message.info("用户取消删除");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/` + id
      );
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("删除参数失败");
      this.$message.success("删除参数成功");
      this.getParamsData();
    },
    //文本框失去焦点或者按下了enter都会触发
   async handleInputConfirm(row) {
      if(row.inputValue.trim().length === 0){
        row.inputValue =''
        row.inputVisible = false
        return 
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue =''
      row.inputVisible = false
      //需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    //将对attr_vals的操作保存到数据库中
   async saveAttrVals(row){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(',')
      })
      if(res.meta.status !==200) this.$message.error('添加参数失败')
       this.$message.success('添加参数成功')
    },
    //点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获取焦点
      //nextTick方法的作用，就是当页面上元素被重新渲染之后，
      //才会指定回调函数中的代码
      this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        })
    },
    //删除对应的参数可选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true
    isBtnDisable() {
      if (this.seletedKeys.length !== 3) return true;
      return false;
    },
    //选中三级菜单的id
    cateId() {
      if (this.seletedKeys.length === 3) return this.seletedKeys[2];
      return null;
    },
    //动态计算表题文本
    titleText() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
};
</script>

<style scoped lang="less">
.el-row {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 10px;
}
.el-button {
  margin-bottom: 15px;
}
.el-tag {
  margin:0 8px;
}
.input-new-tag{
  width: 150px;
}
</style>