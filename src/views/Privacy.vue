<template>
  <div class="privacy">
    <div class="title">隐私与统计说明</div>
    <n-card>
      <n-p>本页用于说明今日热榜的匿名统计用途、采集边界与撤回方式。</n-p>
      <n-h4>我们采集什么</n-h4>
      <n-ul>
        <n-li>页面浏览与来源入口</n-li>
        <n-li>首页卡片点击、列表切换、子分类切换、榜单条目点击</n-li>
        <n-li>匿名访客标识：基于 IP 与 User-Agent 的哈希值，用于 UV/去重统计</n-li>
      </n-ul>
      <n-h4>我们不采集什么</n-h4>
      <n-ul>
        <n-li>不存储原始 IP 地址</n-li>
        <n-li>不存储账号、手机号、邮箱等直接身份信息</n-li>
        <n-li>不同意统计时，不发送行为事件</n-li>
      </n-ul>
      <n-h4>用途</n-h4>
      <n-p>
        这些匿名统计用于判断默认榜单排序、识别高价值来源入口、统计每日流量与独立访客，并辅助运营和运维决策。
      </n-p>
      <n-h4>如何撤回</n-h4>
      <n-p>
        你可以随时前往「全局设置」中的「统计与隐私」区块撤回同意。撤回后，后续不会继续发送新的行为统计事件。
      </n-p>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.privacy {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .title {
    font-size: 30px;
    font-weight: 700;
  }
}
</style>
