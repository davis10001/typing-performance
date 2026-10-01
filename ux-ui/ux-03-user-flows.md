# 03 用户流程

## UXF-01 · UJ-01 快速测试

`Landing → 选择/确认时长 → Ready → 3-2-1 Countdown → Running → time up → Result`。

Ready 点击 Start 后才请求输入焦点；倒计时结束自动聚焦输入。Running 期间 Backspace 可用；粘贴/拖放显示一次简短、非阻塞提示“Paste isn't available in a typing test.”；到时自动冻结并进入 Result。

## UXF-02 · UJ-02 结果理解

`Result → Score summary → band explanation → benchmark article or retest`。先显示 WPM/accuracy，再显示 Raw WPM、errors 与时长；band 是可点击的解释模块，不显示百分位。

## UXF-03 · UJ-03 重测

`Result / History → choose duration → new Ready`。重测开新 Session，不能返回前一轮 Running；离开前一轮结果仍作为本机历史的独立条目。

## UXF-04 · UJ-04 内容转化

`Benchmark article → inline result example → Choose a test → Ready`。正文在脚本加载前仍可阅读；CTA 文案表明会进入交互测试。

## UXF-05 · UJ-05 历史

`Result → Recent results → Retest / Clear history`。清除需要确认，因为这是本机数据删除；空状态提供“Take your first test”。

异常：页面刷新或关闭使未完成 Session 终止；重新进入显示 Ready 而非虚构结果。可用性不足时显示“Recent results couldn't be saved on this device”，但维持当前 Result。
