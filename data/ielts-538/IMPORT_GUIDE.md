# IELTS 538 内容数据导入说明

本目录提供完整、可调用的 IELTS 词条内容数据，但**不会自动注册到现有 Web App**。导入方应从 `index.js` 读取聚合数据，再按自己的页面、路由和状态管理方式接入；不要直接覆盖 GRE 数据或把本目录当作 App 注册脚本执行。

## 1. 数据规模与“538”标题差异

这里有三个不同统计口径，不应混为一谈：

| 口径 | 数量 | 含义 |
|---|---:|---|
| PDF／项目标题标称 | 538 | 原资料标题中的宣传性词数 |
| 源工作簿说明的实际英文词 | 536 | 原始资料实际包含的英文词数；缺少的 2 个词没有被虚构补齐 |
| `App导入词条` 可导入记录 | 527 | App 实际使用的有序内容记录 |
| `primary` 记录／link 组 | 376 | 每个主词对应一个 `g001`–`g376` 组 |
| `highlighted_substitute` 记录 | 151 | 通过 `linked_primary_word` 关联到主词的高亮替换表达 |

因此，全量导入应以 **527 个 `appId` 词条、376 个 link 组**为准，而不是创建 538 个 App 记录。536 与 527 的差异来自“原资料英文词统计”和“App 导入行”两个不同口径；标题 538 又是第三个口径。

源顺序的唯一依据是：

```text
考点词538_表格提取_适配背词App.xlsx
└── App导入词条（A2:L528）
```

`source-entries.js` 是该 Sheet 的 527 行机械保序版本；内容纠错和教学扩充位于各批次文件中。

## 2. 目录与聚合入口

推荐只从聚合入口导入：

```js
import {
  ielts538Entries,
  ielts538SynonymGroups,
  ielts538LookalikePacks,
  ielts538Manifest,
} from "./data/ielts-538/index.js";
```

主要文件：

- `index.js`：全量聚合入口、索引和查询函数。
- `schema.js`：共享内容结构辅助函数。
- `source-entries.js`：527 条源记录及 `appId` 索引。
- `source-groups.js`：376 个原始 link 组。
- `official-evidence.js`：逐条核验过的官方公开材料证据层。
- `batch-*.js`：内容批次，每批分别导出 `entries...`、`synonymGroups...`、`lookalikePacks...`。

### 14 个批次

| 批次文件 | `appId` 范围 | 内容导出 |
|---|---:|---|
| `batch-001-044.js` | 1–44 | `entries001To044` 等 |
| `batch-045-056.js` | 45–56 | `entries045To056` 等 |
| `batch-057-089.js` | 57–89 | `entries057To089` 等 |
| `batch-090-100.js` | 90–100 | `entries090To100` 等 |
| `batch-101-134.js` | 101–134 | `entries101To134` 等 |
| `batch-135-178.js` | 135–178 | `entries135To178` 等 |
| `batch-179-222.js` | 179–222 | `entries179To222` 等 |
| `batch-223-266.js` | 223–266 | `entries223To266` 等 |
| `batch-267-310.js` | 267–310 | `entries267To310` 等 |
| `batch-311-354.js` | 311–354 | `entries311To354` 等 |
| `batch-355-399.js` | 355–399 | `entries355To399` 等 |
| `batch-400-443.js` | 400–443 | `entries400To443` 等 |
| `batch-444-487.js` | 444–487 | `entries444To487` 等 |
| `batch-488-527.js` | 488–527 | `entries488To527` 等 |

每个批次的另外两个导出沿用相同范围命名，例如：

```js
entries400To443
synonymGroups400To443
lookalikePacks400To443
```

批次边界按 link 组切分，不按固定五词一组。常规接入无需逐批导入；`index.js` 已按 `appId` 或 `primaryAppId` 排序聚合。

## 3. 三类数据及其关系

### 3.1 词条 `ielts538Entries`

每条以 `appId` 唯一定位，包含：

