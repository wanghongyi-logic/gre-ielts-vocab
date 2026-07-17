// IELTS 538 content small batch: app_id 45–56 / source groups g020–g024.
// Data only: this file is intentionally not registered in the Web App.

import {
  collocation,
  contentEntry,
  ieltsExample,
  lookalikePack,
  synonymGroup,
} from "./schema.js";
import { ielts538SourceByAppId } from "./source-entries.js";
import { ielts538SourceGroupById } from "./source-groups.js";

const sourceFor = (appId) => {
  const row = ielts538SourceByAppId.get(appId);
  if (!row) throw new Error(`Missing IELTS 538 source entry ${appId}`);
  return {
    appId: row.app_id,
    entryType: row.entry_type,
    category: row.category,
    categoryIndex: row.category_index,
    importanceRank: row.importance_rank,
    wordOrPhrase: row.word_or_phrase,
    posSource: row.pos_source,
    meaningZhSource: row.meaning_zh_source,
    linkedPrimaryWord: row.linked_primary_word,
    sourceQuestionMethodRaw: row.source_question_method,
    sourcePage: row.source_page,
    importNote: row.import_note,
  };
};

const authored = ([en, zh, skill, taskType]) => ieltsExample({
  en,
  zh,
  skill,
  taskType,
  provenance: "authored_ielts_style",
  verbatim: false,
  noteZh: "本项目原创雅思语境例句；用于训练，不是真题原句。",
});

const synonymGroupIdByAppId = new Map([
  [45, "g020"], [46, "g020"], [47, "g020"],
  [48, "g021"], [49, "g021"],
  [50, "g022"], [51, "g022"],
  [52, "g023"], [53, "g023"],
  [54, "g024"], [55, "g024"], [56, "g024"],
]);

