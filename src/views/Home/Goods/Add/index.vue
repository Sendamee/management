<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        :closable="false"
        show-icon
        center
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 商品信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <!-- 级联选择器 -->
            <el-form-item label="商品分类" props="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 渲染复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片要上传的api -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览框 -->
    <el-dialog :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _  from 'lodash'
export default {
  name: "AddPage",
  data() {
    return {
      activeIndex: "0",
      //添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        //商品id所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //商品的详情
        goods_introduce:'',
        attrs:[]
      },
      // 添加商品的表单数据验证规则对象
      addFormrules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [],
        goods_weight: [],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      //级联选择器数据,商品分类列表
      cateList: [],
      //级联选择器配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: `https://lianghj.top:8888/api/private/v1/upload`,
      //图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //
      previewPath: "",
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.$message.success("获取商品分类成功");
      this.cateList = res.data;
    },
    //监听级联选择器选中的事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforTabLeave(activeName, oldActiveName) {
      console.log(this.addForm)
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        // return false
      }
    },
    //tab项点击触发
    async tabClicked() {
      // console.log(this.activeIndex)
      //证明访问的是动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败");
        }
        //将attr_vals分割
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取静态属性失败");
        this.onlyTableData = res.data;
      }
    },
    //处理图片预览的效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      //2.获取将要删除图片的索引
      const i = this.addForm.pics.findIndex((x) => {
        if (x.pic === filePath) return x;
      });
      // 3调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
    },
    //监听图片上传成功的事件
    handleSuccess(res) {
      //1.拼接得到一个图片信息对象
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
    },
    //添加商品
     addGood() {
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) return this.$message.error('请填写必要的表单项')
        //添加中的业务逻辑
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
       
        //处理动态参数
        this.manyTableData.forEach(item =>{
          const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
          }
        )
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        //发起请求添加商品
        // 商品的名称，必须是唯一的
        const {data:res} = await this.$http.post('goods',form)

        if(res.meta.status !==201) return this.$message.error('添加商品失败')

        this.$message.success('添加商品成功')
        // 导航去商品列表
        this.$router.push('/goods')

      })
    }
  },
  computed: {
    //获取三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style scoped lang="less">
.el-steps {
  margin: 10px;
}
.el-checkbox {
  margin: 10px !important ;
}
.previewImg {
  width: 100%;
}
.el-button{
  margin-top: 10px;
}
</style>