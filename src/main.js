// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'    // 懒加载
import infiniteScoll from 'vue-infinite-scroll'   // 滚动加载
Vue.use(infiniteScoll)
import Vuex from 'vuex'
Vue.use(Vuex);
import {currency} from './util/currency'  // 由于currency是具名函数导出，非匿名，因此要用{}，结构赋值法引入

import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/product.css'

Vue.config.productionTip = true

Vue.filter("currency",currency)  // 定义全局过滤器

Vue.use(VueLazyLoad, {
  loading: "./../static/loading-svg/loading-bars.svg" // 设置图片加载之前的效果
})

// 建立store对象
const store = new Vuex.Store({
  state:{
    nickName:'',  // 用户名
    cartCount:0  // 购物车数量
  },
  mutations:{     // 更改状态
    //  更新用户信息
    updateUserInfo(state,nickName){
      state.nickName = nickName;
    },
    updateCartCount(state,cartCount){
      state.cartCount += cartCount;
    },
    initCartCount(state,cartCount){   // 商品数量的初始化
      state.cartCount = cartCount;
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: {
    App
  },
  template: '<App/>'
})
