import Vue from "vue";
import VueRouter from "vue-router";
import ChatApp from "../components/ChatApp.vue";
import ShareView from "../components/ShareView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: ChatApp,
  },
  {
    path: "/share/:shareId",
    name: "ShareView",
    component: ShareView,
    props: true,
  },
];

const router = new VueRouter({
  mode: "hash", // 使用hash模式以支持静态部署
  base: "/",
  routes,
});

export default router;