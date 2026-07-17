import { compactSet, vocab } from "./compact.js";

// Words 406–435. This file is intentionally standalone and does not register itself.
const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });
const U = (...x) => [x.slice(0, 4), x.slice(4, 8)];
const C = (word, ipa, meaningZh, role, contrast, en, zh) => [word, meaningZh, role, contrast, en, zh, ipa];
const E = (number, word, ipa, pos, rawNote, coreEn, coreZh, uses, comparisons, rootZh, trapZh, imageZh) => {
  const phrases = uses.flat(); const first = phrases[0];
  const config = vocab(number, word, ipa, pos, rawNote, coreEn, coreZh, imageZh, phrases, comparisons,
    M(`声音记忆（非词源）：把 ${word} 的读音与“${coreZh}”画面绑定；这只是记忆桥，不是真实词源。`, rootZh,
      `英文桥：先记固定搭配 “${first[0]}”，再由搭配反推 ${word}。`, imageZh,
      `语义落点：${coreZh}；先判断对象、方向和语域。`, trapZh, first[2], first[3]),
    [`What is the precise core of “${word}”?`, `${word} 的准确核心是什么？`, coreEn, coreZh],
    [`Choose “${word}” when the context means: ${coreEn}.`, `语境表示“${coreZh}”时，应选择哪个词？`, `The required word is “${word}”.`, `应选 ${word}。`],
    ["unrelated", "opposite", "neutral"]);
  config.register = "GRE 高频 · 正式 / 书面"; return config;
};