- 源表字段和 `synonymGroupId`；
- IPA、词性、语域、准确英中核心义、语法和核心图像；
- `senses`、双语搭配和搭配例句；
- `morphology`、词族、熟词桥及词源可靠性声明；
- `memory`、语义落点、易混刹车和双语十秒句；
- `ieltsExamples`、主动回忆 `recall` 和双语测试 `checks`；
- 聚合时附加的原始 `source` 和 `officialEvidence`。

### 3.2 近义／替换组 `ielts538SynonymGroups`

近义组按 `linked_primary_word` 和 `groupId` 组织。`source_question_method` 只是原资料给出的候选池，内容层已经清洗重复、粘连、词性错误和不能互换的表达。

近义组回答的问题是：

> 这些意思相关的词，在什么语境可以替换，又在哪里必须分开？

主要字段包括 `groupId`、`primaryAppId`、`entryAppIds`、`sourceQuestionMethodRaw`、`sourceMethodAudit`、`members`、`groupRuleZh` 和 `checks`。

### 3.3 形近／同根包 `ielts538LookalikePacks`

形近包按目标词的 `appId` 独立组织，只包含：

- 现代拼写相近、容易误认的词；
- 构词相近的词；
- 同根或远源相关、但现代意义已经分化的词。

它回答的是另一个问题：

> 这两个词为什么长得像，它们的词根、构词路径和现代用法究竟哪里不同？

每个 item 包含 `relation`、`targetFormZh`、`lookalikeFormZh`、`rootContrastZh`、`contrastZh`、`brakeZh` 及双方双语例句。

### 两条辨析通道严禁合并

```text
语义相关、可替换范围       → synonymGroups
拼写相近、构词相近、同根   → lookalikePacks
```

例如，近义词可能完全不像；形近词也可能意义完全无关。UI 可以在同一词条页展示两个模块，但应使用不同标题、不同视觉区域和不同查询来源，不能把形近 item 追加到 `members`，也不能把普通近义词塞入 lookalike pack。

## 4. 推荐调用方式

### 4.1 按 `appId` 读取完整词条

```js
import { getIelts538Entry } from "./data/ielts-538/index.js";

const entry = getIelts538Entry(3);

console.log(entry.word);             // "recognize"
console.log(entry.coreZh);           // 内容层纠正后的核心义
console.log(entry.senses);           // 双语用法、搭配和例句
console.log(entry.synonymGroupId);   // "g002"
console.log(entry.officialEvidence); // 官方证据数组；可能为空
```

传入数字字符串也可以，但建议业务层始终保存整数 `appId`：

```js
getIelts538Entry("3");
```

找不到时函数返回 `undefined`，调用方应做空值处理。

### 4.2 读取近义组

```js
import {
  getIelts538Entry,
  getIelts538SynonymGroup,
} from "./data/ielts-538/index.js";

const entry = getIelts538Entry(3);
const group = getIelts538SynonymGroup(entry.synonymGroupId);

console.log(group.groupId);          // "g002"
console.log(group.entryAppIds);      // [3, 4, 5, ...]
console.log(group.members);          // 每个成员的边界、搭配、双语例句
console.log(group.groupRuleZh);      // 整组辨析原则
console.log(group.checks);           // 双语组测试
```

`getIelts538SynonymGroup` 接收 `g001` 形式的精确字符串；不要传主词 surface word 代替 `groupId`。

### 4.3 读取形近／同根包

```js
import { getIelts538LookalikePack } from "./data/ielts-538/index.js";

const pack = getIelts538LookalikePack(3);

console.log(pack.appId);             // 3
console.log(pack.word);              // "recognize"
console.log(pack.items[0].word);     // 形近／同根对比词
console.log(pack.items[0].relation); // 同根、远源相关或仅拼写相近
console.log(pack.items[0].rootContrastZh);
console.log(pack.items[0].targetExample);
console.log(pack.items[0].lookalikeExample);
```

