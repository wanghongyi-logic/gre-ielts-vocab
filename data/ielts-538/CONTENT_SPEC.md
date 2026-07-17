# IELTS 538 内容数据规范

本目录只提供可调用内容，不修改现有 Web App、注册文件或 Service Worker。

## 源表边界

- 唯一顺序来源：`考点词538_表格提取_适配背词App.xlsx` 的 `App导入词条`。
- 实际可导入记录为 527 条：376 个 `primary`，151 个 `highlighted_substitute`。
- PDF 标题标称 538；源工作簿说明实际为 536 个英文词，且不虚构缺失的 2 个词。
- 每条内容以 `appId` 对齐源表；同形词不能只用字符串作为唯一键。

## 两条辨析通道必须分开

### 近义词组 `synonymGroups`

- 按 `linked_primary_word` 归入主词组，不按固定五词分组。
- `source_question_method` 是候选池；必须清洗重复、粘连和词性错误。
- 候选词只能按真实语境说明可替换范围，不能宣称处处同义。
- 每个成员需有核心义、边界、典型搭配和双语例句；每组提供双语辨析题。

### 形近／同根辨析 `lookalikePacks`

- 只收拼写相近、构词相近或同根而易误认的词，不收“仅语义相近”的词。
- 沿用 GRE 独立 schema：`relation`、双方构词路径、`rootContrastZh`、现代用法区别、易混刹车、双方双语例句。
- 必须明确两词是同根、远源相关，还是仅现代拼写相近。
- 中文谐音不得冒充词源；词源不确定时明确写“不确定”或“存在争议”。

## 单词条 `entries`

每条至少包含：

- `appId`, `word`, `ipa`, `pos`, `register`；
- `coreEn`, `coreZh`, `grammarZh`, `imageZh`；
- `senses`：至少一个义项，每义项至少两个可点击双语搭配及双语例句；
- `morphology`：可靠词源／构词、词族、熟词桥或明确标注的非词源联想、荒诞画面、语义落点、易混刹车、双语十秒回忆句；
- `ieltsExamples`：至少两句自然的雅思阅读／写作／听力／口语语境例句；未经逐字核验不得标记为真题原句；
- `recall` 与 `checks`：主动回忆及双语测试。

## IELTS 例句来源等级

- `official_practice_test`：经官方 IELTS 合作方公开练习材料逐字核验，附 URL、标题、位置和 `verbatim`。
- `official_exam_preparation`：官方备考文章或示范答案，不能称为考场真题。
- `authored_ielts_style`：为本项目原创的雅思语境例句，必须明确标注，不能伪装成真题。

优先写高质量、可用于考试的自然例句；只有查到并核实原文时才进入官方证据层。

## 分批保存

全量按近义组边界切成 12 个批次，每批约 40–45 个 App 条目。每个批次分别导出：

- `entries...`
- `synonymGroups...`
- `lookalikePacks...`

最终聚合入口不得覆盖原来的 GRE 数据文件。

