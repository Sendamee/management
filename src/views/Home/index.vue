<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <!--  -->
      <div>
        <img src="@/assets/imgs/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="exitLogin">退出登陆</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 展开/收回 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#4e4d4f"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="active_path"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="m1.id + ''" v-for="m1 in menuList" :key="m1.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[m1.id]"></i>
              <!-- 文本 -->
              <span>{{ m1.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + m2.path"
              v-for="m2 in m1.children"
              :key="m2.id"
              @click="activePath('/' + m2.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ m2.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      menuList: [],
      iconObj: {
        //用每一个菜单的id作为属性名
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      active_path:''
    };
  },
  //获取所有的菜单
  created() {
    this.getMenuList();
    this.activePath()
  },
  methods: {
    exitLogin() {
      //清空本地存储的sessionStorage中的token
      window.sessionStorage.clear('token');
      //重定向地址
      this.$router.push('/login');
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus');
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    //点击，菜单栏展开折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //获取当前二级菜单路径
    activePath(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.active_path = activePath
    }
  },
};
</script>

<style scoped lang="less">
.home_container {
  height: 100%;
  //头部
  .el-header {
    background-color: #616365;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #ffff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      > span {
        margin-left: 15px;
      }
    }
  }
  //左侧菜单
  .el-aside {
    background-color: #4e4d4f;

    .toggle-button {
      color: #ffff;
      cursor: pointer;
      letter-spacing: 0.2em;
      text-align: center;
      line-height: 24px;
    }

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #e9eef3;
  }

  .iconfont {
    margin-right: 10px;
  }
}
</style>