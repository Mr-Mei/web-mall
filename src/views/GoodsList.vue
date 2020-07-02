<template>
  <div>
    <!-- 头部组件 -->
    <!-- <NavHeader></NavHeader> -->
    <!-- 由W3C标准，标签要小写，因此用  nav-组件名  写法 -->
    <nav-header></nav-header>
    <!-- 面包屑组件 -->
    <nav-bread>
      <span>Goods</span>
      <!-- <span slot="bread">Love</span> -->
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <a href="javascript:void(0)" class="price" @click="sortGoods">
            Price
            <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':sortFlag}">
              <use xlink:href="#icon-arrow-short"></use>
            </svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd>
                <a
                  href="javascript:void(0)"
                  :class="{'cur':priceChecked == 'all'}"
                  @click="priceChecked = 'all' "
                >All</a>
              </dd>
              <dd v-for="(price,index) in priceFilter" :key="index">
                <a
                  href="javascript:void(0)"
                  @click="setPriceFilter(index)"
                  :class="{'cur':priceChecked == index}"
                >{{price.startPrice}} - {{price.endPrice}}</a>
              </dd>
            </dl>
          </div>
          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item,index) in goodsList" :key="index">
                  <div class="pic">
                    <a href="#">
                      <img v-lazy="'../../static/'+item.productImage" alt/>
                    </a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="loadMore"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="30"
              >
                <img src="../../static/loading-svg/loading-spinning-bubbles.svg" v-show="loading" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 模态框 -->
    <!-- 说明：父组件传mdShow数据给子组件，监听子组件触发的close事件，然后调用closeModal方法 -->
    <!-- 未登录状态 -->
    <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
      <p slot="message">
        请先登录，否则无法加入购物车中！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShow=false">关闭</a>
      </div>
    </modal>
    <!-- 已登陆状态 -->
    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
      <p slot="message">
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-cart"></use>
        </svg>
        <span>加入购物车成功!</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
        <router-link to="/cart" class="btn btn--m btn--red" href="javascript:;">查看购物车</router-link>
      </div>
    </modal>
     <!-- 遮罩 -->
    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
     <!-- 底部组件 -->
    <nav-footer></nav-footer>
    <!-- 图标  -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <symbol id="icon-arrow-short" viewBox="0 0 25 32">
              <title>arrow-short</title>
              <path class="path1" d="M24.487 18.922l-1.948-1.948-8.904 8.904v-25.878h-2.783v25.878l-8.904-8.904-1.948 1.948 12.243 12.243z"></path>
          </symbol>
          <symbol id="icon-status-ok" viewBox="0 0 32 32">
            <title>status-ok</title>
            <path class="path1" d="M22.361 10.903l-9.71 9.063-2.998-2.998c-0.208-0.209-0.546-0.209-0.754 0s-0.208 0.546 0 0.754l3.363 3.363c0.104 0.104 0.241 0.156 0.377 0.156 0.131 0 0.261-0.048 0.364-0.143l10.087-9.414c0.215-0.201 0.227-0.539 0.026-0.754s-0.539-0.226-0.754-0.026z"></path>
            <path class="path2" d="M16 30.933c-8.234 0-14.933-6.699-14.933-14.933s6.699-14.933 14.933-14.933c8.234 0 14.933 6.699 14.933 14.933s-6.699 14.933-14.933 14.933zM16 0c-8.822 0-16 7.178-16 16 0 8.823 7.178 16 16 16s16-7.177 16-16c0-8.822-7.178-16-16-16z"></path>
          </symbol>
        </defs>
    </svg>
  </div>
</template>

<script>
  import NavHeader from "./../components/NavHeader";
  import NavFooter from "./../components/NavFooter";
  import NavBread from "./../components/NavBread";
  import Modal from "./../components/Modal";
  import axios from "axios";

  export default {
    data() {
      return {
        goodsList: [],
        sortFlag: true, // 排序
        page: 1,
        pageSize: 8,
        busy: true,
        priceFilter: [
          {
            startPrice: "0.00",
            endPrice: "100.00"
          },
          {
            startPrice: "100.00",
            endPrice: "500.00"
          },
          {
            startPrice: "500.00",
            endPrice: "1000.00"
          },
          {
            startPrice: "1000.00",
            endPrice: "5000.00"
          }
        ],
        priceChecked: "all",
        loading:false,
        mdShow:false,
        mdShowCart:false,
        filterBy: false,
        overLayFlag: false
      };
    },
    components: {
      NavHeader, // 会自动解析成对象，key、value即： NavHeader: NavHeader
      NavFooter,
      NavBread,
      Modal
    },
    mounted() {
      this.getGoodsList();
    },
    methods: {
      getGoodsList(flag) {
        let param = {
          // 设置加载所需的参数
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sortFlag ? 1 : -1, // 三元运算符判断升序或者降序
          priceLevel: this.priceChecked
        };
        this.loading = true;
        axios
          .get("/goods/list", {
            params: param //  把参数传给去
          })
          .then(response => {
            let res = response.data;
            this.loading = false;
            if (res.status == "0") {
              if (flag) {
                // 滚动加载后，表示分页，获取数据要进行累加，数据需要用concat()进行拼接
                this.goodsList = this.goodsList.concat(res.result.list);
                if (res.result.count == 0) {
                  this.busy = true;                 // 0条数据不需要滚动加载
                } else {
                  this.busy = false;         // 非0条需要滚动加载
                }
              } else {
                this.goodsList = res.result.list   // 第一次进入不需要数据累加
                this.busy = false;
              }

            } else {
              this.goodsList = [];
            }
          });
      },
      // 排序函数
      sortGoods() {
        this.sortFlag = !this.sortFlag;
        this.page = 1; // 点排序后，从第一页开始排序
        this.getGoodsList(); // 排序需要重新加载数据
      },
      // 分页加载函数
      loadMore() {
        this.busy = true;
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },
      // 价格过滤函数
      setPriceFilter(index) {
        this.priceChecked = index;
        this.page = 1;           // 价格过滤从第一页开始
        this.getGoodsList();
      },
      // 添加购物车
      addCart(productId){  // 点击加入购物车
        axios.post("/goods/addCart",{   // 接口设置在server/routes/goods.js
          productId:productId
        }).then((res)=>{
          var res = res.data;
          if(res.status==0){
            // alert("加入成功")
            this.mdShowCart = true;   // 加入购物车成功，成功的模态框显示
            // 购物车数量加1 (提交的vuex统一管理)
            this.$store.commit('updateCartCount',1);
          }else{
            // alert("msg:"+res.msg)
            this.mdShow = true;   // 未登录模态框显示
          }
        })
      },
      closeModal () {
        this.mdShow = false;   // 事件被触发，模态框关闭
        this.mdShowCart = false;
      },
      showFilterPop() {
        this.filterBy = true;
        this.overLayFlag = true;
      },

      closePop() {
        this.filterBy = false;
      }
    }
  };
</script>

<style>
</style>
