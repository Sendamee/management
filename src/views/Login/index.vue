<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="@/assets/logo.png" alt="vue" />
      </div>
      <!-- 登陆表单区域 -->
      <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          >
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          >
          </el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      //登陆表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      //表单验证的规则对象
      loginFormRules:{
        //验证用户名是否合法
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证密码是否合法
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  methods:{
    //点击重置按钮，重置登陆表单
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields()
    },
    login(){
      this.$refs.loginFormRef.validate(async (valid) =>{
        if(!valid) return
        const {data:res} = await this.$http.post('login',this.loginForm)
        console.log()
        if(res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        //将获取的的数据中的token存储在客户端的sessionStorage中
        window.sessionStorage.setItem('token',res.data.token)
        this.$router.push('/home')
      })
    }
  }
};
</script>

<style scoped lang="less">
.login_container {
  background-color: #2b6b4b;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #ffff;
    border-radius: 3px;
    //相对定位
    position: relative;

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 5px rgb(209, 208, 208);
      // 绝对定位
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgb(243, 243, 243);
      }
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>