const entryRows = [
  {
    id: 45, word: "thanks to*", ipa: "/ˈθæŋks tuː/", pos: "prepositional phrase", register: "中性；口语和写作均常见，正式写作需注意语气",
    coreEn: "because of someone or something, often with an implication of benefit, credit, or ironic blame", coreZh: "由于；幸亏；有时反讽地表示“都怪”",
    grammar: "thanks to + 名词、代词或 -ing；它是介词短语，不能直接接完整句。正式中性因果常改用 due to/because of。", image: "一个结果回头给原因递上感谢卡；反讽时卡片背面写着“都怪你”。",
    title: "标出原因并常带评价", explain: "既能陈述有利原因，也能反讽地归咎；是否真有感谢意味取决于语境。",
    cols: [["thanks to public investment", "由于公共投资", "Thanks to public investment, the rail network has expanded rapidly.", "由于公共投资，铁路网迅速扩张。"], ["thanks to improved screening", "得益于改进的筛查", "More cases are detected early thanks to improved screening.", "得益于改进的筛查，更多病例得到早期发现。"]],
    origin: "thanks 是 thank 的复数形式；短语 thanks to 由“把结果归功于……”发展为因果介词。thank 可追溯到古英语 þanc。", family: ["thank", "thankful", "thankfully"], bridge: "熟词桥（非词源联想）：把 cause 想成收到一张 THANKS 卡。", scene: "太阳能板给政策递感谢卡，电费曲线随即下降。", landing: "结果 ← 原因，并常带正面归功或反讽归咎。", brake: "刹车：thanks to 后接名词性成分；不要写 thanks to the policy was changed。", micro: ["Thanks to better data, the cause became clear.", "由于数据更好，原因变清楚了。"],
    ielts: [["Thanks to reliable public transport, fewer commuters need to drive into the city centre.", "由于公共交通可靠，需要开车进入市中心的通勤者减少了。", "Writing", "Task 2 cause-and-effect"], ["The wetland recovered thanks to restrictions on industrial discharge.", "由于限制工业排放，这片湿地恢复了。", "Reading", "environment passage"]],
    recall: ["What can follow thanks to, and what attitude can it carry?", "thanks to 后面接什么，它可能带什么态度？", "A noun-like element follows it; it often gives credit and can also assign ironic blame.", "后接名词性成分；常表示归功，也可反讽地归咎。"],
    check: ["______ improved insulation, household energy use fell.", "由于保温改善，家庭能源使用量下降了。", ["Thanks to", "Thanks to that", "Thanks"], 0, "thanks to + 名词短语可引出原因。"],
  },
  {
    id: 46, word: "stem from", ipa: "/stem frəm/", pos: "intransitive phrasal verb", register: "中性偏正式；学术因果分析高频",
    coreEn: "to originate in or be caused by something", coreZh: "源于；由……造成",
    grammar: "结果/问题 + stem(s) from + 原因；主语是结果，from 后是源头。可用 stem largely/partly from。", image: "地面上的问题沿植物茎一路向下，找到埋在土里的根因。",
    title: "由某个源头产生", explain: "强调追溯来源，不等于一般的“因为”；方向必须是结果 stem from 原因。",
    cols: [["stem from inequality", "源于不平等", "Many health gaps stem from persistent social inequality.", "许多健康差距源于长期存在的社会不平等。"], ["stem largely from", "主要源自", "The delay stemmed largely from a shortage of trained staff.", "延误主要源自受训人员短缺。"]],
    origin: "stem 的“茎、干”义来自古英语 stemn/stefn；stem from 是以植物茎连接根部为图像形成的来源隐喻。", family: ["stem", "stemming"], bridge: "熟词桥（可靠语义桥）：植物 stem 连着 root，因此问题 stem from root causes。", scene: "一条裂缝长成植物茎，根部标签写着 inequality。", landing: "从结果倒查其来源。", brake: "刹车：别把因果方向倒写；pollution stems from industry，不是 industry stems from pollution。", micro: ["The symptoms stem from a deeper problem.", "这些症状源于一个更深层的问题。"],
    ielts: [["The decline in fish stocks may stem from both overfishing and warmer seas.", "鱼类资源下降可能同时源于过度捕捞和海水变暖。", "Reading", "multiple-cause passage"], ["Some educational inequalities stem from differences in access to digital resources.", "一些教育不平等源于数字资源获取方面的差异。", "Writing", "Task 2 explanation"]],
    recall: ["Which side of the causal relation is the subject of stem from?", "stem from 的主语位于因果关系哪一端？", "The result or phenomenon is the subject; the cause follows from.", "结果或现象作主语，原因放在 from 后。"],
    check: ["The loss of biodiversity ______ habitat destruction.", "生物多样性的丧失源于栖息地破坏。", ["stems from", "stems", "is stem from"], 0, "单数主语 loss 接 stems from。"],
  },
  {
    id: 47, word: "derive", ipa: "/dɪˈraɪv/", pos: "transitive or intransitive verb", register: "正式；学术阅读高频",
    coreEn: "to obtain something from a source, or to originate from that source", coreZh: "从……获得；源自；推导出",
    grammar: "derive A from B＝从B获得/推导A；A derives/is derived from B＝A源自B。不可漏掉 from。", image: "一条河从源头分流，知识、收入和词义顺流而下。",
    title: "从来源取得或产生", explain: "可强调主动取得 benefit/income，也可说明词、材料或结论的来源。",
    cols: [["derive benefit from", "从……获益", "Local firms derive considerable benefit from tourism.", "当地企业从旅游业中获得可观收益。"], ["be derived from plants", "由植物提取/源自植物", "Several medicines are derived from tropical plants.", "有几种药物提取自热带植物。"]],
    origin: "来自拉丁语 derivare：de-（从、离开）+ rivus（溪流），原指把水从河道引出。", family: ["derivation", "derivative", "derived"], bridge: "熟词桥：derivative 是“衍生物”；derive 是发生衍生的动作。", scene: "研究员从一条标着 DATA 的河里引出一条结论支流。", landing: "明确“所得物”与“来源”之间的抽取或起源关系。", brake: "刹车：derive A from B 与 A derive from B 方向不同，但 from 后始终是来源。", micro: ["We derive evidence from data; the conclusion derives from that evidence.", "我们从数据中取得证据，结论又源自这些证据。"],
    ielts: [["Many coastal communities derive their income from fishing and small-scale tourism.", "许多沿海社区的收入来自渔业和小规模旅游。", "Reading", "community economy passage"], ["The figures are derived from a national survey of more than ten thousand households.", "这些数字来自一项覆盖一万多个家庭的全国调查。", "Writing", "Task 1 data description"]],
    recall: ["How do derive A from B and A derives from B differ?", "derive A from B 与 A derives from B 有何区别？", "The first has an agent obtaining A; the second states that A originates in B.", "前者表示主体从B取得A；后者陈述A源于B。"],
    check: ["The dye is ______ a native plant.", "这种染料提取自一种本地植物。", ["derived from", "derived of", "deriving to"], 0, "be derived from 表示“源自/提取自”。"],
  },
  {
    id: 48, word: "diversity", ipa: "/daɪˈvɜːsəti/", pos: "uncountable noun; occasionally countable in technical use", register: "中性偏正式；社会与生态话题高频",
    coreEn: "the presence of many different types, characteristics, or people within a whole", coreZh: "多样性；一个整体内部存在多种类型或特征",
    grammar: "diversity of + 复数名词；diversity within/across + 群体；通常不可数。", image: "同一个圆圈里并排站着不同颜色、形状和背景的成员。",
    title: "整体内部的差异丰富度", explain: "关注差异共存的状态，常见 cultural diversity、genetic diversity、biodiversity。",
    cols: [["cultural diversity", "文化多样性", "Migration has increased the city's cultural diversity.", "移民增加了这座城市的文化多样性。"], ["a diversity of species", "多种物种", "The reef supports a remarkable diversity of species.", "这片珊瑚礁支撑着种类惊人的物种。"]],
    origin: "来自拉丁语 diversitas，经法语进入英语；与 diverse、divert 同属“转向不同方向”的历史词族。", family: ["diverse", "diversify", "diversification", "biodiversity"], bridge: "熟词桥：diverse 是“多种不同的”，加 -ity 变成状态名词。", scene: "一座图书馆里每排书都用不同语言，却共同组成一个馆藏。", landing: "不是单纯数量多，而是类型、背景或特征不同。", brake: "刹车：diversity 强调整体内部的差异；difference 常指两个对象之间的具体差别。", micro: ["Diversity means different forms sharing one system.", "多样性意味着不同形式共处于一个系统。"],
    ielts: [["Greater crop diversity can make farming systems more resilient to disease.", "提高作物多样性可以增强农业系统抵御病害的能力。", "Reading", "agriculture passage"], ["Universities benefit from the cultural diversity brought by international students.", "大学受益于国际学生带来的文化多样性。", "Writing", "Task 2 education"]],
    recall: ["What does diversity add beyond the idea of a large number?", "diversity 相比“数量多”多表达了什么？", "It stresses differences in type, identity, or characteristics within a whole.", "它强调一个整体内部在类型、身份或特征上的差异。"],
    check: ["The study measured genetic ______ within the population.", "研究测量了该种群内部的遗传多样性。", ["diversity", "difference", "diverse"], 0, "genetic diversity 是固定学术搭配。"],
  },
  {
    id: 49, word: "variety", ipa: "/vəˈraɪəti/", pos: "countable or uncountable noun", register: "中性；通用和学术语境均常见",
    coreEn: "a range of different things, or a particular type within a class", coreZh: "多种不同事物；某一品种或类型",
    grammar: "a variety of + 复数名词（谓语通常随复数中心理解）；variety in；a variety of plant。", image: "货架摆出许多选项，每个标签既是一个选择，也可能是一个具体品种。",
    title: "可列举的种类范围", explain: "既可表示“多种多样”，又可表示植物、产品等的一个具体品种。",
    cols: [["a wide variety of", "种类繁多的", "The museum offers a wide variety of educational activities.", "博物馆提供种类繁多的教育活动。"], ["a drought-resistant variety", "抗旱品种", "Farmers tested a drought-resistant variety of wheat.", "农民测试了一个抗旱小麦品种。"]],
    origin: "来自拉丁语 varietas（多样、变化），源于 varius（多种的、变化的）。", family: ["vary", "various", "variable", "variation"], bridge: "熟词桥：various 是“各种各样的”；variety 是这些种类构成的范围。", scene: "一只转盘每转一格就变成新的水果品种。", landing: "把不同选项或品种摊开供人看到。", brake: "刹车：a variety 可以是“一个品种”；diversity 通常不指某个具体品种。", micro: ["A variety is one type; a variety of things is a range.", "a variety 可指一个品种，a variety of things 指多种事物。"],
    ielts: [["The market sells a wide variety of foods produced by local farms.", "该市场出售本地农场生产的多种食品。", "Listening", "facility description"], ["Researchers compared three varieties of rice under drought conditions.", "研究人员比较了三种水稻在干旱条件下的表现。", "Reading", "crop experiment"]],
    recall: ["What two countable meanings can variety have?", "variety 有哪两个可数用法？", "A range of different items, and one particular type or cultivar.", "一系列不同事物，以及某个具体类型或品种。"],
    check: ["Scientists developed a new ______ of tomato.", "科学家培育了一种新的番茄品种。", ["variety", "diversity", "various"], 0, "具体“品种”用 a variety of。"],
  },
  {
    id: 50, word: "detect", ipa: "/dɪˈtekt/", pos: "transitive verb", register: "中性偏正式；科学、技术与调查语境高频",
    coreEn: "to discover or notice the presence of something, especially something not obvious", coreZh: "探测到；察觉；发现某种不明显事物的存在",
    grammar: "detect + 名词；detect that-clause；常用被动 be detected in/by。", image: "传感器扫过空白屏幕，一个微弱信号突然亮起。",
    title: "发现隐藏或微弱的存在", explain: "通常是成功发现，不等于仍在寻找；宾语常为 signal、disease、change、fraud。",
    cols: [["detect a signal", "探测到信号", "The device can detect extremely weak signals.", "该设备能探测到极微弱的信号。"], ["detect early signs", "发现早期征兆", "Routine tests detected early signs of kidney disease.", "常规检查发现了肾病的早期征兆。"]],
    origin: "来自拉丁语 detegere：de-（移开）+ tegere（覆盖），历史图像是“揭开覆盖物”。", family: ["detection", "detector", "detectable", "undetected"], bridge: "熟词桥：detector 是“探测器”；detect 是探测器完成的动作。", scene: "机器掀开隐形斗篷，藏着的污染点变成红色。", landing: "寻找结束，目标的存在被发现。", brake: "刹车：seek/search 表示寻找过程；detect 表示已经察觉到。", micro: ["Search first; detect the hidden signal when it appears.", "先搜索；信号出现时将其探测到。"],
    ielts: [["Satellite images can detect changes in forest cover over large areas.", "卫星图像能够探测大范围森林覆盖的变化。", "Reading", "remote-sensing passage"], ["The survey detected a clear difference between urban and rural respondents.", "该调查发现城乡受访者之间存在明显差异。", "Writing", "Task 1 survey report"]],
    recall: ["How does detect differ from search for?", "detect 与 search for 有何区别？", "Search for describes the attempt; detect describes successfully noticing the target's presence.", "search for 描述寻找过程，detect 描述成功察觉目标存在。"],
    check: ["The sensor can ______ a leak before it becomes dangerous.", "传感器能在泄漏变得危险前探测到它。", ["detect", "seek", "look for"], 0, "传感器成功发现泄漏用 detect。"],
  },
  {
    id: 51, word: "seek", ipa: "/siːk/", pos: "transitive verb; irregular (sought, sought)", register: "中性偏正式；政策、研究和正式表达高频",
    coreEn: "to try to find, obtain, or achieve something", coreZh: "寻找；寻求获得；力图实现",
    grammar: "seek + 名词，不说 seek for；seek to do；seek advice/help/permission。过去式和过去分词均为 sought。", image: "一个人朝远处目标伸手，尚未拿到，但正在有目的地追寻。",
    title: "有目的地寻找或争取", explain: "强调意图和努力，不保证成功；比 look for 正式。",
    cols: [["seek professional advice", "寻求专业建议", "Applicants should seek professional advice before signing the contract.", "申请人在签约前应寻求专业建议。"], ["seek to reduce", "力图减少", "The policy seeks to reduce household waste.", "该政策力图减少家庭垃圾。"]],
    origin: "来自古英语 secan，属日耳曼语词源；其不规则过去式 sought 由历史音变形成。", family: ["seeker", "sought", "job-seeking"], bridge: "熟词桥（非词源联想）：seek 还在路上，find 已经找到终点。", scene: "研究团队举着 SEEK 指南针追赶一条尚未捕获的数据线。", landing: "向目标主动靠近，但结果尚未确定。", brake: "刹车：现代标准英语通常直接 seek something，不加 for。", micro: ["We seek evidence before we claim to have found it.", "我们先寻找证据，之后才声称已经找到。"],
    ielts: [["Many young adults seek employment in cities because rural wages are lower.", "许多年轻人因农村工资较低而到城市求职。", "Reading", "migration passage"], ["Governments should seek to balance economic growth with environmental protection.", "政府应力求平衡经济增长与环境保护。", "Writing", "Task 2 policy argument"]],
    recall: ["Does seek imply success, and is for normally required?", "seek 是否意味着成功，通常要加 for 吗？", "It describes an attempt, not success, and normally takes its object directly without for.", "它描述尝试而非成功，通常直接接宾语而不加 for。"],
    check: ["The researchers ______ permission to interview children.", "研究人员申请许可采访儿童。", ["sought", "seeked", "sought for"], 0, "seek 的过去式是 sought，且直接接宾语。"],
  },
  {
    id: 52, word: "isolate", ipa: "/ˈaɪsəleɪt/", pos: "transitive verb", register: "中性偏正式；科学、公共卫生和社会话题高频",
    coreEn: "to separate someone or something from others, physically, socially, or analytically", coreZh: "使隔离、孤立；把某因素单独分离出来",
    grammar: "isolate A from B；become/be isolated from；实验中 isolate a variable/compound。", image: "把一个对象从连接网络中剪下，放进单独的透明盒。",
    title: "从整体中分离", explain: "可指人群隔离、地点与外界隔绝，也可指实验中分离变量或物质。",
    cols: [["isolate patients from others", "将患者与他人隔离", "Hospitals isolated infected patients from other wards.", "医院把感染患者与其他病区隔离。"], ["isolate a variable", "分离变量", "The design helps isolate the effect of temperature.", "该设计有助于单独识别温度的影响。"]],
    origin: "经法语 isoler/意大利语 isolato，关联意大利语 isola（岛），最终来自拉丁语 insula（岛）。", family: ["isolation", "isolated", "isolate (noun)"], bridge: "熟词桥：island 是视觉桥，不是直接构词拆分；isolate 就像把对象放到孤岛。", scene: "一个变量被送到孤岛，其他因素都留在大陆。", landing: "切断与周围的接触或影响。", brake: "刹车：isolated 是被分离的状态；inaccessible 是难以到达，不必真的被人为隔离。", micro: ["Isolate the factor so its effect can be measured.", "把该因素分离出来，才能测量其影响。"],
    ielts: [["The experiment isolated the influence of light by keeping temperature constant.", "实验通过保持温度恒定，分离出了光照的影响。", "Reading", "experimental-method passage"], ["Older residents may become socially isolated when local services close.", "当地服务关闭后，老年居民可能变得与社会隔离。", "Writing", "Task 2 community services"]],
    recall: ["What common preposition marks what an object is separated from?", "哪个常用介词标出对象与什么分离？", "From: isolate A from B.", "from：isolate A from B。"],
    check: ["The study tried to ______ the effect of income from that of education.", "该研究试图区分收入与教育各自的影响。", ["isolate", "inaccessible", "escape"], 0, "实验中把一个影响从另一个影响中分离用 isolate。"],
  },
  {
    id: 53, word: "inaccessible", ipa: "/ˌɪnəkˈsesəbəl/", pos: "adjective", register: "中性偏正式",
    coreEn: "impossible or very difficult to reach, enter, obtain, use, or understand", coreZh: "难以到达、进入、获得、使用或理解的",
    grammar: "inaccessible to + 人/群体；an inaccessible area/source/style。", image: "一扇高悬的门没有楼梯；信息也被锁在同一扇门后。",
    title: "无法顺利接近或利用", explain: "障碍可以是地理、经济、技术或语言，并不必然表示对象被隔离。",
    cols: [["inaccessible to rural residents", "农村居民难以获得", "Specialist care remains inaccessible to many rural residents.", "许多农村居民仍难以获得专科医疗。"], ["a remote, inaccessible region", "偏远难达地区", "The species survives in a remote, inaccessible region.", "该物种生存在一个偏远难达的地区。"]],
    origin: "in-（不）+ accessible；accessible 经法语/拉丁语 accessus，关联 accedere（接近）。", family: ["access", "accessible", "accessibility", "inaccessibility"], bridge: "熟词桥：access 是“进入权限”；in- 把权限关闭。", scene: "地图上的村庄被高山和一把巨锁同时挡住。", landing: "想接近、使用或理解，却被门槛挡住。", brake: "刹车：inaccessible 描述可达性；isolated 描述分离状态，二者并非同义。", micro: ["The service exists, but it is inaccessible to those without internet access.", "服务虽存在，但没有网络的人无法使用。"],
    ielts: [["During the rainy season, several villages become inaccessible by road.", "雨季期间，有几个村庄无法通过公路到达。", "Listening", "travel disruption"], ["Academic information is effectively inaccessible if it is written in language the public cannot understand.", "如果学术信息使用公众无法理解的语言，它实际上就是不可获取的。", "Writing", "Task 2 public communication"]],
    recall: ["Name three kinds of barrier that inaccessible can describe.", "inaccessible 可描述哪三类障碍？", "Physical, economic or technological, and linguistic or intellectual barriers.", "物理障碍、经济或技术障碍，以及语言或理解障碍。"],
    check: ["The archive is ______ to anyone without special permission.", "没有特别许可的人无法查阅该档案。", ["inaccessible", "isolated", "inaccessibly"], 0, "be inaccessible to 表示“某人无法接近/使用”。"],
  },
  {
    id: 54, word: "avoid", ipa: "/əˈvɔɪd/", pos: "transitive verb", register: "中性；高频通用词",
    coreEn: "to prevent something from happening, or to keep away from someone or something", coreZh: "避免某事发生；避开某人或某物",
    grammar: "avoid + 名词/代词/-ing；不说 avoid to do。avoid doing 可表示不让该行为发生。", image: "路径前方出现障碍，行人提前转弯，不与它相撞。",
    title: "提前绕开或阻止", explain: "强调未接触或未发生；不一定包含从已发生危险中逃脱。",
    cols: [["avoid unnecessary waste", "避免不必要的浪费", "Careful planning can avoid unnecessary waste.", "周密规划可以避免不必要的浪费。"], ["avoid using private cars", "避免使用私家车", "Visitors are advised to avoid using private cars at peak times.", "建议游客在高峰时段避免使用私家车。"]],
    origin: "经盎格鲁-法语/古法语进入英语，与 void“空、腾空”的历史路径相关；具体早期构形较复杂，不宜机械拆词。", family: ["avoidance", "avoidable", "unavoidable"], bridge: "熟词桥：avoidable 是“可避免的”；avoid 是采取行动把它绕开。", scene: "一辆车看到写着 WASTE 的坑，提前变道。", landing: "在接触或结果发生之前把它排除。", brake: "刹车：avoid 后接 -ing，不接 to do；escape 常指危险已经临近后成功脱身。", micro: ["Avoid the risk before you need to escape from it.", "在需要逃离风险之前先避开它。"],
    ielts: [["Cities can avoid unnecessary congestion by coordinating road repairs.", "城市可以通过协调道路维修来避免不必要的拥堵。", "Writing", "Task 2 urban policy"], ["Participants were asked to avoid drinking coffee before the sleep study.", "参与者被要求在睡眠研究前避免喝咖啡。", "Listening", "research instructions"]],
    recall: ["Which verb form follows avoid?", "avoid 后接什么动词形式？", "The -ing form, not an infinitive with to.", "接 -ing 形式，不接带 to 的不定式。"],
    check: ["Drivers should avoid ______ through the village at night.", "司机夜间应避免穿过该村庄。", ["travelling", "to travel", "travelled"], 0, "avoid 后接动名词。"],
  },
  {
    id: 55, word: "escape", ipa: "/ɪˈskeɪp/", pos: "verb; countable or uncountable noun", register: "中性；通用词",
    coreEn: "to get free from danger, control, confinement, or an unwanted consequence", coreZh: "逃脱；摆脱；避免受到某种后果",
    grammar: "escape from + 地点/控制；escape + capture/detection/injury（不加 from）；escape doing 较少见且语义受限。", image: "危险已经关上门，一个人从尚未锁死的窗口脱身。",
    title: "从已经逼近的危险中脱身", explain: "可作不及物“逃离某地”，也可直接接 capture、notice、injury 等结果。",
    cols: [["escape from captivity", "逃离囚禁", "The animal escaped from captivity during the storm.", "暴风雨期间，这只动物逃离了圈养地。"], ["escape detection", "逃过侦测", "Small leaks may escape detection for several months.", "小规模泄漏可能数月未被发现。"]],
    origin: "经古法语 escaper，常追溯到晚期拉丁语 excappare；传统解释是 ex-（脱离）+ cappa（斗篷），即从斗篷中挣脱。", family: ["escapee", "escapism", "inescapable"], bridge: "熟词桥：escape key 让电脑退出当前状态；动词也是“脱离控制”。", scene: "一滴污染物从传感器网格的缝隙中溜走。", landing: "危险或控制已存在，但主体成功脱身。", brake: "刹车：escape detection 直接接宾语；escape from the prison 才用 from。", micro: ["The threat was present, but the village escaped serious damage.", "威胁已经存在，但村庄躲过了严重破坏。"],
    ielts: [["Some pollutants escape detection because monitoring stations are too far apart.", "一些污染物因监测站间距过大而未被探测到。", "Reading", "environmental monitoring"], ["Although the coast escaped major damage, inland farms were flooded.", "尽管海岸躲过了严重破坏，内陆农场却被淹没。", "Listening", "news report"]],
    recall: ["When does escape take from, and when does it take a direct object?", "escape 何时接 from，何时直接接宾语？", "Use from for a place or controlling situation; use a direct object for capture, detection, injury, and similar outcomes.", "地点或控制状态用 from；capture、detection、injury 等后果直接作宾语。"],
    check: ["The error escaped ______ during the first review.", "这个错误在第一次审查中没有被发现。", ["detection", "from detection", "to detect"], 0, "固定搭配 escape detection 不加 from。"],
  },
  {
    id: 56, word: "evitable", ipa: "/ˈevɪtəbəl/", pos: "adjective", register: "罕见且正式；现代英语通常用 avoidable",
    coreEn: "capable of being avoided or prevented", coreZh: "可避免的；可防止的（罕见词）",
    grammar: "通常作表语或前置定语，但自然表达优先 avoidable；其反义词 inevitable 远更常见。", image: "写着 inevitable 的巨石被拿掉 in- 后，露出一条其实可以绕开的路。",
    title: "理论上能够避免", explain: "词义无误，但频率很低；雅思写作中刻意使用反而可能显得不自然。",
    cols: [["an evitable error", "可避免的错误", "The loss was evitable, although avoidable would sound more natural here.", "这项损失本可避免，不过此处用 avoidable 更自然。"], ["entirely evitable", "完全可以避免的", "The review described the delay as entirely evitable.", "审查称这次延误完全可以避免。"]],
    origin: "来自拉丁语 evitare（避开）的派生路径；与 inevitable 同属词族。现代 evitable 稀少，不能因去掉 in- 就假定它同样常用。", family: ["inevitable", "inevitably", "avoid"], bridge: "熟词桥：从 inevitable 去掉否定前缀 in-，可帮助认形，但这只是构词提示，不代表使用频率相同。", scene: "一场事故头顶的 IN- 警报被摘下，旁边出现“可预防”出口。", landing: "事件并非必然，本可以被防止。", brake: "刹车：考试写作优先 avoidable；不要为了“高级词”强行用罕见 evitable。", micro: ["If it is evitable, it is avoidable—but avoidable is the normal word.", "evitable 意为可避免，但正常用词是 avoidable。"],
    ielts: [["Many traffic injuries are avoidable; describing them as evitable would be grammatically possible but unusually formal.", "许多交通伤害可以避免；称其为 evitable 在语法上可行，却异常正式。", "Writing", "lexical-choice note"], ["The lecturer called the data loss evitable because duplicate backups should have existed.", "讲师称数据丢失本可避免，因为本应存在重复备份。", "Listening", "university seminar"]],
    recall: ["Is evitable a safe high-frequency replacement for avoidable?", "evitable 是 avoidable 的安全高频替换词吗？", "No. It is valid but rare and formal; avoidable is normally preferable.", "不是。它正确但罕见、正式；通常优先 avoidable。"],
    check: ["For natural IELTS writing, choose the more usual word: The accident was ______.", "雅思写作中请选择更自然的词：这场事故本可避免。", ["avoidable", "evitable", "inevitable"], 0, "evitable 词义正确但罕见；自然表达用 avoidable。"],
  },
];

