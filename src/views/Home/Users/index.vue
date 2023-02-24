<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisibale = true"
            >添加用户
          </el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column prop="username" label="名称"> </el-table-column>
        <el-table-column prop="mobile" label="手机号"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                size="mini"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="删除"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                size="mini"
              ></el-button>
            </el-tooltip>
            <!-- 分配权限 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配权限"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-s-tools"
                circle
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisibale"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addUsersForm"
        :rules="addUsersRules"
        ref="addUsersRef"
        label-width="70px"
      >
        <el-form-item label="姓名" prop="username">
          <el-input
            placeholder="请输入姓名"
            v-model="addUsersForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="请输入密码"
            v-model="addUsersForm.password"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            placeholder="请输入邮箱"
            v-model="addUsersForm.email"
          ></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input
            placeholder="请输入电话"
            v-model="addUsersForm.mobile"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisibale = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisibale = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialog" width="50%"
    @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitSetRole"
          >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "UsersPage",
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      //验证邮箱的正则表达式
      const regEmail =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (regEmail.test(value)) return callback();
      callback(new Error("请输入合法的邮箱"));
    };

    //验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      //验证手机号的正则表达式
      const regMobile =
        /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/;
      if (regMobile.test(value)) return callback();
      callback(new Error("请输入合法的手机号"));
    };
    return {
      userList: [],
      total: 0,
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        //当前页码
        pagenum: 1,
        //当前每页显示数据的条数
        pagesize: 2,
      },
      //控制添加用户对话框的显示与隐藏
      addDialogVisibale: false,
      //添加用户的表单数据
      addUsersForm: {
        username: '',
        mobile: '',
        email: '',
        password: '',
      },
      //添加表单的规则对象
      addUsersRules: {
        username: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 5, max: 15, message: "长度在5 到 15 个字符", trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
      },
      //分配角色对话框是否展示
      setRoleDialog: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色ID
      selectedRoleId:''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      //重新获取数据
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      //重新获取数据
      this.getUserList();
    },
    //监听switch开关的状态改变
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        //如果失败就让状态不能修改
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    addDialogClose() {
      this.$refs.addUsersRef.resetFields();
    },
    // 展示分配角色对话框
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo;
      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get(`roles`);
      if (res.meta.status !== 200) return this.$message.error("获取角色失败");
      this.rolesList = res.data;
      this.setRoleDialog = true;
    },
    //点击按钮分配角色
   async submitSetRole() {
    if(!this.selectedRoleId) return this.$message.error('请选择角色')
    const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
      rid:this.selectedRoleId
    })
    console.log(res.data,this.selectedRoleId)
    if(res.meta.status !==200) return this.$message.error('更新角色失败')
    
    this.getUserList() 
    this.setRoleDialog =false
    },
    //监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
    }
  },
};
</script>

<style scoped lang="less">
</style>