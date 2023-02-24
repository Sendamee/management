<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/rights' }"
        >权限管理</el-breadcrumb-item
      >
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRolesDialog"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table
        :data="rolesList"
        style="width: 100%"
        border
        stripe
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vCenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和3级权限  -->
              <el-col :span="18">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vCenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="12">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="danger"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="400px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加新角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesdialog"
      width="50%"
      @close="addRolesdialogClosed"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesdialog = false">取 消</el-button>
        <el-button type="primary" @click="submitNewRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="editDialog"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editRoles"
        :rules="addRolesRules"
        ref="editRolesRef"
        label-width="100px"
      >
        <el-form-item label="角色名称">
          <el-input v-model="editRoles.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitEditRole()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRightDialog" width="30%" @close="setRightDialogclosed">

      <!-- 树形控件 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox 
      node-key="id"  default-expand-all :default-checked-keys="defKeys" 
      ref="rightTreeRef">
      </el-tree>
      <!-- 对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitNewRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "RolesList",
  data() {
    return {
      //角色列表
      rolesList: [],
      addRolesdialog: false,
      //添加新角色的数据
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      //添加新角色规则
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //编辑角色对话框展示与否
      editDialog: false,
      //修改角色信息
      editRoles: {
        roleName: "",
        roleDesc: "",
      },
      //分配对话框展示与否
      setRightDialog: false,
      //所有权限列表
      rightList:[],
      //树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      //默认选中的节点
      defKeys:[],
      // 选中的节点
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取用户角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取用户角色失败");
      this.rolesList = res.data;
    },
    //添加新角色
    showAddRolesDialog() {
      this.addRolesdialog = true;
    },
    //添加新角色对话框关闭
    addRolesdialogClosed() {
      this.$refs.addRolesRef.resetFields();
    },
    //提交新角色
    submitNewRoles() {
      this.$refs.addRolesRef.validate(async (valid) => {
        //表单预验证
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status !== 201)
          return this.$message.error("添加新角色失败");
        this.getRolesList();
        this.addRolesdialog = false;
        this.$message.success("添加新角色成功");
      });
    },
    //编辑角色按钮，获取角色信息
    async editRole(id) {
      this.editDialog = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色信息失败");
      this.editRoles = res.data;
    },
    //重置编辑对话框
    editDialogClosed() {
      this.$refs.editRolesRef.resetFields();
    },
    // 提交编辑对话框
    submitEditRole() {
      //表单预验证
      this.$refs.editRolesRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `roles/${this.editRoles.roleId}`,
          {
            roleName: this.editRoles.roleName,
            roleDesc: this.editRoles.roleDesc,
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("提交编辑角色失败");
        this.getRolesList();
        this.editDialog = false;
      });
    },
    //删除角色
    async deleteRole(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm")
        return this.$message.warning("取消删除角色");
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.getRolesList();
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") return this.$message.info("取消删除");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message("删除失败");
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
     const {data:res} = await this.$http.get('rights/tree')
     if(res.meta.status !==200) return this.$message.error('获取权限数据失败')
    //获取到的权限数据保存到data中
    this.rightList = res.data
      //递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialog = true;
    },

    //通过递归的形式获取角色下所有三级权限的id，并保存到defKeys中
    getLeafKeys(node, arr) {
      if(!node.children) {
        return  arr.push(node.id)
      }
      node.children.forEach(item => 
        this.getLeafKeys(item,arr))
    } ,

    //监听分配角色对话框关闭
    setRightDialogclosed() {
      this.defKeys =[]
    },
    //提交为角色授权
    async submitNewRights() {
     const keys =[
      ...this.$refs.rightTreeRef.getCheckedKeys(),
      ...this.$refs.rightTreeRef.getHalfCheckedKeys()
     ]
     const idStr = keys.join(',')
     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,
     {rids:idStr})
     if(res.meta.status !==200) return this.$message.error('分配权限失败')
     this.getRolesList()
     this.setRightDialog = false
    }
    },
};

// },
</script>

<style scoped lang="less">
.el-table {
  margin-top: 15px;
}
.el-col {
  margin-left: 10px;
}
.bdtop {
  border-top: 1px solid #eef;
}

.bdbottom {
  border-bottom: 1px solid #eef;
}
.vCenter {
  display: flex;
  align-items: center;
}
</style>