const buildEntry = (row) => contentEntry({
  appId: row.id,
  synonymGroupId: synonymGroupIdByAppId.get(row.id),
  source: sourceFor(row.id),
  word: row.word,
  ipa: row.ipa,
  pos: row.pos,
  register: row.register,
  coreEn: row.coreEn,
  coreZh: row.coreZh,
  grammarZh: row.grammar,
  imageZh: row.image,
  senses: [{
    label: "CORE",
    titleZh: row.title,
    explanationZh: row.explain,
    collocations: row.cols.map((item) => collocation(...item)),
  }],
  morphology: {
    originZh: row.origin,
    wordFamily: row.family,
    soundHookZh: row.bridge,
    etymologyPolicyZh: "词源说明与记忆联想分开；未把中文谐音当作真实词源。",
    trapZh: row.brake,
  },
  memory: {
    sceneZh: row.scene,
    semanticLandingZh: row.landing,
    absurdImageZh: row.scene,
    microEn: row.micro[0],
    microZh: row.micro[1],
  },
  ieltsExamples: row.ielts.map(authored),
  recall: {
    promptEn: row.recall[0], promptZh: row.recall[1],
    answerEn: row.recall[2], answerZh: row.recall[3],
  },
  checks: [{
    type: "bilingual_context",
    promptEn: row.check[0], promptZh: row.check[1],
    options: row.check[2], answer: row.check[3], explanationZh: row.check[4],
  }],
});