const all = [
  E(406, "concave", "/ˈkɒn.keɪv/", "adjective · noun", "凹的：curved", "curved inward like the inner surface of a bowl", "向内弯曲的；凹的",
    [U("a concave surface", "凹面", "The mirror has a concave surface.", "这面镜子有凹面。", "a concave lens", "凹透镜", "A concave lens spreads the light rays.", "凹透镜使光线发散。")],
    [C("curved", "/kɜːvd/", "弯曲的", "原表注解 · 上位词", "curved 可向任一方向；concave 专指向内凹。", "The road is gently curved.", "道路微微弯曲。"), C("convex", "/ˈkɒn.veks/", "凸的", "反义辨析", "convex 向外鼓；concave 向内陷。", "The lens has a convex outer face.", "镜片外表面是凸的。")],
    "可靠词源：来自 Latin concavus“中空、凹陷”，由 con- + cavus“空的”构成。", "易混刹车：记 cave 像凹进去；concave inward，convex outward。", "一只碗把月光向内弯成微笑。"),

  E(407, "conceal", "/kənˈsiːl/", "transitive verb", "隐藏，隐瞒：prevent disclosure", "to hide or prevent something from being seen or disclosed", "隐藏；隐瞒；阻止披露",
    [U("conceal the truth", "隐瞒真相", "The memo concealed the truth from investors.", "备忘录向投资者隐瞒了真相。", "conceal evidence", "隐藏证据", "He was accused of concealing evidence.", "他被指控隐藏证据。")],
    [C("prevent disclosure", "/prɪˌvent dɪsˈkləʊ.ʒər/", "阻止披露", "原表注解 · 定义", "该短语说明目的；conceal 还可遮住实体不让看见。", "The rule prevents disclosure of private data.", "该规则阻止私人数据泄露。"), C("hide", "/haɪd/", "隐藏", "近义词", "hide 最普通；conceal 较正式，常暗示故意隐瞒事实。", "She hid the key under a stone.", "她把钥匙藏在石头下。")],
    "可靠词源：来自 Latin concelare“隐藏”，经 Old French 进入英语。", "易混刹车：conceal 是不让看见/知道；concede 是承认。", "真相戴上隐形斗篷，躲进一只透明盒子。"),

  E(408, "concede", "/kənˈsiːd/", "verb", "承认：grant；停止抵抗：cease resistance", "to admit reluctantly; to yield or stop resisting", "勉强承认；让步；停止抵抗",
    [U("concede that the claim is true", "承认说法属实", "She conceded that the claim was true.", "她承认该说法属实。", "concede a point", "承认一点", "The lawyer conceded one minor point.", "律师承认了一个次要点。"), U("concede defeat", "认输", "The candidate conceded defeat at midnight.", "候选人在午夜认输。", "refuse to concede", "拒绝停止抵抗", "The defenders refused to concede.", "守军拒绝投降。")],
    [C("grant", "/ɡrɑːnt/", "承认；准予", "原表注解 · 承认", "grant 可爽快承认或给予；concede 常是不情愿地承认对方有理。", "I grant that the task is difficult.", "我承认任务很难。"), C("cease resistance", "/siːs rɪˈzɪs.təns/", "停止抵抗", "原表注解 · 屈服", "该短语概括认输义；concede 也可仅让出一点而非完全投降。", "The army ceased resistance.", "军队停止抵抗。"), C("admit", "/ədˈmɪt/", "承认", "近义词", "admit 可承认事实或过错；concede 常在辩论和竞争中让步。", "He admitted the error.", "他承认错误。")],
    "可靠词源：来自 Latin concedere“让开、准许”，由 con- + cedere“行走、让步”构成。", "易混刹车：concede /-seed/ 是承认；conceal /-seal/ 是隐瞒。", "一面白旗先承认对方有理，再把最后一座城让出去。"),

  E(409, "concentrate", "/ˈkɒn.sən.treɪt/", "verb · noun", "集中：focus；浓缩：less dilute；聚集：together", "to focus, gather together, or make less dilute", "集中注意或力量；聚集；浓缩",
    [U("concentrate on the task", "专注任务", "Please concentrate on the task.", "请专注于任务。", "concentrate resources", "集中资源", "The agency concentrated resources in rural areas.", "该机构把资源集中到农村。"), U("concentrate the solution", "浓缩溶液", "Heating concentrates the solution.", "加热使溶液浓缩。", "concentrated juice", "浓缩果汁", "The factory exports concentrated juice.", "工厂出口浓缩果汁。"), U("people concentrate in cities", "人口聚集在城市", "Jobs cause people to concentrate in cities.", "就业机会使人口聚集在城市。", "concentrate the troops", "集结部队", "The general concentrated the troops near the border.", "将军把部队集结在边境附近。")],
    [C("focus", "/ˈfəʊ.kəs/", "集中注意", "原表注解 · 注意力", "focus 更常用；concentrate 可指精神、资源或实体聚集。", "Focus on the main question.", "专注主要问题。"), C("less dilute", "/les daɪˈluːt/", "稀释程度更低", "原表注解 · 浓缩", "less dilute 是结果；concentrate 是去除溶剂提高强度的动作。", "This sample is less dilute.", "该样本稀释程度较低。"), C("together", "/təˈɡeð.ər/", "聚到一起", "原表注解 · 聚集", "together 只说位置；concentrate 强调密集于一点或区域。", "The children sat together.", "孩子们坐在一起。")],
    "可靠构词：con-“共同” + center 相关词干 + -ate，核心是“带到中心”。", "易混刹车：concentrate on；concentrated 是高浓度，不是 distracted。", "所有思想、士兵和果汁都挤进同一个小圆心。"),

  E(410, "concerted", "/kənˈsɜː.tɪd/", "adjective", "共同完成的：accomplished together", "jointly planned and carried out through coordinated effort", "共同筹划并协调完成的",
    [U("a concerted effort", "共同努力", "A concerted effort reduced the waiting time.", "共同努力缩短了等待时间。", "concerted action", "协调行动", "The crisis requires concerted action by all agencies.", "危机需要所有机构协调行动。")],
    [C("accomplished together", "/əˌkʌm.plɪʃt təˈɡeð.ər/", "共同完成", "原表注解 · 定义", "共同完成可能偶然；concerted 还强调事先协调和共同目标。", "The project was accomplished together.", "项目由大家共同完成。"), C("coordinated", "/kəʊˈɔː.dɪ.neɪ.tɪd/", "协调一致的", "近义词", "coordinated 强调配合；concerted 常修饰 effort/action，强调集中力量。", "They launched a coordinated response.", "他们发起协调一致的应对。")],
    "可靠词源：concert 作动词“协同安排”的过去分词；最终源自 Latin concertare。", "易混刹车：concerted effort 不是音乐会努力，而是多方协调努力。", "五把不同乐器不开音乐会，却共同搬走了一座山。"),

  E(411, "conciliate", "/kənˈsɪl.i.eɪt/", "transitive verb", "平息，抚慰：lessen the anger；调解：compatible, reconcile", "to soothe anger, win goodwill, or reconcile opposing sides", "平息怒气；赢得善意；调解使和解",
    [U("conciliate an angry customer", "安抚愤怒顾客", "The manager tried to conciliate the angry customer.", "经理试图安抚愤怒顾客。", "a conciliatory gesture", "和解姿态", "A refund was offered as a conciliatory gesture.", "退款被作为和解姿态提出。"), U("conciliate rival groups", "调解敌对群体", "The mediator conciliated the rival groups.", "调解员促使敌对群体和解。", "conciliate conflicting interests", "协调冲突利益", "The law attempts to conciliate conflicting interests.", "该法律试图协调冲突利益。")],
    [C("lessen the anger", "/ˌles.ən ði ˈæŋ.ɡər/", "减轻愤怒", "原表注解 · 安抚", "这是 conciliate 的即时目的；它通常通过让步或善意实现。", "Her apology lessened the anger.", "她的道歉缓和了愤怒。"), C("reconcile", "/ˈrek.ən.saɪl/", "调和；使和解", "原表注解 · 近义", "reconcile 强调恢复关系或兼容矛盾；conciliate 强调先赢得善意、消除敌意。", "They reconciled after years apart.", "分开多年后他们和解。"), C("appease", "/əˈpiːz/", "安抚；姑息", "近义词", "appease 可含以让步换取暂时平静；conciliate 更积极指建立善意。", "The payment failed to appease protesters.", "付款未能安抚抗议者。")],
    "可靠词源：来自 Latin conciliare“使联合、赢得”，与 council 概念相关但不是现代直接派生。", "易混刹车：conciliate 是主动安抚；concede 是承认或让步。", "一只愤怒茶壶被道歉糖安抚后，给两个杯子主持和解。"),

  E(412, "concise", "/kənˈsaɪs/", "adjective", "简洁的：brevity", "brief yet complete and clear", "简洁而完整清楚的",
    [U("a concise summary", "简明摘要", "The report begins with a concise summary.", "报告以简明摘要开头。", "be concise", "言简意赅", "Please be concise in your reply.", "回复请言简意赅。")],
    [C("brevity", "/ˈbrev.ə.ti/", "简短", "原表注解 · 性质", "brevity 是篇幅短这一性质；concise 赞扬短而不漏要点。", "Brevity improved the speech.", "简短使演讲更好。"), C("terse", "/tɜːs/", "简短生硬的", "近义词", "terse 常因过短显得生硬；concise 通常褒义。", "His terse reply sounded rude.", "他简短的回复听起来无礼。")],
    "可靠词源：来自 Latin concidere“切碎、截短”，由 con- + caedere“切”相关形式构成。", "易混刹车：concise = short and complete；laconic 可能冷淡，abridged 是删节版。", "一把剪刀剪掉废话，却完整保留了所有要点。"),

  E(413, "concord", "/ˈkɒŋ.kɔːd/", "noun", "一致，和睦：harmony, agreement", "agreement and peaceful harmony", "一致；和睦；协调",
    [U("live in concord", "和睦相处", "The communities learned to live in concord.", "这些社区学会了和睦相处。", "concord between nations", "国家间的和睦一致", "The pact restored concord between the nations.", "公约恢复了国家间的和睦。")],
    [C("harmony", "/ˈhɑː.mə.ni/", "和谐", "原表注解 · 状态", "harmony 范围广；concord 较正式，常指意见或群体关系一致。", "The choir sang in harmony.", "合唱团和声演唱。"), C("agreement", "/əˈɡriː.mənt/", "一致；协议", "原表注解 · 意见", "agreement 可是具体合同；concord 更像持续和睦状态。", "They reached an agreement on costs.", "他们就费用达成协议。"), C("discord", "/ˈdɪs.kɔːd/", "不和", "反义辨析", "discord 是意见或声音不协调；concord 是和谐一致。", "The issue created discord in the group.", "该问题在团体中造成不和。")],
    "可靠词源：来自 Latin concordia，con-“共同” + cor/cord-“心”，即同心。", "易混刹车：concord 是和睦；concur 是同意/同时发生；Concorde 是专名。", "两颗心敲出同一节拍，让争吵的钟表握手言和。"),

  E(414, "concur", "/kənˈkɜːr/", "verb", "同意：agreement；同一时间发生、存在：same time；团结合作：joint", "to agree; to occur at the same time; to act jointly", "同意；同时发生；协同作用",
    [U("concur with the conclusion", "同意结论", "Most reviewers concurred with the conclusion.", "多数评审同意这一结论。", "concur that", "一致认为", "Experts concur that the risk is small.", "专家一致认为风险很小。"), U("events concur", "事件同时发生", "Several unusual events concurred that week.", "那周几件异常事件同时发生。", "concurrent changes", "同时发生的变化", "The failure followed several concurrent changes.", "故障发生在几项同时变化之后。"), U("causes concur to produce", "多个因素共同导致", "Several causes concurred to produce the crisis.", "多个因素共同导致危机。", "concur in a decision", "共同作出决定", "All judges concurred in the decision.", "所有法官共同赞同该判决。")],
    [C("agreement", "/əˈɡriː.mənt/", "同意", "原表注解 · 意见", "agreement 是名词；concur 是正式动词，常接 with/in/that。", "There was general agreement.", "大家普遍同意。"), C("same time", "/ˌseɪm ˈtaɪm/", "同一时间", "原表注解 · 同时", "same time 是时间关系；concur 可正式表示事件同时发生。", "Both alarms rang at the same time.", "两个警报同时响起。"), C("joint", "/dʒɔɪnt/", "共同的", "原表注解 · 协作", "joint 描写共同性质；concur 表示多种力量共同起作用。", "They issued a joint statement.", "他们发表联合声明。")],
    "可靠词源：来自 Latin concurrere“共同奔跑、汇合”，由 con- + currere“跑”构成。", "易混刹车：concur with a person/view；concurrent 是同时的；concord 是和睦名词。", "三个意见一起奔向同一个终点，同时举牌表示同意。"),

  E(415, "condescending", "/ˌkɒn.dɪˈsen.dɪŋ/", "adjective", "摆出高人一等的姿态的：patronizingly superior", "showing a patronizing sense of superiority", "摆出高人一等姿态的；屈尊俯就的",
    [U("a condescending tone", "居高临下的语气", "Her condescending tone offended the trainees.", "她居高临下的语气冒犯了学员。", "a condescending smile", "屈尊俯就的微笑", "He gave us a condescending smile.", "他朝我们露出一个屈尊俯就的微笑。")],
    [C("patronizingly superior", "/ˈpeɪ.trə.naɪ.zɪŋ.li suːˈpɪə.ri.ər/", "以高人一等的方式对待人", "原表注解 · 定义", "该短语完整揭示贬义：表面友善，实际暗示对方低等。", "She spoke in a patronizingly superior manner.", "她以自以为高人一等的方式说话。"), C("patronizing", "/ˈpæt.rə.naɪ.zɪŋ/", "自以为高人一等的", "近义词", "patronizing 与 condescending 基本同义；后者保留从高处降下来的图像。", "His patronizing advice irritated me.", "他居高临下的建议惹恼了我。")],
    "可靠构词：condescend + -ing；源自 Latin condescendere“共同下降”，后发展为屈尊。", "易混刹车：condescending 不是单纯 kind；其中含 superiority 的冒犯感。", "一个高帽子弯腰给蚂蚁讲最简单的加法，还不断夸自己耐心。"),

  E(416, "condign", "/kənˈdaɪn/", "adjective", "应得的，恰当的：deserved", "fully deserved and appropriate, especially as punishment", "完全应得且恰当的，尤指惩罚",
    [U("condign punishment", "罪有应得的惩罚", "The tyrant finally received condign punishment.", "暴君最终受到罪有应得的惩罚。", "a condign penalty", "恰如其分的刑罚", "The court imposed a condign penalty.", "法院判处了恰如其分的刑罚。")],
    [C("deserved", "/dɪˈzɜːvd/", "应得的", "原表注解 · 定义", "deserved 可用于奖励或惩罚；condign 罕见正式，尤其搭配 punishment。", "The team earned a deserved victory.", "该队赢得实至名归的胜利。"), C("appropriate", "/əˈprəʊ.pri.ət/", "恰当的", "近义词", "appropriate 只表示合适；condign 还判断对象在道德上应受此待遇。", "The response was appropriate.", "回应很恰当。")],
    "可靠词源：来自 Latin condignus“完全相配、值得”，con- 强化 dignus“值得的”。", "易混刹车：condign 通常修饰 punishment/retribution，不要与 consign“交付”混淆。", "一架正义天平给罪行量身定做了一件完全合适的刑罚外套。"),

  E(417, "condole", "/kənˈdəʊl/", "intransitive verb", "表达同情：sympathetic", "to express sympathy and sorrow, especially after a loss", "慰问；对损失表达同情与哀痛",
    [U("condole with the family", "向家属表示慰问", "Neighbors condoled with the family after the loss.", "邻居们在噩耗后慰问家属。", "condole over a death", "对死亡表示哀悼", "They came to condole over his death.", "他们前来对他的去世表示哀悼。")],
    [C("sympathetic", "/ˌsɪm.pəˈθet.ɪk/", "同情的", "原表注解 · 态度", "sympathetic 是态度形容词；condole 是正式表达哀痛的动作。", "She gave a sympathetic reply.", "她作出同情的回应。"), C("console", "/kənˈsəʊl/", "安慰", "易混近义词", "console 试图减轻悲伤；condole 主要表达自己与对方同悲。", "Friends consoled the grieving child.", "朋友们安慰悲伤的孩子。")],
    "可靠词源：来自 Late Latin condolere“共同悲痛”，con- + dolere“痛苦”。", "易混刹车：condole with 人 over 事；condone 是宽恕；console 是安慰。", "一滴眼泪敲门，说自己愿意和整家人一起悲伤。"),

  E(418, "condone", "/kənˈdəʊn/", "transitive verb", "宽恕；忽视：forgive", "to forgive, overlook, or tacitly accept wrongdoing", "宽恕、忽视或默许不当行为",
    [U("condone violence", "纵容暴力", "The policy must not condone violence.", "政策绝不能纵容暴力。", "refuse to condone misconduct", "拒绝宽恕不当行为", "The board refused to condone the misconduct.", "董事会拒绝宽恕该不当行为。")],
    [C("forgive", "/fəˈɡɪv/", "原谅", "原表注解 · 近义", "forgive 常是个人放下怨恨；condone 暗示不追究甚至默许错误继续。", "She forgave the careless remark.", "她原谅了那句无心之言。"), C("overlook", "/ˌəʊ.vəˈlʊk/", "忽视；不追究", "近义词", "overlook 可无意漏看；condone 通常是明知错误仍接受。", "The inspector overlooked a minor defect.", "检查员漏看了一个小缺陷。")],
    "可靠词源：来自 Latin condonare“完全赠予、宽免”，con- + donare“给予”。", "易混刹车：condone 通常接负面行为；不能用来表示赞同好事。", "法官看见错误后把惩罚橡皮擦收进口袋，默许它继续跳舞。"),

  E(419, "conducive", "/kənˈdjuː.sɪv/", "adjective", "有益的，有促进作用的：promote", "tending to promote or help bring about a result", "有助于产生某结果的；有促进作用的",
    [U("conducive to learning", "有利于学习", "A quiet room is conducive to learning.", "安静房间有利于学习。", "conditions conducive to growth", "有利于增长的条件", "Stable rules create conditions conducive to growth.", "稳定规则创造有利于增长的条件。")],
    [C("promote", "/prəˈməʊt/", "促进", "原表注解 · 功能", "promote 是动词；conducive 是形容词，说明环境倾向于促进结果。", "Exercise promotes good health.", "运动促进健康。"), C("favorable", "/ˈfeɪ.vər.ə.bəl/", "有利的", "近义词", "favorable 可表示赞成或有利；conducive 必须接 to，强调因果促进。", "The weather was favorable.", "天气有利。")],
    "可靠词源：来自 Latin conducere“引向、带来”，由 con- + ducere“引导”构成。", "易混刹车：固定搭配 conducive to + 名词/动名词，不用 conducive for。", "安静、光线和咖啡排成队，把一颗想法引向成长。"),

  E(420, "confident", "/ˈkɒn.fɪ.dənt/", "adjective", "有信心的，自信的：assurance, self-reliance", "feeling or showing assurance and self-reliance; certain", "有把握的；自信而自主的；确信的",
    [U("feel confident about", "对……有信心", "She feels confident about the interview.", "她对面试有信心。", "a confident speaker", "自信的演讲者", "The confident speaker answered calmly.", "自信的演讲者从容作答。")],
    [C("assurance", "/əˈʃʊə.rəns/", "自信；保证", "原表注解 · 心态", "assurance 是自信这一名词；confident 描写人或判断有把握。", "He spoke with assurance.", "他自信地讲话。"), C("self-reliance", "/ˌself.rɪˈlaɪ.əns/", "自立", "原表注解 · 自主", "self-reliance 强调依靠自己；confidence 强调相信自己能成功。", "Travel taught her self-reliance.", "旅行教会她自立。"), C("certain", "/ˈsɜː.tən/", "确信的", "近义词", "certain 更强调事实无疑；confident 可依据判断而有较强把握。", "I am certain of the date.", "我确信日期无误。")],
    "可靠词源：来自 Latin confidere“完全信赖”，con- 强化 fidere“信任”。", "易混刹车：confident 是自信的；confidant 是知己；confidential 是机密的。", "一把自信雨伞相信自己能挡住整片海。"),

  E(421, "confine", "/kənˈfaɪn/", "verb · noun", "禁闭，监禁：imprison；限制：limits", "to imprison or restrict within boundaries", "禁闭、监禁；限制在边界内",
    [U("confine someone to a cell", "把某人关在牢房", "The guards confined him to a small cell.", "警卫把他关在一间小牢房里。", "be confined to bed", "卧床不起", "She was confined to bed for a week.", "她卧床一周。"), U("confine discussion to one issue", "把讨论限制在一个问题", "Please confine discussion to the budget.", "请把讨论限制在预算问题上。", "within the confines of", "在……范围内", "The plan stayed within the confines of the law.", "计划保持在法律范围内。")],
    [C("imprison", "/ɪmˈprɪz.ən/", "监禁", "原表注解 · 人身", "imprison 专指关押人；confine 还可因疾病、空间或规则限制。", "The regime imprisoned its critics.", "政权监禁批评者。"), C("limits", "/ˈlɪm.ɪts/", "界限；限制", "原表注解 · 边界", "limits 是边界名词；confine 是使对象不越过边界。", "The city has strict growth limits.", "城市有严格增长限制。"), C("restrict", "/rɪˈstrɪkt/", "限制", "近义词", "restrict 可减少数量或权限；confine 常有空间边界图像。", "Rules restrict access at night.", "规则限制夜间进入。")],
    "可靠词源：来自 Latin confinis“相邻、有共同边界”，经 French confiner 形成限制义。", "易混刹车：confine A to B；confide in 是向人吐露秘密。", "一道边界拿着粉笔，把所有思想关在一个小方框里。"),

  E(422, "confluence", "/ˈkɒn.flu.əns/", "noun", "汇合，混合：together same", "a flowing together; a junction or merging of influences", "河流汇合处；事物、影响的汇聚融合",
    [U("at the confluence of two rivers", "在两河交汇处", "The town stands at the confluence of two rivers.", "小镇位于两河交汇处。", "a confluence of ideas", "思想汇聚", "The discovery arose from a confluence of ideas.", "这项发现源于多种思想的汇聚。")],
    [C("together", "/təˈɡeð.ər/", "共同、汇到一起", "原表注解 · 汇合", "together 是一般状态；confluence 带不同流向汇入一处的图像。", "The teams worked together.", "团队一起工作。"), C("same", "/seɪm/", "相同的", "原表注解 · 合一", "same 强调一致；confluence 强调原本不同的事物相遇融合。", "They chose the same route.", "他们选择同一路线。"), C("convergence", "/kənˈvɜː.dʒəns/", "汇聚", "近义词", "convergence 强调趋向同一点；confluence 常是流体或影响真正汇合。", "The device reflects technological convergence.", "该设备体现技术融合。")],
    "可靠词源：来自 Latin confluere“共同流动”，con- + fluere“流”。", "易混刹车：confluence 是汇合名词；influence 是影响；confluent 可作形容词。", "两条河带着不同颜色的水握手，合成一条会唱歌的河。"),

  E(423, "confront", "/kənˈfrʌnt/", "transitive verb", "直接对抗，直面：face to face", "to face directly, challenge, or deal with a difficult reality", "面对面直面；直接对抗或处理",
    [U("confront the problem", "直面问题", "We must confront the problem now.", "我们现在必须直面问题。", "confront someone with evidence", "拿证据与某人对质", "Police confronted him with the evidence.", "警方拿证据与他对质。")],
    [C("face to face", "/ˌfeɪs tə ˈfeɪs/", "面对面", "原表注解 · 图像", "face to face 是位置或交流方式；confront 通常含困难、冲突或不可回避。", "They met face to face.", "他们面对面会谈。"), C("challenge", "/ˈtʃæl.ɪndʒ/", "挑战；质疑", "近义词", "challenge 强调质疑或考验；confront 强调直接站到问题面前。", "She challenged the false claim.", "她质疑虚假说法。")],
    "可靠词源：来自 Medieval Latin confrontare“额头相对”，con- + frons/front-“前额”。", "易混刹车：confront a problem 直接接宾语；confront someone with evidence。", "一个问题突然长出脸，迫使所有人和它面对面。"),

  E(424, "confound", "/kənˈfaʊnd/", "transitive verb", "使困惑：uncertainty；无法区分，混淆：fail to differentiate；证明为假，证伪：false", "to bewilder, mix up distinctions, or prove expectations wrong", "使困惑；混淆得无法区分；证明预期错误",
    [U("confound the experts", "使专家困惑", "The result confounded the experts.", "结果使专家困惑。", "a confounding puzzle", "令人迷惑的难题", "The machine presented a confounding puzzle.", "这台机器带来一个令人迷惑的难题。"), U("confound cause with effect", "混淆因果", "Do not confound cause with effect.", "不要混淆因果。", "confound two species", "把两个物种混为一谈", "Early observers confounded the two species.", "早期观察者把两个物种混为一谈。"), U("confound expectations", "出乎预料", "The small team confounded expectations and won.", "小队出乎预料地获胜。", "confound a prediction", "证明预测错误", "New evidence confounded the prediction.", "新证据证明预测错误。")],
    [C("uncertainty", "/ʌnˈsɜː.tən.ti/", "不确定", "原表注解 · 困惑", "uncertainty 是状态；confound 是造成强烈困惑的动作。", "The delay created uncertainty.", "延误造成不确定性。"), C("fail to differentiate", "/feɪl tə ˌdɪf.əˈren.ʃi.eɪt/", "无法区分", "原表注解 · 混淆", "该短语说明 confound A with B 的结果：差别被抹平。", "The test failed to differentiate the samples.", "测试无法区分样本。"), C("false", "/fɔːls/", "错误的；假的", "原表注解 · 证伪", "false 是判断结果；confound a prediction 表示事实使其落空。", "The rumor proved false.", "谣言被证明是假的。")],
    "可靠词源：来自 Latin confundere“共同倾倒、混在一起”，con- + fundere“倒、倾注”。", "易混刹车：confound 可“使困惑/混淆/挫败预期”，需看宾语；不要当 confuse 的唯一替代。", "两种颜色被倒进同一顶帽子，连专家也分不清，还猜错了结局。"),

  E(425, "congeal", "/kənˈdʒiːl/", "verb", "凝固，固化：solid state", "to change from liquid or soft matter into a solid or thickened state", "凝结、变稠或固化",
    [U("blood begins to congeal", "血液开始凝结", "The blood began to congeal in the cold.", "血液在寒冷中开始凝结。", "congealed fat", "凝固的脂肪", "A layer of congealed fat covered the soup.", "汤上覆盖着一层凝固脂肪。")],
    [C("solid state", "/ˌsɒl.ɪd ˈsteɪt/", "固态", "原表注解 · 结果", "solid state 是最终状态；congeal 描写液体逐渐变稠或凝固。", "The material enters a solid state.", "材料进入固态。"), C("coagulate", "/kəʊˈæɡ.jə.leɪt/", "凝结", "近义词", "coagulate 常用于血液、蛋白形成块；congeal 更宽，可指脂肪、酱汁或抽象情绪冻结。", "The protein coagulates when heated.", "蛋白质受热凝结。")],
    "可靠词源：来自 Latin congelare“冻结”，与 gel、gelatin 具有历史联系。", "易混刹车：congeal 强调液体变稠/固；congenial 表示友好合意。", "一碗汤听到冷笑话后，连自己的影子都凝固了。"),

  E(426, "congenial", "/kənˈdʒiː.ni.əl/", "adjective", "和善的，友好的：agreement；令人愉悦的：giving pleasure", "pleasant because compatible, friendly, or suited to one's tastes", "志趣相投而友善的；适意宜人的",
    [U("congenial company", "相投的同伴", "She spent the evening in congenial company.", "她与志趣相投的同伴共度夜晚。", "a congenial colleague", "友善合拍的同事", "He found his new colleague congenial.", "他发现新同事友善合拍。"), U("a congenial climate", "宜人的气候", "The island offers a congenial climate.", "该岛气候宜人。", "work congenial to one's interests", "符合兴趣的工作", "She sought work congenial to her interests.", "她寻找符合自己兴趣的工作。")],
    [C("agreement", "/əˈɡriː.mənt/", "一致；合拍", "原表注解 · 相投", "agreement 是意见一致；congenial 是性情、兴趣或环境令人合拍。", "They reached agreement quickly.", "他们很快达成一致。"), C("giving pleasure", "/ˌɡɪv.ɪŋ ˈpleʒ.ər/", "令人愉快", "原表注解 · 宜人", "giving pleasure 描述效果；congenial 常因适合个人气质而令人愉快。", "The music was gentle and giving pleasure.", "音乐轻柔悦耳。"), C("agreeable", "/əˈɡriː.ə.bəl/", "令人愉快的；同意的", "近义词", "agreeable 更普通；congenial 强调天然合拍、适合。", "We enjoyed an agreeable evening.", "我们度过了愉快夜晚。")],
    "可靠词源：来自 Latin congenialis，con- + genius“天性、守护精神”，即天性相合。", "易混刹车：congenial 是合得来；congenital 是先天的；congeal 是凝固。", "两把天性相合的椅子一见面，就为彼此泡了最舒服的茶。"),

  E(427, "congruent", "/ˈkɒŋ.ɡru.ənt/", "adjective", "和谐一致的：in agreement；全等的：coinciding", "in agreement or harmony; identical in shape and size", "和谐一致的；几何上全等的",
    [U("congruent with the evidence", "与证据一致", "The conclusion is congruent with the evidence.", "结论与证据一致。", "congruent values", "一致的价值观", "Their actions were congruent with their stated values.", "他们的行动与所宣称的价值观一致。"), U("congruent triangles", "全等三角形", "The diagram contains two congruent triangles.", "图中有两个全等三角形。", "congruent figures", "全等图形", "Congruent figures coincide when superimposed.", "全等图形叠放时完全重合。")],
    [C("in agreement", "/ɪn əˈɡriː.mənt/", "一致", "原表注解 · 抽象义", "该短语说明观点或行为相符；congruent 较正式，强调结构匹配。", "The findings are in agreement.", "研究结果一致。"), C("coinciding", "/ˌkəʊ.ɪnˈsaɪ.dɪŋ/", "重合", "原表注解 · 几何义", "coinciding 是叠合结果；congruent 要求形状和大小相同，即使位置不同。", "The coinciding lines appear as one.", "重合线看起来像一条。"), C("consistent", "/kənˈsɪs.tənt/", "一致的", "近义词", "consistent 强调无矛盾；congruent 强调对应部分匹配。", "The testimony is consistent with the facts.", "证词与事实一致。")],
    "可靠词源：来自 Latin congruere“相遇、相符”，由 con- + gruere（仅见于该词族）构成。", "易混刹车：congruent with；几何上不是 merely similar，而是同形同大。", "两个三角形穿着同尺码衣服，叠在一起后谁也看不见谁。"),

  E(428, "conjecture", "/kənˈdʒek.tʃər/", "noun · verb", "揣测的结果：conclusion by surmise；猜测，估计（大小、数量等）：decide without actual measurement；（没有依据地）认为：form an opinion", "an inference or estimate made without sufficient evidence or measurement", "依据不足的推测、猜想或估计",
    [U("mere conjecture", "纯属猜测", "The claim remains mere conjecture.", "这一说法仍纯属猜测。", "a plausible conjecture", "看似合理的猜想", "The mathematician proposed a plausible conjecture.", "数学家提出了一个看似合理的猜想。"), U("conjecture the size", "猜测大小", "Without a ruler, we could only conjecture the size.", "没有尺子，我们只能猜测大小。", "conjecture how many", "估计数量", "Observers conjectured how many birds remained.", "观察者估计还剩多少只鸟。"), U("conjecture that", "无依据地认为", "Some critics conjectured that the letter was forged.", "一些评论者猜测那封信是伪造的。", "conjecture about the cause", "推测原因", "They conjectured about the cause without evidence.", "他们在没有证据的情况下推测原因。")],
    [C("conclusion by surmise", "/kənˌkluː.ʒən baɪ səˈmaɪz/", "由猜度得出的结论", "原表注解 · 名词", "这是 conjecture 的核心：结论尚缺充分证据。", "It was a conclusion by surmise rather than proof.", "这是一项由猜度而非证据得出的结论。"), C("decide without actual measurement", "/dɪˌsaɪd wɪˌðaʊt ˈæk.tʃu.əl ˈmeʒ.ə.mənt/", "未经实测而估计", "原表注解 · 估量", "conjecture 可估大小数量，但不应冒充精确测量。", "They decided the height without actual measurement.", "他们未经实测便估计高度。"), C("form an opinion", "/fɔːm ən əˈpɪn.jən/", "形成看法", "原表注解 · 动词", "form an opinion 可有依据；conjecture 强调证据不足。", "Readers formed an opinion after reviewing the facts.", "读者查看事实后形成看法。"), C("hypothesis", "/haɪˈpɒθ.ə.sɪs/", "假设", "近义词", "hypothesis 通常可系统检验；conjecture 可能只是初步猜想。", "The experiment tests the hypothesis.", "实验检验该假设。")],
    "可靠词源：来自 Latin conicere“共同投掷、推断”，con- + jacere“投掷”；像把线索投到一起。", "易混刹车：conjecture 不等于 evidence；在数学中可严谨提出但尚未证明。", "没有尺子的侦探把三条线索扔进帽子，猜出月亮尺寸。"),

  E(429, "connive", "/kəˈnaɪv/", "intransitive verb", "暗中合作，共谋：cooperate secretly；纵容：假装忽视或并未采取措施阻止错误：pretend ignorance ought to oppose", "to cooperate secretly in wrongdoing or deliberately ignore what one should oppose", "暗中串通；对本应制止的错误装作不知而纵容",
    [U("connive with smugglers", "与走私者串通", "The guard connived with the smugglers.", "警卫与走私者暗中串通。", "connive at fraud", "纵容欺诈", "Officials were accused of conniving at fraud.", "官员被指控纵容欺诈。"), U("connive at misconduct", "对不当行为装聋作哑", "The supervisor connived at repeated misconduct.", "主管对反复的不当行为装聋作哑。", "connive by looking away", "故意别过脸纵容", "They connived by looking away when rules were broken.", "规则被违反时，他们故意别过脸纵容。")],
    [C("cooperate secretly", "/kəʊˌɒp.ər.eɪt ˈsiː.krət.li/", "秘密合作", "原表注解 · 共谋", "秘密合作可为正当；connive 必须与错误或欺骗有关。", "They cooperated secretly on the gift.", "他们为礼物秘密合作。"), C("pretend ignorance", "/prɪˌtend ˈɪɡ.nər.əns/", "假装不知", "原表注解 · 纵容", "pretend ignorance 是 connive at 的手段：本应制止却故意不看。", "He pretended ignorance of the violation.", "他假装不知道违规行为。"), C("collude", "/kəˈluːd/", "串通", "近义词", "collude 强调多方积极合作；connive 还可仅以默许帮助错误发生。", "The firms colluded to fix prices.", "公司串通操纵价格。")],
    "可靠词源：来自 Latin connivere“闭眼、眨眼”，比喻故意闭眼不管。", "易混刹车：connive with 人；connive at 行为。它从不只是普通 ignore。", "守门人故意闭上一只眼，让一群违规饼干悄悄通过。"),

  E(430, "connoisseur", "/ˌkɒn.əˈsɜːr/", "noun", "鉴赏家（尤指艺术领域）：with discrimination, appreciation；专家：high level of knowledge", "an expert able to judge quality with refined knowledge and appreciation", "能以深厚知识和鉴别力判断品质的鉴赏家、行家",
    [U("an art connoisseur", "艺术鉴赏家", "The painting attracted an art connoisseur.", "这幅画吸引了一位艺术鉴赏家。", "a connoisseur of tea", "茶叶行家", "She is a connoisseur of rare tea.", "她是珍稀茶叶行家。"), U("a noted connoisseur", "著名专家", "A noted connoisseur authenticated the vase.", "一位著名专家鉴定了花瓶。", "the connoisseur's judgment", "行家的判断", "Collectors trusted the connoisseur's judgment.", "收藏者信任这位行家的判断。")],
    [C("discrimination", "/dɪˌskrɪm.ɪˈneɪ.ʃən/", "鉴别力", "原表注解 · 能力", "此处 discrimination 指分辨品质差异，不是歧视义；connoisseur 拥有这种能力。", "Fine tasting requires discrimination.", "精细品鉴需要鉴别力。"), C("appreciation", "/əˌpriː.ʃiˈeɪ.ʃən/", "欣赏；理解", "原表注解 · 审美", "appreciation 可是普通喜爱；connoisseur 还具系统知识和判断标准。", "Her appreciation of music grew.", "她对音乐的欣赏加深。"), C("expert", "/ˈek.spɜːt/", "专家", "原表注解 · 上位词", "expert 可在任何技术领域；connoisseur 多用于艺术、酒、食物等品味领域。", "A medical expert reviewed the case.", "医学专家审查了病例。")],
    "可靠词源：直接借自 French connoisseur“知者”，来自 connaître“知道”；旧拼写保留 oi。", "易混刹车：拼写 connoisseur，发音不逐字母；专业技术专家不一定是鉴赏家。", "一位茶叶行家只闻一朵蒸汽，就认出了茶园和年份。"),

  E(431, "conscientious", "/ˌkɒn.ʃiˈen.ʃəs/", "adjective", "仔细的，一丝不苟的：involving great care；有良心的，正直的：governed by conscience", "careful and thorough; guided by conscience and moral duty", "认真细致、一丝不苟的；受良心支配而正直的",
    [U("a conscientious worker", "认真负责的工作者", "A conscientious worker checked every figure twice.", "一位认真负责的工作者把每个数字核对两遍。", "conscientious attention to detail", "一丝不苟地关注细节", "The task demands conscientious attention to detail.", "任务要求一丝不苟地关注细节。"), U("a conscientious objection", "出于良心的反对", "He raised a conscientious objection to the order.", "他出于良心反对这项命令。", "a conscientious decision", "凭良心作出的决定", "She made a conscientious decision to report the abuse.", "她凭良心决定报告虐待行为。")],
    [C("involving great care", "/ɪnˌvɒl.vɪŋ ɡreɪt ˈkeər/", "极其仔细", "原表注解 · 工作态度", "这是 conscientious 的常见义：因责任感而细致，不只是技巧熟练。", "The audit involved great care.", "审计极其仔细。"), C("governed by conscience", "/ˌɡʌv.ənd baɪ ˈkɒn.ʃəns/", "受良心支配", "原表注解 · 道德", "该义强调内在道德原则，而非外在命令。", "Her action was governed by conscience.", "她的行动受良心支配。"), C("meticulous", "/məˈtɪk.jə.ləs/", "一丝不苟的", "近义词", "meticulous 只强调细节精确；conscientious 还暗示责任心和道德认真。", "He kept meticulous records.", "他保存了极其细致的记录。")],
    "可靠构词：conscience + -ious；conscience 来自 Latin conscientia“共同知道、良知”。", "易混刹车：conscientious /-ʃəs/ 是认真正直；conscious /-ʃəs/ 是清醒意识到。", "一位认真负责的蚂蚁把每粒沙核对两遍，并拒绝偷走任何一粒。"),

  E(432, "consensus", "/kənˈsen.səs/", "noun", "一致同意：general agreement", "general agreement reached by a group", "群体形成的普遍一致意见",
    [U("reach a consensus", "达成共识", "The committee reached a consensus after debate.", "委员会经讨论达成共识。", "a broad consensus", "广泛共识", "There is a broad consensus on the need for reform.", "改革的必要性获得广泛共识。")],
    [C("general agreement", "/ˌdʒen.ər.əl əˈɡriː.mənt/", "普遍一致", "原表注解 · 定义", "consensus 不必每个人完全同意，但要有群体总体共识。", "General agreement emerged slowly.", "普遍一致逐渐形成。"), C("unanimity", "/ˌjuː.nəˈnɪm.ə.ti/", "全体一致", "近义辨析", "unanimity 要求人人同意；consensus 可容许少数保留意见。", "The vote passed with unanimity.", "投票全票通过。")],
    "可靠词源：来自 Latin consensus“共同感受、同意”，con- + sentire“感觉”。", "易混刹车：不能说 a consensus of opinion（常显冗余）；reach/build consensus。", "十二把不同椅子争论后，共同同意桌子应该留在中间。"),

  E(433, "consequence", "/ˈkɒn.sɪ.kwəns/", "noun", "结果：produced by cause；重要性，价值：importance", "a result produced by a cause; importance or significance", "由原因产生的结果；重要性、价值",
    [U("a consequence of neglect", "疏忽的后果", "The leak was a consequence of neglect.", "泄漏是疏忽的后果。", "face the consequences", "承担后果", "Officials must face the consequences of the decision.", "官员必须承担决定的后果。"), U("a matter of consequence", "重要事项", "The treaty is a matter of great consequence.", "该条约是极其重要的事项。", "of little consequence", "无足轻重", "The minor delay was of little consequence.", "小幅延误无足轻重。")],
    [C("produced by cause", "/prəˌdjuːst baɪ ˈkɔːz/", "由原因产生", "原表注解 · 因果", "该短语定义结果义；consequence 常暗示行为带来的后果。", "The damage was produced by a hidden cause.", "损害由一个隐藏原因造成。"), C("importance", "/ɪmˈpɔː.təns/", "重要性", "原表注解 · 价值", "importance 是普通抽象名词；of consequence 是较正式的固定表达。", "The issue has national importance.", "该问题具有全国重要性。"), C("outcome", "/ˈaʊt.kʌm/", "结果", "近义词", "outcome 中性指最终结果；consequence 更强调前因后果，有时偏负面。", "The outcome surprised everyone.", "结果令所有人惊讶。")],
    "可靠词源：来自 Latin consequi“跟随、随后发生”，con- + sequi“跟随”。", "易混刹车：consequence 是后果；consequent 是随之发生的；consequential 也可表示重要的。", "一个原因迈出一步，后果就像影子一样跟在后面。"),

  E(434, "conservative", "/kənˈsɜː.və.tɪv/", "adjective · noun", "守旧的，不愿改变的：oppose change；不招摇的，低调的：not showy；谨慎小心的：close attentiveness", "favoring established ways; restrained in style; cautious in estimates or action", "保守守旧的；低调克制的；谨慎估计的",
    [U("a conservative approach", "保守做法", "The board adopted a conservative approach to reform.", "董事会对改革采取保守做法。", "conservative views", "守旧观点", "His conservative views oppose rapid change.", "他的守旧观点反对快速变化。"), U("a conservative suit", "低调保守的西装", "She chose a conservative suit for the interview.", "她为面试选择了一套低调的西装。", "conservative colors", "不招摇的颜色", "The office uses conservative colors.", "办公室使用低调颜色。"), U("a conservative estimate", "保守估计", "A conservative estimate puts the cost at one million.", "保守估计成本为一百万。", "conservative investment", "稳健投资", "They prefer a conservative investment strategy.", "他们偏好稳健投资策略。")],
    [C("oppose change", "/əˌpəʊz ˈtʃeɪndʒ/", "反对改变", "原表注解 · 守旧", "反对改变是政治社会义核心；conservative 也可能只偏好渐进。", "Some members oppose change.", "部分成员反对改变。"), C("not showy", "/nɒt ˈʃəʊ.i/", "不招摇", "原表注解 · 风格", "not showy 描写视觉克制；conservative style 常选择传统、低调设计。", "The dress is elegant but not showy.", "裙子优雅但不招摇。"), C("close attentiveness", "/kləʊs əˈten.tɪv.nəs/", "谨慎关注", "原表注解 · 谨慎", "该短语说明估算或行动留有余地；conservative estimate 宁可低估收益。", "Close attentiveness prevented errors.", "谨慎关注避免了错误。"), C("cautious", "/ˈkɔː.ʃəs/", "谨慎的", "近义词", "cautious 强调避免风险；conservative 还可指传统立场和低调风格。", "Investors remained cautious.", "投资者保持谨慎。")],
    "可靠构词：conserve + -ative，最终来自 Latin conservare“保存”；政治义是保存既有制度。", "易混刹车：三个常见落点：change、style、estimate；不能全部译成政治上的保守。", "一件低调西装抱着旧日历，用最谨慎的数字估算明天。"),

  E(435, "conservatory", "/kənˈsɜː.və.tri/", "noun", "温室：greenhouse；艺术学院：school arts", "a glass greenhouse; a specialist school for music or other arts", "玻璃温室；音乐或艺术专门学院",
    [U("a glass conservatory", "玻璃温室", "Tropical plants filled the glass conservatory.", "热带植物挤满玻璃温室。", "build a conservatory", "建造阳光温室", "They built a conservatory beside the kitchen.", "他们在厨房旁建了一间玻璃阳光房。"), U("a music conservatory", "音乐学院", "She studied violin at a music conservatory.", "她在音乐学院学习小提琴。", "enter the conservatory", "进入艺术学院", "The pianist entered the conservatory at sixteen.", "钢琴家十六岁进入音乐学院。")],
    [C("greenhouse", "/ˈɡriːn.haʊs/", "温室", "原表注解 · 建筑义", "greenhouse 专为植物；conservatory 也可指住宅玻璃阳光房。", "Tomatoes grow in the greenhouse.", "西红柿在温室中生长。"), C("school of arts", "/ˌskuːl əv ˈɑːts/", "艺术学院", "原表注解 · 教育义", "school of arts 很宽；conservatory 多专门训练音乐、舞蹈或戏剧表演。", "She teaches at a school of arts.", "她在一所艺术学院任教。"), C("conservation", "/ˌkɒn.səˈveɪ.ʃən/", "保护，保存", "同根辨析", "conservation 是保护行为；conservatory 是保存植物或培养艺术的场所。", "The project supports forest conservation.", "项目支持森林保护。")],
    "可靠词源：来自 Italian conservatorio/Latin conservare“保存”；艺术学院义源于培养、保存音乐传统的机构。", "易混刹车：conservatory 是场所；conservative 是保守的；conservation 是保护。", "温室里的小提琴每天给兰花上音乐学院课程。"),
];

