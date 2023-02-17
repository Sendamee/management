<template>
  <div>
    <el-button type="info" @click="exitLogin" >退出登陆</el-button>
  </div>
</template>

<script>
export default {
    name:'HomePage',
    methods: {
      exitLogin(){
        //清空本地存储的sessionStorage中的token
        window.sessionStorage.clear('token')
        //重定向地址
        this.$router.push('/login')
      }
    },
}
</script>

<style>

</style>