export const entries045To056 = entryRows.map(buildEntry);

const entryByAppId = new Map(entries045To056.map((entry) => [entry.appId, entry]));

const groupRows = [
  {
    groupId: "g020",
    normalizedCandidates: ["thanks to", "stem from", "derive from", "owing to", "due to", "because of", "on account of", "as a result of", "lead to", "because", "since", "for", "in that", "as", "therefore", "hence", "according to"],
    auditZh: "原串混合了介词短语、动词结构、连词和结果副词。according to 表示信息来源而非原因；lead to 的主语是原因、宾语是结果，方向与 stem from 相反；therefore/hence 连接结果句。它们只能按语法位置和因果方向分层，不能机械互换。",
    ruleZh: "thanks to + 原因名词短语，常带归功或反讽；结果 stem from 原因；derive from 强调来源或抽取。先判断句中缺的是介词、谓语还是来源动词，再选词。",
    members: [
      [45, "介词短语，直接把结果归因于后接名词性原因，常带正面归功或反讽语气。"],
      [46, "不及物来源结构，主语是结果，from 后是更深层原因。"],
      [47, "可及物也可不及物，强调从来源获得、提取、推导或起源。"],
    ],
    check: ["The decline in fish stocks ______ overfishing, while many families ______ their income from fishing.", "鱼类资源下降源于过度捕捞，而许多家庭的收入来自捕鱼。", ["stems from; derive", "thanks to; detect", "derives; stem"], 0, "结果 stems from 原因；人/家庭 derive income from 来源。"],
  },
  {
    groupId: "g021",
    normalizedCandidates: ["diversity", "variety", "difference"],
    auditZh: "difference 通常指对象之间的具体差别；diversity 强调整体内部不同类型共存；variety 可指一系列选择，也可指一个具体品种。三者只在“不同”这一语义核上相邻。",
    ruleZh: "谈群体、生态系统内部的差异丰富度用 diversity；谈多种选项或某一品种用 variety；指出A与B的单项差别用 difference。",
    members: [
      [48, "不可数为主，强调一个整体内部在类型、身份或特征上的多样性。"],
      [49, "可指多种选项的范围，也可指一种具体植物或产品品种。"],
    ],
    check: ["The reef supports great biological ______, including several rare ______ of coral.", "这片珊瑚礁拥有很高的生物多样性，其中包括几种稀有珊瑚品种。", ["diversity; varieties", "variety; diversities", "difference; variety"], 0, "整体差异丰富度是 diversity；具体品种复数是 varieties。"],
  },
  {
    groupId: "g022",
    normalizedCandidates: ["detect", "find", "look for", "seek", "search"],
    auditZh: "原串把寻找过程与成功发现混在一起。look for/search/seek 描述尝试；find/detect 表示成功。detect 尤其适合发现不明显信号、疾病或变化，seek 更正式且可表示争取目标。",
    ruleZh: "尚在主动寻找或争取用 seek；仪器、调查或观察已经察觉隐藏存在用 detect。不要把过程词与结果词当成处处可替换。",
    members: [
      [50, "及物动词，表示成功发现不明显事物的存在，常见于科学和调查语境。"],
      [51, "表示有目的地寻找、争取或力图实现，不保证已经成功。"],
    ],
    check: ["Researchers ______ evidence of contamination after they began to ______ its source.", "研究人员开始寻找污染源后，发现了污染证据。", ["detected; seek", "sought; detect", "detected; finded"], 0, "证据被成功发现用 detected；寻找源头用 seek。"],
  },
  {
    groupId: "g023",
    normalizedCandidates: ["isolate", "inaccessible"],
    auditZh: "这两个源表成员并非真正同义词，而是可能在地理语境中共现：被隔绝的地方可能难以到达。isolate 是“使分离”的动词；inaccessible 是“难以接近/使用/理解”的形容词。必须明确保留此不等价关系。",
    ruleZh: "描述分离动作或分析中控制变量用 isolate；描述到达、获取、使用或理解受阻用 inaccessible。不能用 inaccessible 充当 isolate 的被动形式。",
    members: [
      [52, "动词，主动把人、物或变量从其他对象与影响中分离出来。"],
      [53, "形容词，说明目标因物理、经济、技术或语言障碍而难以接近。"],
    ],
    check: ["The mountains ______ the village in winter, making it almost ______ by road.", "群山在冬季使村庄与外界隔绝，导致公路几乎无法到达。", ["isolate; inaccessible", "inaccessible; isolate", "isolate; isolation"], 0, "前空需要分离动作 isolate，后空描述可达性状态 inaccessible。"],
  },
  {
    groupId: "g024",
    normalizedCandidates: ["avoid", "escape", "evitable", "avoidable"],
    auditZh: "avoid 是提前绕开或防止；escape 是危险或控制已逼近后脱身；evitable 是意为“可避免的”但极罕见的形容词，真实写作通常用 avoidable。词性、时间阶段与语域均不同。",
    ruleZh: "风险发生前用 avoid + 名词/-ing；从现实危险、控制或后果中脱身用 escape；评价“可避免”优先 avoidable，只需识别罕见 evitable。",
    members: [
      [54, "及物动词，提前防止或避开，后接名词或 -ing，不接 to do。"],
      [55, "动词/名词，强调从已经存在或逼近的危险、控制或后果中脱身。"],
      [56, "罕见正式形容词，意为可避免；现代自然表达通常不用它替换 avoidable。"],
    ],
    check: ["Regular maintenance helps ______ breakdowns; if one occurs, an emergency system may help passengers ______ injury.", "定期维护有助于避免故障；若故障发生，应急系统可能帮助乘客免受伤害。", ["avoid; escape", "escape; avoid to", "evitable; escape from"], 0, "事前防止 breakdowns 用 avoid；危险发生后躲过 injury 用 escape。"],
  },
];