const group = (start) => all.slice(start - 406, start - 401);
const stories = [
  [82, "The Inward Mirror", ["concave", "conceal", "concede", "concentrate", "concerted"], "A concave mirror tried to conceal a hat, chose to concede, began to concentrate, and made one concerted bow.", "一面凹镜试图藏起帽子，后来选择承认，开始集中注意，并作了一次协调一致的鞠躬。"],
  [83, "The Peaceful Sentence", ["conciliate", "concise", "concord", "concur", "condescending"], "A spoon tried to conciliate a concise sentence; concord agreed to concur, but a condescending comma laughed.", "一把勺子试图安抚一个简洁句子；和睦同意表示赞同，但一个居高临下的逗号笑了。"],
  [84, "The Moral Garden", ["condign", "condole", "condone", "conducive", "confident"], "Condign punishment came to condole, refused to condone weeds, found rain conducive, and grew confident.", "罪有应得的惩罚前来慰问，拒绝纵容杂草，发现雨水有利，于是变得自信。"],
  [85, "The Frozen River", ["confine", "confluence", "confront", "confound", "congeal"], "A fence tried to confine a confluence, chose to confront a cloud, managed to confound it, and watched soup congeal.", "一道篱笆试图限制汇流，选择直面一朵云，成功使它困惑，并看着汤凝固。"],
  [86, "The Friendly Triangle", ["congenial", "congruent", "conjecture", "connive", "connoisseur"], "A congenial triangle met its congruent hat, made a conjecture, refused to connive, and hired a connoisseur.", "一个友善合拍的三角形遇见全等帽子，作出猜想，拒绝串通，并雇了一位鉴赏家。"],
  [87, "The Careful Greenhouse", ["conscientious", "consensus", "consequence", "conservative", "conservatory"], "A conscientious seed reached consensus with consequence, wore a conservative coat, and opened a conservatory.", "一颗认真负责的种子与后果达成共识，穿上低调外套，并开办了一座温室。"],
];

export const [set82, set83, set84, set85, set86, set87] = stories.map(([id, title, targetForms, plain, translation]) =>
  compactSet(id, title, group(406 + (id - 82) * 5), { title, targetForms, plain, translation }),
);
