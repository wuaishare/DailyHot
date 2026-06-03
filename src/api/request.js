import axios from "axios";

switch (process.env.NODE_ENV) {
  case "production":
    axios.defaults.baseURL = import.meta.env.VITE_GLOBAL_API;
    break;
  case "development":
    axios.defaults.baseURL = import.meta.env.VITE_GLOBAL_API;
    break;
  default:
    axios.defaults.baseURL = import.meta.env.VITE_GLOBAL_API;
    break;
}

axios.defaults.timeout = 30000;
axios.defaults.headers.common = { Accept: "application/json" };

// 请求拦截
axios.interceptors.request.use(
  (request) => {
    // if (request.loadingBar != "Hidden") $loadingBar.start();
    if (request.method?.toLowerCase() === "get") {
      delete request.headers["Content-Type"];
      delete request.headers["content-type"];
    }
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        request.headers.Authorization = token;
      }
    }
    return request;
  },
  (error) => {
    // $loadingBar.error();
    if (typeof window !== "undefined" && window.$message) {
      window.$message.error("请求失败，请稍后重试");
    }
    return Promise.reject(error);
  }
);

// 响应拦截
axios.interceptors.response.use(
  (response) => {
    // $loadingBar.finish();
    return response.data;
  },
  (error) => {
    if (error.config?.silent) {
      return Promise.reject(error);
    }
    if (typeof window !== "undefined" && window.$loadingBar) {
      window.$loadingBar.error();
    }
    if (error.response) {
      let data = error.response.data;
      switch (error.response.status) {
        case 401:
          if (window.$message)
            window.$message.error(data.message ? data.message : "请登录后使用");
          break;
        case 301:
          if (window.$message)
            window.$message.error(data.message ? data.message : "请求路径发生跳转");
          break;
        case 403:
          if (window.$message)
            window.$message.error(data.message ? data.message : "暂无访问权限");
          break;
        case 404:
          if (window.$message)
            window.$message.error(data.message ? data.message : "请求资源不存在");
          break;
        case 500:
          if (window.$message)
            window.$message.error(data.message ? data.message : "内部服务器错误");
          break;
        default:
          if (window.$message)
            window.$message.error(data.message ? data.message : "请求失败，请稍后重试");
          break;
      }
    } else {
      if (typeof window !== "undefined" && window.$message) {
        window.$message.error("请求失败，请稍后重试");
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