const buildMember = ([appId, boundaryZh]) => {
  const entry = entryByAppId.get(appId);
  const card = entry.senses[0].collocations[0];
  return {
    appId,
    word: entry.word,
    coreZh: entry.coreZh,
    boundaryZh,
    typicalCollocations: [{ en: card.en, zh: card.zh }],
    example: { en: card.example.en, zh: card.example.zh },
  };
};

const buildGroup = (row) => {
  const source = ielts538SourceGroupById.get(row.groupId);
  if (!source) throw new Error(`Missing IELTS 538 source group ${row.groupId}`);
  return synonymGroup({
    groupId: source.groupId,
    primaryAppId: source.primaryAppId,
    primaryWord: source.primaryWord,
    entryAppIds: [...source.entryAppIds],
    sourceQuestionMethodRaw: source.sourceQuestionMethodRaw,
    sourceQuestionMethodAudit: {
      type: "synonym_candidate_pool",
      normalizedCandidates: row.normalizedCandidates,
      auditZh: row.auditZh,
      mechanicalInterchangeability: false,
    },
    members: row.members.map(buildMember),
    groupRuleZh: row.ruleZh,
    checks: [{
      type: "bilingual_group_contrast",
      promptEn: row.check[0], promptZh: row.check[1],
      options: row.check[2], answer: row.check[3], explanationZh: row.check[4],
    }],
  });
};

