<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 2.为echarts准备一个具备大小（宽高）的dom -->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
//1.导入echarts
import * as echarts from "echarts";
import _ from "lodash";
export default {
  name: "ReportPage",
  data() {
    return {
        //需要合并的配置项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    };
  },
  created() {},
  //此时页面上的元素已经被渲染完毕了
  async mounted() {
    //3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById("main"));

    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

    //4.准备数据和配置项
    const result = _.merge(res.data,this.options)
    //5绘制图表,展示数据
    myChart.setOption(result);
  },
  methods: {},
};
</script>

<style>
</style>