这个函数按 `appId` 查找，不按 `groupId` 查找。

### 4.4 读取 `officialEvidence`

聚合词条已自动附加官方证据：

```js
const entry = getIelts538Entry(10);

for (const evidence of entry.officialEvidence) {
  console.log(evidence.sourceType);
  console.log(evidence.sourceTitle);
  console.log(evidence.sourceUrl);
  console.log(evidence.verbatim);
  console.log(evidence.noteZh);
}
```

如果只需要证据层而不需要完整聚合词条，也可直接调用底层 getter：

```js
import { getIelts538OfficialEvidence } from "./data/ielts-538/official-evidence.js";

const officialEvidence = getIelts538OfficialEvidence(10);
```

没有逐字核验官方材料的词条会返回空数组。不要因为数组为空就把 `ieltsExamples` 标成真题；批次内的原创例句明确使用：

```js
provenance: "authored_ielts_style"
verbatim: false
```

官方证据中也必须继续查看 `sourceType`、`verbatim` 和 `noteZh`：

- `official_practice_test`：官方合作方公开练习材料；
- `official_exam_preparation`：官方备考文章或示范，不应称为真实考场原题；
- `verbatim: true`：逐字核验原句；
- `verbatim: false`：根据官方材料压缩或调整过，不能显示为逐字引用。

## 5. 重复 surface word 与主键规则

**`appId` 是唯一可靠主键。** 不要用 `word` 字符串作为数据库主键、路由唯一键或学习进度键。

源记录中存在重复 surface word，例如 `principle` 对应不同 `appId` 和不同 link 组。即使两个页面显示相同单词，它们也可能来自不同原始考点、拥有不同候选池和教学上下文。

需要按显示词检索时，使用返回数组的查询：

```js
import { getIelts538EntriesByWord } from "./data/ielts-538/index.js";

const matches = getIelts538EntriesByWord("principle");

for (const entry of matches) {
  console.log(entry.appId, entry.synonymGroupId, entry.source);
}
```

推荐持久化结构：

```js
{
  dataset: "ielts-538",
  appId: 140,
  progress: "learning"
}
```

不推荐：

```js
{
  word: "principle", // 不能区分重复 surface word
  progress: "learning"
}
```

## 6. 最小页面接入关系

一个词条详情页至少可按以下关系取数：

```js
const entry = getIelts538Entry(appId);
if (!entry) throw new Error(`Unknown IELTS 538 appId: ${appId}`);

const synonymGroup = getIelts538SynonymGroup(entry.synonymGroupId);
const lookalikePack = getIelts538LookalikePack(entry.appId);

renderEntry(entry);
renderSynonymModule(synonymGroup);  // 意思相关
renderLookalikeModule(lookalikePack); // 拼写／词根相关
renderOfficialEvidence(entry.officialEvidence);
```

页面标签建议明确区分：

- “近义词与替换边界” → `synonymGroup`
- “形近／同根词辨析” → `lookalikePack`
- “原创雅思语境例句” → `entry.ieltsExamples`
- “已核验官方材料” → `entry.officialEvidence`

## 7. 导入前后的完整性期望

导入完成后，调用方至少应确认：

```js
ielts538Manifest.appImportEntryCount === 527;
ielts538Manifest.sourceGroupCount === 376;
ielts538Manifest.titleClaimedWordCount === 538;
ielts538Manifest.sourceWorkbookActualEnglishWordCount === 536;
```

还应保留以下约束：

1. 词条严格按 `appId` 1–527 排序或索引。
2. 进度、收藏、测试记录和 TTS 状态均以 `appId` 为键。
3. 近义组使用 `groupId`，形近包使用目标 `appId`。
4. 不把 `source_question_method` 原字符串直接显示为“完全同义词”。
5. 不把中文谐音当真实词源。
6. 没有逐字核验和来源链接时，不把例句标成真题原句。
7. 本数据模块与既有 GRE 数据命名空间分开，避免同名词或索引冲突。