export const synonymGroups045To056 = groupRows.map(buildGroup);

const lookItem = ({
  word, ipa, pos, relation, meaningZh,
  targetFormZh, lookalikeFormZh, rootContrastZh, contrastZh, brakeZh,
  targetEn, targetZh, lookEn, lookZh,
}) => ({
  word, ipa, pos, relation, meaningZh,
  targetFormZh, lookalikeFormZh, rootContrastZh, contrastZh, brakeZh,
  targetExample: { en: targetEn, zh: targetZh },
  lookalikeExample: { en: lookEn, zh: lookZh },
});

const lookRows = [
  [45, "thanks to*", {
    word: "thanks for", ipa: "/ˈθæŋks fɔː(r)/", pos: "fixed phrase", relation: "同词干短语·介词改变语法角色", meaningZh: "感谢……（某事、某行为）",
    targetFormZh: "thanks to + 原因，构成因果介词短语；源表星号是考点标记，不属于实际拼写。", lookalikeFormZh: "thanks for + 被感谢的事物/行为，是致谢表达，不是因果连接词。",
    rootContrastZh: "两者都直接使用 thank/thanks，同根同形；区别完全来自介词 to 与 for 所建立的关系。", contrastZh: "thanks to the rain＝由于下雨；thanks for the help＝感谢帮助。前者引原因，后者表达致谢。", brakeZh: "看到结果与原因就选 thanks to；真正对人表示感谢某事用 thanks for。",
    targetEn: "Thanks to early warnings, residents left safely.", targetZh: "由于预警及时，居民安全撤离。", lookEn: "Thanks for responding to the warning so quickly.", lookZh: "感谢你如此迅速地响应警报。",
  }],
  [46, "stem from", {
    word: "stem", ipa: "/stem/", pos: "n.; v.", relation: "同词形·短语义与本义分化", meaningZh: "茎；主干；阻止、遏制",
    targetFormZh: "stem from 是固定来源结构：结果由某原因产生。", lookalikeFormZh: "stem 单独作名词是植物茎/主干；作及物动词常指 stem the flow/tide，遏制。",
    rootContrastZh: "两者是同一个日耳曼语 stem 的语义发展；来源义借用植物茎连接根部的隐喻。", contrastZh: "the problem stems from poverty 是“问题源于贫困”；stem the spread 是“遏制传播”，方向和及物性均不同。", brakeZh: "有 from 就沿茎向根因追溯；直接接 spread/flow 则是阻止。",
    targetEn: "The conflict stems from competition for water.", targetZh: "冲突源于对水资源的争夺。", lookEn: "Early action may stem the spread of the disease.", lookZh: "尽早行动可能遏制疾病传播。",
  }],
  [47, "derive", {
    word: "deprive", ipa: "/dɪˈpraɪv/", pos: "v.", relation: "拼写相近·不同拉丁词根", meaningZh: "剥夺；使失去",
    targetFormZh: "derive 来自拉丁语 derivare，含 rivus“溪流”，表示从来源引出。", lookalikeFormZh: "deprive 来自拉丁语 deprivare，关联 privus“个人的、被分开的”，现代表示剥夺。",
    rootContrastZh: "两词共享表面 de-...-ive/-ive 轮廓，但核心分别是 riv“溪流”与 priv“剥离、个人”，不是同一现代词根。", contrastZh: "derive benefit from tourism＝从旅游获益；deprive residents of sleep＝使居民失去睡眠。", brakeZh: "derive 后看 from“来源”；deprive someone of“夺走”。",
    targetEn: "The region derives income from tourism.", targetZh: "该地区从旅游业获得收入。", lookEn: "Night-time noise deprives residents of sleep.", lookZh: "夜间噪声使居民无法入睡。",
  }],
  [48, "diversity", {
    word: "adversity", ipa: "/ədˈvɜːsəti/", pos: "n.", relation: "拼写相近·前缀与词义分化", meaningZh: "逆境；苦难",
    targetFormZh: "diversity 来自 diversitas，关联 diverse，核心是不同类型共存。", lookalikeFormZh: "adversity 来自 adversitas，关联 adverse，核心是转而对立、不利。",
    rootContrastZh: "两词都可追溯到拉丁语 vertere“转”，但 di-/dis- 指向分开多样，ad- 路径发展为相对、敌对和不利。", contrastZh: "cultural diversity 是文化多样性；overcome adversity 是克服逆境。", brakeZh: "div- 想 diverse 多样；advers- 想 adverse 不利。",
    targetEn: "The city values cultural diversity.", targetZh: "这座城市重视文化多样性。", lookEn: "The community showed resilience in adversity.", lookZh: "这个社区在逆境中展现出韧性。",
  }],
  [49, "variety", {
    word: "variability", ipa: "/ˌveəriəˈbɪləti/", pos: "n.", relation: "同根词·名词落点不同", meaningZh: "可变性；变异程度",
    targetFormZh: "variety 来自 varius/varietas，指不同种类的范围或一个具体品种。", lookalikeFormZh: "variability 由 variable + -ity 构成，指某一量或特征变化的程度。",
    rootContrastZh: "两者同属 vari“变化、多种”词族；variety 落在种类，variability 落在随时间或样本波动的性质。", contrastZh: "a variety of crops＝多种作物；rainfall variability＝降雨变率。", brakeZh: "问“有多少种”用 variety；问“波动多大”用 variability。",
    targetEn: "The farm grows a variety of crops.", targetZh: "该农场种植多种作物。", lookEn: "Rainfall variability makes planning difficult.", lookZh: "降雨变率使规划变得困难。",
  }],
  [50, "detect", {
    word: "defect", ipa: "/ˈdiːfekt/", pos: "n.", relation: "拼写相近·不同拉丁词根", meaningZh: "缺陷；瑕疵",
    targetFormZh: "detect 来自 detegere：de- + tegere“覆盖”，即揭开并发现。", lookalikeFormZh: "defect 来自 defectus/deficere，关联 facere“做”，表示未达到、存在缺陷。",
    rootContrastZh: "两词只差 t/f 且都以 de- 开头，但 teg“覆盖”与 fec/fic“做、形成”不同。", contrastZh: "detect a defect 是发现一个缺陷；前者是动作，后者是被发现的问题。", brakeZh: "t 的 detect 是探测动作；f 的 defect 是 fault。",
    targetEn: "The sensor detected a defect in the pipe.", targetZh: "传感器探测到管道中的一处缺陷。", lookEn: "The defect allowed water to leak out.", lookZh: "这处缺陷导致水泄漏。",
  }],
  [51, "seek", {
    word: "seep", ipa: "/siːp/", pos: "v.", relation: "拼写与读音相近·不同词源", meaningZh: "渗出；渗入",
    targetFormZh: "seek 是古英语来源的“寻找、争取”，过去式 sought。", lookalikeFormZh: "seep 可能来自低地德语或相关日耳曼语形式，表示液体缓慢渗流；更深来源不确定。",
    rootContrastZh: "两词现代只差末字母 k/p，虽都属日耳曼语背景，但没有可靠依据把它们视为同一直接词根。", contrastZh: "seek advice＝寻求建议；water seeps through soil＝水渗过土壤。", brakeZh: "seek 的 k 像 keep looking；seep 的 p 想水滴穿孔。此句仅为非词源联想。",
    targetEn: "Residents sought advice from an engineer.", targetZh: "居民向一名工程师寻求建议。", lookEn: "Water seeped through cracks in the wall.", lookZh: "水从墙缝中渗了进来。",
  }],
  [52, "isolate", {
    word: "insulate", ipa: "/ˈɪnsjəleɪt/", pos: "v.", relation: "同根形近·现代功能分化", meaningZh: "使隔热、绝缘；使免受影响",
    targetFormZh: "isolate 经 isola“岛”路径，表示从整体中分离。", lookalikeFormZh: "insulate 来自拉丁语 insula“岛”的派生路径，原始图像也是使成孤岛，现代常指隔热/绝缘。",
    rootContrastZh: "两词远源都关联拉丁语 insula“岛”；isolate 强调分离对象，insulate 强调用材料或屏障阻断热、电或影响。", contrastZh: "isolate a patient/variable；insulate a roof/wire。", brakeZh: "实验与隔离人群用 isolate；保温和绝缘材料用 insulate。",
    targetEn: "Researchers isolated the effect of temperature.", targetZh: "研究人员分离出了温度的影响。", lookEn: "The builders insulated the roof with recycled fibre.", lookZh: "建筑工人用再生纤维为屋顶保温。",
  }],
  [53, "inaccessible", {
    word: "inescapable", ipa: "/ˌɪnɪˈskeɪpəbəl/", pos: "adj.", relation: "拼写相近·不同词根", meaningZh: "不可逃避的；无法摆脱的",
    targetFormZh: "inaccessible = in- + accessible，核心是不能 access“接近、使用”。", lookalikeFormZh: "inescapable = in- + escapable，核心是不能 escape“逃脱”。",
    rootContrastZh: "两词共享否定前缀 in- 和 -able，但 access 与 escape 来自不同历史路径。", contrastZh: "an inaccessible village＝难以到达的村庄；an inescapable conclusion＝无法回避的结论。", brakeZh: "access 问能否进去；escape 问能否出来。",
    targetEn: "The archive is inaccessible without permission.", targetZh: "未经许可无法访问该档案。", lookEn: "The evidence leads to an inescapable conclusion.", lookZh: "证据导向一个无法回避的结论。",
  }],
  [54, "avoid", {
    word: "devoid", ipa: "/dɪˈvɔɪd/", pos: "adj.", relation: "拼写相近·共享 void 远源路径但构式不同", meaningZh: "完全没有……的；缺乏……的",
    targetFormZh: "avoid 经法语路径与 void“空开”相关，现代是及物动词“避开”。", lookalikeFormZh: "devoid 由 de- + void 的历史路径形成，现代固定搭配 be devoid of。",
    rootContrastZh: "两词都与 void 的“空、移开”历史语义有关，但现代词性与句法已完全分化。", contrastZh: "avoid unnecessary travel＝避免不必要出行；a room devoid of light＝没有光的房间。", brakeZh: "avoid 直接接宾语；devoid 必须进入 be devoid of 结构。",
    targetEn: "Visitors should avoid touching the exhibits.", targetZh: "游客应避免触摸展品。", lookEn: "The underground room was devoid of natural light.", lookZh: "地下房间完全没有自然光。",
  }],
  [55, "escape", {
    word: "scrape", ipa: "/skreɪp/", pos: "v.; n.", relation: "拼写与读音相近·不同来源", meaningZh: "刮擦；擦伤；勉强通过",
    targetFormZh: "escape 经古法语 escaper，表示脱离控制或危险。", lookalikeFormZh: "scrape 来自古诺斯语/日耳曼语刮擦词族，表示表面摩擦。",
    rootContrastZh: "两词共享 -scape/-scrape 的视觉轮廓和 /skeɪp/ 音段，但历史词根不同。", contrastZh: "escape from prison＝逃离监狱；scrape paint off a wall＝刮掉墙漆。", brakeZh: "escape 是出去；scrape 多一个 r，表面被刮。此为非词源记忆。",
    targetEn: "The animal escaped from its enclosure.", targetZh: "这只动物逃出了围栏。", lookEn: "Workers scraped old paint from the wall.", lookZh: "工人刮掉了墙上的旧漆。",
  }],
  [56, "evitable", {
    word: "inevitable", ipa: "/ɪnˈevɪtəbəl/", pos: "adj.", relation: "同根词·否定前缀形成反义", meaningZh: "不可避免的；必然发生的",
    targetFormZh: "evitable 来自 evitare 的派生路径，表示可避免，但现代极罕见。", lookalikeFormZh: "inevitable = in-（不）+ evitable，表示不可避免，且是高频常用词。",
    rootContrastZh: "两词直接同根，in- 明确否定“可避免”；但去掉前缀后的 evitable 在现代使用频率远低于构词对称所暗示的程度。", contrastZh: "an evitable loss 语法正确但生硬；an inevitable delay 是自然高频表达。表示“可避免”优先 avoidable。", brakeZh: "看到 in- 是“不可避免”；没有 in- 虽可解释为“可避免”，输出时优先 avoidable。",
    targetEn: "The reviewer called the error evitable, though avoidable is more natural.", targetZh: "审查者称该错误本可避免，不过 avoidable 更自然。", lookEn: "Some delay was inevitable during the evacuation.", lookZh: "疏散过程中出现一些延误是不可避免的。",
  }],
];

export const lookalikePacks045To056 = lookRows.map(([appId, word, config]) =>
  lookalikePack(appId, word, [lookItem(config)]),
);

