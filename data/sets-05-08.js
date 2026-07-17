import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const words = [
  vocab(21, "absolute", "/ˈæb.sə.luːt/", "adjective · noun", "专制的：unconstrained; 无限的：unqualified; 完美纯净的：free from imperfection or mixture; 确凿的：unquestionable",
    "complete, unrestricted, pure, or beyond doubt", "完全的、无限制的、纯粹的或不容置疑的",
    "一枚旋钮被拧到尽头，没有余量、限制或杂质——absolute 强调抵达“完全”的边界。",
    [["absolute power", "绝对权力", "Absolute power left the ruler answerable to no one.", "绝对权力使统治者无需向任何人负责。"], ["absolute certainty", "绝对确定", "No historical claim can be established with absolute certainty.", "历史主张很难以绝对确定性成立。"], ["absolute silence", "完全寂静", "The announcement was followed by absolute silence.", "公告之后一片死寂。"]],
    [["unconstrained", "不受限制的", "原表注解 · 权力义", "unconstrained 强调没有外部约束；absolute power 还暗示权力完整、至高。", "The model is unrealistic when demand is unconstrained.", "需求不受限制时，该模型并不现实。"], ["unqualified", "完全的；无保留的", "原表注解 · 程度义", "unqualified approval 表示毫无保留；不要误解为“不合格”。", "The proposal received unqualified support.", "该提案获得了毫无保留的支持。"], ["free from imperfection or mixture", "无瑕疵或杂质的；纯净的", "原表注解 · 纯度义", "absolute 在 absolute purity 等搭配中强调没有瑕疵或掺杂；pure 更常用，absolute 用来把纯度推到极致。", "The laboratory required chemicals of absolute purity.", "实验室要求使用纯度绝对、不含杂质的化学品。"], ["unquestionable", "不容置疑的", "原表注解 · 确凿义", "unquestionable 强调证据或权威不容怀疑；absolute 的范围更广。", "Her integrity is unquestionable.", "她的正直无可置疑。"]],
    M("声音联想（非词源）：absolute ≈“阿布锁路”——阿布把整条路彻底锁死，一点通行余地都不留。", "可靠词源：来自拉丁语 absolutus，意为“被释放、完成的”，是 absolvere（解开、完成）的过去分词；这里不把现代拼写随意拆成 solution。", "熟词桥：absolutely 是最常见同族词；说 Absolutely! 就是“完全同意、当然”。", "阿布把路锁死后又把四个旋钮拧到底：权力不受限、寂静无一声、纯度无杂质、证据无疑问。", "共同核心是“没有保留或限制的完全状态”：complete → unrestricted / pure / certain。", "absolute 只有修饰 ruler、power 等时才可能有“专制”色彩；absolute silence 只是“完全寂静”。", "The absolute ruler locked the road, demanded absolute silence, and accepted only absolute proof.", "绝对统治者锁死道路，要求完全寂静，而且只接受确凿无疑的证据。"),
    ["Name two different nouns that absolute can modify.", "说出两个可以由 absolute 修饰、但意义侧重不同的名词。", "Absolute power and absolute certainty: one is unrestricted, the other beyond doubt.", "absolute power 表示不受限制，absolute certainty 表示毫无疑问。"],
    ["The committee demanded ________ proof before reversing the verdict.", "委员会要求毫无疑问的证据才肯推翻裁决。", "Absolute can mean complete and beyond doubt.", "absolute 可表示完全、无可置疑。"], ["complete", "limited", "tentative"]),

  vocab(22, "absolve", "/əbˈzɒlv/", "transitive verb", "使无罪，解除责任：free from guilt, exculpate",
    "to free someone from guilt, blame, or responsibility", "宣告某人无罪；免除责备或责任",
    "法官剪断绑在某人身上的“罪责绳”，使其从 guilt 中被释放。",
    [["absolve someone of blame", "免除某人的责备", "The inquiry did not absolve the agency of blame.", "调查并未免除该机构的责任。"], ["absolve someone from responsibility", "免除某人的责任", "A warning cannot absolve the manufacturer from responsibility.", "一则警告不能免除制造商的责任。"], ["absolve oneself", "为自己开脱", "He tried to absolve himself by blaming his assistants.", "他试图责怪助手来为自己开脱。"]],
    [["exculpate", "证明无罪；开脱", "原表注解 · 正式近义", "exculpate 侧重证据证明没有过错；absolve 侧重权威免除罪责。", "The new evidence exculpated the defendant.", "新证据证明被告无罪。"], ["free from guilt", "免于罪责", "原表注解 · 释义", "这是 absolve 的结果，不是所有 free from 都能替换 absolve。", "The verdict left her free from legal guilt.", "判决使她免负法律罪责。"], ["acquit", "宣判无罪", "法律近义词", "acquit 是法庭正式判无罪；absolve 也可用于道德责备和责任。", "The jury acquitted him of fraud.", "陪审团宣判他欺诈罪不成立。"]],
    M("声音联想（非词源）：absolve ≈“阿布 solve”——阿布 solve 了案件，法官便免除他的罪责。", "可靠词根：拉丁语 absolvere = ab-（离开）+ solvere（松开、解开）；即把罪责的绳结解开。", "熟词桥：solve、dissolve 与 -solv- 的“解开”意象相通；dissolve a bond 是解散关系，absolve 是解开罪责。", "法官拿着写有 SOLVE 的金钥匙，剪断绑在阿布身上的 guilt、blame、responsibility 三条锁链。", "“解开罪责”自然得到“宣告无罪、免除责备或责任”。", "搭配要分清：absolve someone of blame/guilt；absolve someone from responsibility/obligation。它不等于普通 solve。", "After Ana solved the mystery, the judge absolved her of blame.", "安娜解开谜案后，法官免除了对她的责备。"),
    ["How is absolve broader than acquit?", "为什么 absolve 的使用范围比 acquit 更广？", "Acquit is a legal verdict; absolve can remove moral blame or practical responsibility too.", "acquit 是法律判决；absolve 还可免除道德责备或实际责任。"],
    ["The audit cleared the engineer and ________ her of blame.", "审计还工程师清白，免除了对她的责备。", "Absolve someone of blame is the fixed pattern.", "固定搭配是 absolve someone of blame。"], ["exonerate", "accuse", "condemn"]),

  vocab(23, "abstain", "/əbˈsteɪn/", "intransitive verb", "自我克制，主动戒绝：refrain, by one's own choice",
    "to deliberately refrain from an action or substance", "主动克制，不做某事；戒绝某物",
    "面前有一块蛋糕，你主动把手收回——不是不能吃，而是选择不吃。",
    [["abstain from alcohol", "戒酒", "She abstained from alcohol during training.", "训练期间她主动戒酒。"], ["abstain from voting", "投弃权票；不投票", "Two members abstained from voting.", "两名成员投了弃权票。"], ["abstain from comment", "不予置评", "The spokesperson abstained from comment until the inquiry ended.", "调查结束前，发言人不予置评。"]],
    [["refrain", "克制；避免", "原表注解 · 近义", "两者都常接 from；abstain 更正式，常指持续戒绝或正式弃权。", "Please refrain from interrupting the speaker.", "请不要打断发言者。"], ["by one's own choice", "出于自愿", "原表注解 · 关键条件", "abstain 强调主动选择，不是被外力阻止。", "He left by his own choice, not under pressure.", "他是自愿离开，并非受压。"], ["forgo", "放弃本可享有之物", "近义词", "forgo 是及物动词，直接接宾语；abstain 通常接 from。", "She chose to forgo dessert.", "她选择不吃甜点。"]],
    M("声音联想（非词源）：abstain ≈“阿布 stay in”——聚会再热闹，阿布仍 stay in，主动不喝酒也不投票。", "可靠词根：拉丁语 abstinere = abs-（离开）+ tenere（握住、保持），即“把自己保持在……之外”。", "熟词桥：contain、retain、tenacious 都能帮助认出 ten-/tain 的“持有、保持”；abstinent 是其形容词亲属。", "酒杯、选票、麦克风同时伸向阿布，他把双手背后，嘴里念着 stay in，三样都主动放弃。", "核心不是“做不到”，而是 by one's own choice 主动把自己保持在行为之外。", "固定结构是 abstain from alcohol/voting/comment；不要说 abstain alcohol。与 abstemious（少量有节制）相比，abstain 常是完全不做。", "He stayed in and abstained from wine, voting, and comment.", "他留在室内，主动不喝酒、不投票，也不发表评论。"),
    ["Complete the pattern: abstain ___ doing something.", "补全结构：abstain ___ doing something。", "Abstain from doing something.", "应为 abstain from doing something。"],
    ["For ethical reasons, three judges chose to ________ from the vote.", "出于伦理原因，三名法官选择不参与投票。", "Abstain from voting means deliberately not cast a vote.", "abstain from voting 表示主动不投票。"], ["refrain", "indulge", "compel"]),

  vocab(24, "abstemious", "/æbˈstiː.mi.əs/", "adjective", "吃喝有节制的，节俭的：restraint, food or alcohol, sparing",
    "moderate and self-restrained, especially in eating and drinking", "有节制的，尤指饮食不过量的；节俭的",
    "盛宴前只取一小份食物和半杯酒，用量刻意保持克制。",
    [["an abstemious diet", "节制的饮食", "His abstemious diet excluded rich desserts.", "他节制的饮食不含油腻甜点。"], ["abstemious habits", "节俭克制的习惯", "Her abstemious habits contrasted with the court's extravagance.", "她的节俭习惯与宫廷奢华形成对比。"], ["abstemious in food and drink", "饮食有节制", "The monk was abstemious in food and drink.", "这位僧侣饮食十分节制。"]],
    [["restraint in food or alcohol", "对食物或酒精有所节制", "原表注解 · 核心概念", "restraint 是名词；abstemious 是形容词，尤指一个人在饮食方面长期少而有度。", "She showed restraint in food and alcohol at the banquet.", "她在宴会上对食物和酒精都很克制。"], ["sparing", "节省的；少量的", "原表注解 · 近义", "sparing 强调用量少；abstemious 强调主动、习惯性的自我节制。", "Use the seasoning sparingly.", "调味料要少放。"], ["temperate", "适度的；节制的", "近义词", "temperate 可泛指态度或气候温和；abstemious 特别联想到饮食。", "He led a temperate life.", "他过着节制的生活。"]],
    M("声音联想（非词源）：abstemious 可记“阿布只吃一咪（mi）”——满桌菜只夹一咪咪。", "可靠词源边界：来自拉丁语 abstemius，原指“戒酒的、节制的”；更深层构词来源并不确定，不把 stem 硬解释成“刹车杆”。", "熟词桥：它与 abstain、abstinence 共享“克制”的记忆家族，但 abstemious 特别聚焦 food and drink 的适量。", "盛宴上，阿布拿着只有一咪大的勺子：酒只抿一口、蛋糕只取一角，盘中永远留有余地。", "从“饮食少而有度”扩展到“生活习惯节俭克制”，关键词是 moderation，而非 total avoidance。", "abstemious ≠ abstinent：前者少而有度，后者常完全戒绝；不要因中间看见 stem 就编造词根。", "At the feast, the abstemious monk ate one tiny olive and sipped half a glass of water.", "宴会上，这位饮食节制的修士只吃一颗小橄榄，喝了半杯水。"),
    ["Contrast abstemious with abstinent.", "区分 abstemious 与 abstinent。", "Abstemious means moderate; abstinent often means avoiding something completely.", "abstemious 是适度少量；abstinent 常表示完全戒绝。"],
    ["Despite his wealth, he remained ________ in food, drink, and dress.", "尽管富有，他在饮食和衣着上仍很节俭。", "Abstemious describes habitual moderation.", "abstemious 描述习惯性的克制。"], ["sparing", "gluttonous", "lavish"]),

  vocab(25, "abstract", "/ˈæb.strækt/; v. /æbˈstrækt/", "adjective · noun · verb", "做总结概括：summarize; 使分心：away, attention",
    "existing as an idea; to summarize or draw away", "抽象的；摘要；概括；把注意力引开",
    "把具体细节抽走，只留下概念骨架；也可把人的注意力从眼前抽走。",
    [["an abstract concept", "抽象概念", "Justice is an abstract concept with concrete effects.", "正义是具有具体影响的抽象概念。"], ["abstract the main argument", "提炼主要论点", "The review abstracts the main argument from a long book.", "书评从长篇著作中提炼主要论点。"], ["abstract attention from", "使注意力离开", "The sudden noise abstracted her attention from the lecture.", "突然的噪声使她从讲座上分心。"]],
    [["summarize", "概括", "原表注解 · 近义", "summarize 用较短语言重述要点；abstract 可强调从细节中抽取核心。", "The conclusion summarizes the findings.", "结论概括了研究发现。"], ["draw attention away", "把注意力引开；使分心", "原表注解 · 注意力义", "ab-（away）+ tract（draw）：abstract attention from something 就是把注意力从它那里拉走。", "The spectacle drew attention away from the issue.", "奇观把注意力从问题上引开。"], ["concrete", "具体的", "反义词", "concrete 可被感知或明确指认；abstract 存在于思想层面。", "Give a concrete example of fairness.", "请给出公平的具体例子。"]],
    M("声音联想（非词源）：abstract ≈“阿布使劲拽”——把细节从文章里拽走，只剩抽象骨架。", "可靠词根：拉丁语 abstrahere = abs-（离开）+ trahere（拉）；-tract- 正是“拉、抽取”。", "熟词桥：extract 是“向外拉出”，distract 是“把注意力拉开”，tractor 是“牵引机”；abstract 也是把具体细节拉走。", "阿布开着 tractor，把例子、数字、颜色全拖走；桌上只剩一个概念骨架和一页摘要，旁边噪声又拖走他的注意力。", "同一动作贯穿三义：抽走具体细节 → 抽象；抽取要点 → 摘要/概括；抽走注意力 → 分心。", "读音重音会变：名词/形容词 /ˈæbstrækt/ 重音在前；动词 /æbˈstrækt/ 常重音在后。", "The abstract abstracts the core idea while the tractor abstracts my attention from the lecture.", "摘要提炼核心观点，而牵引机把我的注意力从讲座上拉走。"),
    ["Use abstract once as a noun and once as a verb.", "分别用 abstract 作名词和动词。", "I read the abstract; it abstracts the study's main claim.", "我读了摘要；它提炼了研究的核心主张。"],
    ["The article ________ the theory from a mass of historical detail.", "文章从大量历史细节中提炼出理论。", "As a verb, abstract can extract or summarize an idea.", "作动词时，abstract 可表示提炼或概括。"], ["summarize", "embody", "specify"]),
];

const moreWords = [
  vocab(26, "abstruse", "/əbˈstruːs/", "adjective", "难以理解的：recondite", "difficult to understand because it is complex or obscure", "深奥难懂的",
    "一本书像藏在迷宫深处，入口被复杂符号挡住。",
    [["an abstruse theory", "深奥理论", "The seminar examined an abstruse theory of reference.", "研讨会讨论了一种深奥的指称理论。"], ["abstruse language", "晦涩语言", "The manual hides a simple idea in abstruse language.", "手册用晦涩语言掩盖了一个简单观点。"], ["an abstruse argument", "难懂的论证", "Even experts disputed the abstruse argument.", "连专家们也对这段深奥论证意见不一。"]],
    [["recondite", "深奥的；鲜为人知的", "原表注解 · 强近义", "recondite 常兼有冷僻、只有专家知道；abstruse 强调理解困难。", "The article is full of recondite legal history.", "文章充满冷僻的法律史。"], ["obscure", "晦涩的；不知名的", "近义词", "obscure 可因表达不清或知名度低；abstruse 多因内容复杂。", "The final paragraph is obscure.", "最后一段含义晦涩。"]],
    M("声音联想（非词源）：abstruse ≈“阿布 truth（真相）藏住”——真相藏太深，所以读不懂。", "可靠词根：来自拉丁语 abstrusus“隐藏的”，源自 abstrudere（推开、藏起）；abs- 表“离开”，trudere 表“推”。", "熟词桥：intrude 是“推入、闯入”，extrude 是“挤出”；abstruse 像把意义推到看不见的深处。", "阿布把一个简单 truth 推进五十层符号迷宫，教授读完地图还找不到入口。", "意义被“藏在深处” → 内容复杂晦涩 → difficult to understand。", "abstruse 是“深奥难懂”，abstract 是“抽象”；两者外形接近但意思不能互换。", "The abstruse professor hid one simple truth beneath fifty symbols and seven locked doors.", "深奥的教授把一个简单真理藏在五十个符号和七道锁门之后。"),
    ["What is the difference between abstract and abstruse?", "abstract 与 abstruse 有何区别？", "Abstract means conceptual; abstruse means hard to understand.", "abstract 指抽象，abstruse 指难懂。"],
    ["The proof was so ________ that only two specialists followed it.", "证明极其深奥，只有两位专家看懂。", "Abstruse describes difficult, complex material.", "abstruse 描述复杂难懂的材料。"], ["recondite", "obvious", "lucid"]),

  vocab(27, "absurd", "/əbˈsɜːd/", "adjective", "不合理的：unreasonable", "wildly unreasonable, illogical, or inappropriate", "荒谬的，不合逻辑的",
    "法官郑重裁定月亮欠太阳房租：形式认真，内容完全不合理。",
    [["an absurd claim", "荒谬主张", "The claim that evidence is unnecessary is absurd.", "声称证据不重要是荒谬的。"], ["absurd to suppose", "认为……是荒谬的", "It is absurd to suppose that every error is deliberate.", "认为每个错误都是故意的十分荒谬。"], ["reduce to absurdity", "归于荒谬", "The critic reduced the argument to absurdity.", "批评者揭示了该论证的荒谬结果。"]],
    [["unreasonable", "不合理的", "原表注解 · 上位近义", "unreasonable 范围广；absurd 程度更强，常带明显违背逻辑或常识。", "The deadline is unreasonable.", "这个截止日期不合理。"], ["preposterous", "荒唐可笑的", "强近义词", "preposterous 更强调荒唐到令人震惊或发笑。", "The accusation was preposterous.", "这项指控荒唐可笑。"]],
    M("声音联想（非词源）：absurd ≈“阿伯说的”——阿伯说“月亮欠太阳房租”，荒谬得全场愣住。", "可靠词源：来自拉丁语 absurdus，原有“不和谐、走调”之意，后来发展为“不合理、荒谬”；与 surdus（聋的、沉闷的）相关。", "熟词桥：absurdity 是“荒谬之处”；英语里 That sounds absurd! 可直接连接“听起来完全不合逻辑”。", "阿伯穿法袍宣判月亮每晚迟到，还要向太阳补交三百年房租；陪审团连椅子都笑倒了。", "像走调声音破坏和谐一样，absurd 的主张严重破坏逻辑与常识。", "absurd 比 unreasonable 强；它不等于 funny，荒谬政策可能造成真实伤害。", "The absurd court ordered the moon to pay rent for occupying the night sky.", "荒谬的法庭命令月亮为占用夜空支付租金。"),
    ["Which is stronger: unreasonable or absurd?", "unreasonable 与 absurd 哪个程度更强？", "Absurd is usually stronger and implies a clear violation of logic or common sense.", "absurd 通常更强，暗示明显违背逻辑或常识。"],
    ["It would be ________ to infer causation from a single coincidence.", "仅凭一次巧合推断因果关系是荒谬的。", "Absurd marks a conclusion as grossly illogical.", "absurd 表示结论严重不合逻辑。"], ["unreasonable", "rational", "plausible"]),

  vocab(28, "abundant", "/əˈbʌn.dənt/", "adjective", "大量的：great plenty", "present in more than sufficient quantity", "大量的，充裕的",
    "仓库里的粮食从门口溢出，数量不只是够，而是绰绰有余。",
    [["abundant evidence", "大量证据", "Abundant evidence supports the broader conclusion.", "大量证据支持这一更广泛结论。"], ["abundant resources", "丰富资源", "The region has abundant natural resources.", "该地区自然资源丰富。"], ["be abundant in", "富含……", "The soil is abundant in organic matter.", "土壤富含有机质。"]],
    [["plenty", "充足；大量", "原表注解 · 名词", "plenty 是名词或代词；abundant 是形容词修饰名词。", "There is plenty of time.", "时间很充足。"], ["ample", "充足的", "近义词", "ample 强调足够甚至宽裕；abundant 更突出数量很多。", "We had ample time to revise.", "我们有充足时间修改。"], ["copious", "大量的", "近义词", "copious 常修饰文字、液体、笔记等大量产出。", "She took copious notes.", "她记了大量笔记。"]],
    M("声音联想（非词源）：abundant ≈“阿邦的”——阿邦的仓库东西多得关不上门。", "可靠词根：拉丁语 abundare“溢出、充裕”，与 unda“波浪”相关；画面是水漫过边缘。", "熟词桥：abundance 是名词“丰富、充裕”；be abundant in 与 be rich in 都表示“富含”。", "阿邦打开仓门，苹果像波浪一样涌出，把写着 plenty 的卡车直接冲走。", "从“溢出边缘”记住 more than enough：不是刚好够，而是数量大量、充裕。", "说 abundant evidence/resources；结构是 abundant in minerals，不是 abundant of。", "Abundant apples poured from A-Bang's barn like a red wave.", "大量苹果从阿邦的粮仓里像红色波浪一样涌出。"),
    ["Complete the phrase: a region abundant ___ minerals.", "补全：a region abundant ___ minerals。", "A region abundant in minerals.", "应使用介词 in。"],
    ["The archive contains ________ evidence from independent sources.", "档案馆保存着来自独立来源的大量证据。", "Abundant means available in great quantity.", "abundant 表示数量非常充足。"], ["plentiful", "scarce", "meager"]),

  vocab(29, "abuse", "/əˈbjuːs/ n.; /əˈbjuːz/ v.", "noun · verb", "辱骂抨击：condemn or vilify; 不当使用：wrong or improper use; 过量使用：use excessively", "to misuse, mistreat, or attack verbally", "滥用；虐待；辱骂",
    "把本应帮助人的工具拿来伤害人：对象、权力、药物或语言都被错误使用。",
    [["abuse of power", "滥用权力", "The report documented systematic abuse of power.", "报告记录了系统性的权力滥用。"], ["verbally abuse someone", "辱骂某人", "Customers must not verbally abuse staff.", "顾客不得辱骂员工。"], ["substance abuse", "物质滥用", "The program addresses substance abuse among adolescents.", "该项目处理青少年物质滥用问题。"]],
    [["vilify", "诋毁；辱骂", "原表注解 · 言语义", "vilify 是公开把人说得邪恶卑劣；verbally abuse 的范围更广，也包括直接辱骂。", "The pamphlet vilified political opponents.", "小册子诋毁政治对手。"], ["condemn", "谴责；强烈批评", "原表注解 · 抨击义", "condemn 可以是有理由的公开谴责；abuse 强调带侮辱或伤害性的攻击，语气更失控。", "The report condemned the deliberate deception.", "报告谴责了蓄意欺骗。"], ["misuse", "误用；滥用", "原表注解 · 不当使用义", "misuse 聚焦使用方式错误；abuse 常带伤害、剥削或过量。", "Do not misuse confidential data.", "不要滥用机密数据。"], ["overuse", "过度使用", "原表注解 · 过量使用义", "overuse 只强调用得太多；abuse 还可强调不道德或伤害。", "Overuse of antibiotics creates resistance.", "抗生素过度使用会产生耐药性。"]],
    M("声音联想（非词源）：abuse ≈“阿布 use 错了”——保护伞不用来挡雨，反而拿来打人。", "可靠词源：经古法语来自拉丁语 abuti“误用、耗尽”；核心确实是 use wrongly，但不要把现代 ab- 简化成固定的“坏”。", "熟词桥：misuse 是“误用”；abusive language、drug abuse、abuse of power 都保留“造成伤害的错误使用”。", "阿布把药当糖吞、把权力当锤子、把语言当刀子，一天之内 abuse 了三种东西。", "wrong/improper/excessive use 延伸到 mistreat 和 verbal attack，公共核心是“以伤害性的方式使用或对待”。", "词性影响末音：名词 abuse /s/，动词 abuse /z/；condemn 可以合理谴责，verbally abuse 则是伤害性辱骂。", "He abused power, abused the medicine, and verbally abused everyone who objected.", "他滥用权力、滥用药物，还辱骂所有反对者。"),
    ["How does the pronunciation change from noun to verb?", "abuse 作名词和动词时读音如何变化？", "The noun ends in /s/; the verb ends in /z/.", "名词末尾读 /s/，动词末尾读 /z/。"],
    ["The inquiry exposed the official's ________ of public funds.", "调查揭露了该官员对公共资金的滥用。", "Abuse of funds is improper or corrupt use.", "abuse of funds 表示不当或腐败地使用资金。"], ["misuse", "protect", "conserve"]),

  vocab(30, "abut", "/əˈbʌt/", "verb", "邻接，毗邻：adjacent", "to touch or share a boundary with", "与……邻接，毗邻",
    "两块土地边缘严丝合缝地碰在一起，共享同一条边界。",
    [["abut the property", "与该地产相邻", "A public path abuts the property.", "一条公共小路与该地产相邻。"], ["abut on a river", "毗邻河流", "The gardens abut on the river.", "花园毗邻河流。"], ["abutting buildings", "相邻建筑", "Fire spread through the abutting buildings.", "火势蔓延至相邻建筑。"]],
    [["adjacent", "相邻的", "原表注解 · 词性对比", "adjacent 是形容词；abut 是动词，直接描述边界相接。", "The museum occupies the adjacent building.", "博物馆位于相邻建筑。"], ["adjoin", "邻接", "近义词", "adjoin 与 abut 很接近；abut 更强调边界或末端相碰。", "The kitchen adjoins the dining room.", "厨房与餐厅相连。"]],
    M("声音联想（非词源）：abut ≈“a butt”——两只羊用 butt 顶住彼此，边界贴得严丝合缝。", "可靠词源：来自古法语 abouter“首尾相接、以端相触”，其中 bout 指“末端”；不宜直接当作现代 a + butt 的真实构词。", "熟词桥：butt against 表示“顶着”；abut on/against a wall 就是边缘与墙直接相接。", "两间小屋的屋屁股 butt 在一起，中间连一张纸都塞不下，却各自没有跨过边界。", "核心是 touch/share a boundary，不只是 nearby；两者必须真正接触。", "abut 可直接接宾语，也可说 abut on/against；adjacent 有时只表示相邻，不保证接触。", "The tiny hut abutted the palace wall, so its back door opened into a royal painting.", "小屋紧贴宫墙，结果后门一开就撞进一幅皇家壁画。"),
    ["What geometric fact does abut imply?", "abut 隐含怎样的空间关系？", "The two things touch or share a boundary.", "两物相接或共享边界。"],
    ["The proposed road will ________ a protected wetland.", "拟建道路将紧邻一片受保护湿地。", "Abut means directly border or touch.", "abut 表示直接接壤。"], ["adjacent", "distant", "separate"]),
];

const finalWords = [
  vocab(31, "abysmal", "/əˈbɪz.məl/", "adjective", "极低、极可怜：immeasurably low; 程度极深：immeasurably great", "extremely bad or, literally, immeasurably deep", "糟糕透顶的；深不可测的",
    "站在 abyss 深渊边缘向下看：深得无法测量，评价也低到谷底。",
    [["abysmal performance", "极差的表现", "The team's abysmal performance surprised its supporters.", "球队糟糕透顶的表现令支持者震惊。"], ["an abysmal record", "极差的记录", "The agency has an abysmal safety record.", "该机构的安全记录极差。"], ["abysmal depths", "深不可测的深处", "The probe descended into abysmal depths.", "探测器下降到深不可测之处。"]],
    [["immeasurably low", "低得无法衡量", "原表注解 · 评价义", "现代常用义是质量或水平极低。", "Public trust fell to an immeasurably low level.", "公众信任降至极低水平。"], ["immeasurably great in depth or extent", "在深度或程度上深不可测的", "原表注解 · 深度义", "这个较少见的本义来自 abyss，只适合深度或极端程度；不能把 abysmal 泛化成褒义的“非常伟大”。", "An abysmal gulf opened beneath the bridge.", "桥下裂开一道深不可测的鸿沟。"], ["dreadful", "极糟的", "近义词", "dreadful 范围更口语；abysmal 常用于表现、标准、记录。", "The service was dreadful.", "服务糟透了。"]],
    M("声音联想（非词源）：abysmal ≈“阿鼻深渊门”——分数掉进深渊门，低到看不见。", "可靠词根：abysmal 来自 abyss“深渊”；abyss 又源于希腊语 abyssos“无底的”（a- 无 + byssos 深处/底部）。", "熟词桥：直接锁定熟词 abyss；an abysmal performance 就是表现掉进 abyss。", "老师把试卷扔进无底深渊，分数 -100 仍在向下掉，旁边写着“abysmal service”。", "“深不可测”被比喻成程度低得可怕，所以现代常用义是 extremely bad。", "abysmal 通常不是中性的“很深”，而是强烈负面的“糟糕透顶”；不要与 abyssal 的科学“深海的”混淆。", "His abysmal score fell into an abyss and was still falling at graduation.", "他糟透的分数掉进深渊，直到毕业时还在下坠。"),
    ["What noun gives abysmal its mental image?", "哪个名词构成 abysmal 的核心图像？", "Abyss: a seemingly bottomless depth.", "abyss，即无底深渊。"],
    ["The hospital was criticized for its ________ hygiene standards.", "医院因卫生标准极差受到批评。", "Abysmal intensifies a very negative evaluation.", "abysmal 强烈表示糟糕透顶。"], ["dreadful", "excellent", "adequate"]),

  vocab(32, "accede", "/əkˈsiːd/", "intransitive verb", "赞成：approval, consent; 就任：come into an office", "to consent to a request or assume an office", "同意请求；就任职位或继承王位",
    "先点头同意一项请求，再走上台阶接任职位——两个义项都是“走向”。",
    [["accede to a request", "同意请求", "The board acceded to the workers' request.", "董事会同意了工人的请求。"], ["accede to pressure", "屈从压力", "The minister refused to accede to political pressure.", "部长拒绝屈从政治压力。"], ["accede to the throne", "继承王位", "She acceded to the throne at the age of twenty.", "她二十岁继承王位。"]],
    [["consent / approval", "同意；赞成", "原表注解 · 同意义", "consent/approval 可表示一般同意；accede to 常暗示经过犹豫后终于答应请求、要求或压力。", "They gave their consent to the search.", "他们同意进行搜查。"], ["come into office", "就任", "原表注解 · 职位义", "accede to office/throne 是正式接任，不等于普通 arrive。", "The president came into office in May.", "总统五月就任。"], ["acquiesce", "默许；勉强同意", "易混词", "acquiesce 强调被动、无抗议；accede 常有明确同意某请求。", "She acquiesced without enthusiasm.", "她不情愿地默许了。"]],
    M("声音联想（非词源）：accede ≈“I concede”——听到请求后说 I concede，表示同意让步。", "可靠词根：拉丁语 accedere = ad-（向）+ cedere（走、前进），本义是“走近、进入”；由此发展为进入职位或同意请求。", "熟词桥：concede 是“承认、让步”，recede 是“后退”，precede 是“走在前面”；共同的 -cede- 与“走”有关。", "他对请求点头说 I concede，随即沿红毯走向王座，一步完成“同意”和“就任”两义。", "向请求“走近”就是同意；走进 office/throne 就是就任或继位。两个常用义都由 accede to 连接。", "必须说 accede to a request/the throne，不直接说 accede the request；accede 也不等于 access。", "He acceded to the request and, an hour later, acceded to the throne.", "他同意了请求，一小时后又继承了王位。"),
    ["Complete both phrases: accede ___ a request; accede ___ the throne.", "补全两个搭配。", "Both use to.", "两者都使用 to。"],
    ["After weeks of resistance, management ________ to the demand.", "抵制数周后，管理层同意了该要求。", "Accede to a demand means finally consent.", "accede to a demand 表示最终同意。"], ["consent", "refuse", "protest"]),

  vocab(33, "accelerate", "/əkˈsel.ə.reɪt/", "verb", "加速：faster; 使提前：earlier; 变大变多：greater", "to increase speed, rate, or pace; to cause earlier development", "加速；促进；使提前发生",
    "踩下加速器，时间轴上的事件向前移动，增长曲线也变得更陡。",
    [["accelerate growth", "加速增长", "Lower costs accelerated market growth.", "成本下降加速了市场增长。"], ["accelerate the process", "加快过程", "Automation accelerated the review process.", "自动化加快了审查过程。"], ["accelerate rapidly", "迅速加速", "Inflation accelerated rapidly after the shock.", "冲击后通胀迅速加剧。"]],
    [["faster", "更快", "原表注解 · 速度结果", "accelerate 是动词，faster 描述加速后的速度。", "The second train moved faster.", "第二列火车行驶更快。"], ["earlier", "更早", "原表注解 · 时间结果", "accelerate development 可使事件更早发生，不必涉及物理速度。", "The crisis brought reform earlier than expected.", "危机使改革提前发生。"], ["greater", "更大更多", "原表注解 · 程度结果", "经济指标 accelerate 常指增长率变大，不只是数量本身增加。", "Demand grew greater each month.", "需求逐月增大。"]],
    M("中文谐音：accelerate ≈“一踩了它”——一踩油门，它立刻加速。", "可靠词根：拉丁语 accelerare，来自 ad-（使、向）+ celer（迅速的）；celerity 也表示“迅速”。", "熟词桥：accelerator 是“油门、加速器”；看到 accelerator 就反推动词 accelerate。", "你“一踩了它”，汽车、时钟和经济增长曲线同时冲出屏幕，原定明天的事提前一小时发生。", "increase speed/rate 会让进程更早完成，也让单位时间的增长更大；共同核心是“速率上升”。", "accelerate growth 是提高增长速度，不等于只增加总量；不要漏写中间的 -eler-。", "I stepped on the accelerator, and one tiny pedal accelerated the car, the clock, and the economy.", "我踩下油门，一个小踏板让汽车、时钟和经济同时加速。"),
    ["How can a policy accelerate an event without moving anything physically?", "政策如何在没有物理移动时 accelerate 一件事？", "It can increase the rate of development or make the event occur earlier.", "它可提高发展速度或使事件更早发生。"],
    ["The discovery could ________ the development of new treatments.", "这一发现可能加速新疗法的开发。", "Accelerate can speed a process or development.", "accelerate 可加速过程或发展。"], ["hasten", "delay", "retard"]),

  vocab(34, "accessible", "/əkˈses.ə.bəl/", "adjective", "可以达到：within easy reach; 可以理解：understood; 能够获得：get", "easy to reach, obtain, use, or understand", "可到达的；可获得的；易懂的；无障碍的",
    "一扇门同时向身体、信息和理解敞开：人能到、能拿、能懂。",
    [["accessible to the public", "公众可使用的", "The archive is accessible to the public online.", "该档案馆可供公众在线访问。"], ["an accessible explanation", "易懂的解释", "The book offers an accessible explanation of genetics.", "这本书对遗传学作了通俗解释。"], ["wheelchair-accessible", "无障碍通行的", "Every entrance is wheelchair-accessible.", "每个入口都可供轮椅通行。"]],
    [["within easy reach", "容易到达", "原表注解 · 空间义", "accessible 强调实际可接近；nearby 只说明距离近。", "Emergency equipment must remain within easy reach.", "急救设备必须放在易取之处。"], ["understandable", "可理解的", "原表注解 · 认知义", "accessible writing 不仅能理解，通常还友好、少术语。", "The instructions are understandable.", "说明可以理解。"], ["available", "可获得的", "原表注解 · 资源义", "available 表示存在可用；accessible 还要求使用者能够取得。", "The data are available but not easily accessible.", "数据虽存在，却不易获取。"]],
    M("声音联想（中英混合）：accessible = access +“able”——能 access 进去，就是可到达、可获得或易理解。", "可靠构词：access + -ible（能够……的）；access 最终来自拉丁语 accedere“走近”。", "熟词桥：access 是入口/获取权；accessibility 是可达性。把 accessible 直接理解为 easy to access。", "一把写着 ACCESS 的万能钥匙同时打开坡道、数据库和一本难书：人能到、资料能拿、思想能懂。", "reach、obtain、use、understand 都是广义的“进入”；障碍被移除就 accessible。", "available 只说“存在可用”，accessible 还要求实际拿得到/到得了/看得懂；拼写是 -sible，不是 accessable。", "The accessible library offered ramps, open data, and books that beginners could understand.", "这座无障碍且易用的图书馆有坡道、开放数据和初学者能读懂的书。"),
    ["Give three dimensions of accessibility.", "说出 accessible 的三个维度。", "Physical reach, practical availability, and ease of understanding.", "物理可达、实际可获取、认知易理解。"],
    ["The lecturer made a complex topic ________ to beginners.", "讲师让复杂话题变得初学者也能理解。", "Accessible can mean easy to understand.", "accessible 可表示易于理解。"], ["understandable", "remote", "obscure"]),

  vocab(35, "accessory", "/əkˈses.ər.i/", "noun · adjective", "辅助附属：secondary, supplementary, subordinate; 帮凶：one connected with wrongdoing", "a supplementary object or a person who assists wrongdoing", "配件，附属物；从犯，帮凶",
    "主角旁边站着一个“配角”：可以是给设备加功能的配件，也可以是帮助犯罪的人。",
    [["a fashion accessory", "时尚配饰", "The scarf is an accessory rather than essential clothing.", "围巾是配饰，并非必需衣物。"], ["an accessory to the crime", "犯罪帮凶", "He was convicted as an accessory to the crime.", "他作为该罪行的从犯被定罪。"], ["accessory equipment", "辅助设备", "The price excludes accessory equipment.", "价格不包括辅助设备。"]],
    [["secondary / supplementary", "次要的；补充性的", "原表注解 · 物品义", "secondary 强调不是主要部分，supplementary 强调增加功能；accessory 常指兼具这两点的配套物件。", "The appendix provides supplementary data of secondary importance.", "附录提供重要性居次的补充数据。"], ["subordinate", "次要的；从属的", "原表注解 · 层级义", "subordinate 强调较低地位；accessory 强调附属或辅助。", "The aesthetic issue is subordinate to safety.", "美观问题从属于安全。"], ["accomplice", "共犯", "原表注解 · 帮凶义", "accomplice 参与犯罪；accessory 可能在事前或事后提供帮助。", "Police arrested the thief's accomplice.", "警方逮捕了小偷的共犯。"]],
    M("声音联想（中英混合）：accessory ≈“access 额外的”——主体旁边额外接上的配件。", "可靠词源：经中世纪拉丁语 accessorius“附加的”，源于 accedere“走近、加入”；这里的核心是 added/supplementary。", "熟词桥：phone accessories 是手机配件；法律短语 accessory to a crime 把“附加帮助”转为“从犯”。", "主犯背着一个巨大的手机壳，壳上写 ACCESSORY；它既是配饰，又跳下来帮他搬赃物，立刻成了从犯。", "不是主体，却附在主体旁并提供帮助：这连接了“配件”和“帮凶”两个义项。", "法律义固定说 an accessory to a crime；accessory 通常是附加物，essential component 则不可缺。", "The thief wore a glittering accessory and brought an accessory to the crime.", "小偷戴着闪亮配饰，还带来一个犯罪帮凶。"),
    ["What shared idea links a handbag and a criminal accessory?", "手袋配件与犯罪帮凶有什么共同核心？", "Both are secondary additions that assist a primary thing or actor.", "二者都是辅助主体的次要附加者。"],
    ["The driver was charged as an ________ to the robbery.", "司机被作为抢劫案从犯起诉。", "Accessory to a crime is a legal expression.", "accessory to a crime 是法律固定表达。"], ["supplement", "principal", "victim"]),
];

const lastWords = [
  vocab(36, "accidental", "/ˌæk.sɪˈden.təl/", "adjective", "偶然发生：unexpectedly; 附带非关键：not a vital part", "happening by chance; incidental rather than essential", "偶然的；非本质的、附带的",
    "一滴墨水意外落在图纸角落；它确实存在，却不是设计的核心部分。",
    [["an accidental discovery", "偶然发现", "Penicillin began with an accidental discovery.", "青霉素始于一次偶然发现。"], ["accidental damage", "意外损坏", "The policy covers accidental damage.", "该保单承保意外损坏。"], ["an accidental feature", "非本质特征", "Color is accidental to the logical structure.", "颜色对于逻辑结构而言是非本质特征。"]],
    [["unexpectedly", "出乎意料地", "原表注解 · 发生方式", "unexpected 不必由偶然造成；accidental 明确表示非故意。", "The result changed unexpectedly.", "结果出乎意料地变化。"], ["incidental", "附带的；次要的", "原表注解 · 非本质义", "incidental 常指伴随发生的次要事物；accidental 在哲学中可指非本质属性。", "Travel costs are incidental to the main project.", "差旅费是项目的附带成本。"], ["deliberate", "故意的", "反义词", "deliberate 有意计划；accidental 非故意。", "The omission was deliberate.", "这次遗漏是故意的。"]],
    M("声音联想（非词源）：accidental ≈“爱克西登台”——他登台时意外踩到香蕉皮，纯属偶然。", "可靠词根：accident 来自拉丁语 accidere = ad-（向、发生于）+ cadere（落下）；原意近似“落到某人身上的事情”。", "熟词桥：incident、coincidence 也带有“发生、落下”的 -cid- 线索；by accident 就是“偶然地”。", "爱克西一登台，天花板意外落下一滴墨；它留在图纸角落，却不影响机器的核心结构。", "“偶然落到身上、非故意发生”进一步得到哲学/逻辑中的“附带而非本质”。", "accidental 的关键是 unintentional/by chance，不只是 surprising；与 incidental 都可指附带，但 accidental 更突出偶然。", "An accidental drop of ink became an accidental detail rather than an essential part of the design.", "一滴意外落下的墨成了附带细节，而不是设计的本质部分。"),
    ["How can a property be accidental without being caused by an accident?", "一种属性如何在并非事故造成时仍是 accidental？", "It can be nonessential: the object could remain what it is without that property.", "它可以是非本质的：缺少该属性，事物仍是原来的事物。"],
    ["Investigators concluded that the fire was ________, not deliberate.", "调查人员认定火灾属于意外，并非故意。", "Accidental contrasts directly with deliberate.", "accidental 与 deliberate 直接相反。"], ["unexpected", "intentional", "essential"]),

  vocab(37, "acclimate", "/ˈæk.lə.meɪt/", "verb", "使适应：change to make suitable", "to adapt to a new climate, environment, or condition", "使适应新气候、环境或条件",
    "从寒冷室外进入温室，身体的“内部恒温器”慢慢重新校准。",
    [["acclimate to the heat", "适应炎热", "Athletes need time to acclimate to the heat.", "运动员需要时间适应高温。"], ["become acclimated", "逐渐适应", "The seedlings became acclimated to outdoor conditions.", "幼苗逐渐适应了室外条件。"], ["acclimate oneself", "使自己适应", "She acclimated herself to the high altitude gradually.", "她逐渐使自己适应高海拔。"]],
    [["adapt", "适应；改造", "原表注解 · 上位近义", "adapt 范围很广；acclimate 特别强调对环境、气候或条件的生理/习惯适应。", "The species adapted to urban life.", "该物种适应了城市生活。"], ["make suitable", "使适合", "原表注解 · 结果", "make suitable 可主动改造对象；acclimate 常是对象自身逐步适应。", "The editor made the text suitable for children.", "编辑使文本适合儿童。"], ["acclimatize", "使适应环境", "近义变体", "acclimatize 在英式英语中常见，含义近似。", "Climbers acclimatized before the ascent.", "登山者在攀登前适应了环境。"]],
    M("声音联想（中英混合）：acclimate =“爱 climate”——先学会爱上新 climate，身体才慢慢适应。", "可靠构词边界：经法语 acclimater 形成，明显建立在 climate“气候”之上；不需要再把 ac- 硬拆出额外含义。", "熟词桥：climate 就藏在 acclimate 中；acclimatize、acclimation 都属于同一家族。", "企鹅搬进热带办公室，抱着一个 climate 旋钮每天调一格，一周后终于不再穿冰箱上班。", "从适应新气候扩展到适应任何 unfamiliar environment/condition，且通常是渐进过程。", "acclimate 需要时间；adapt 范围更广，也可主动改造物品。常说 acclimate to a new environment。", "The penguin slowly acclimated to the tropical office by turning its inner climate dial one degree a day.", "企鹅每天把体内气候旋钮调高一度，慢慢适应了热带办公室。"),
    ["What kind of adaptation does acclimate especially suggest?", "acclimate 特别暗示哪类适应？", "Gradual adjustment to climate or environmental conditions.", "对气候或环境条件的逐渐调节。"],
    ["New arrivals need several days to ________ to the altitude.", "新来者需要数日适应海拔。", "Acclimate to altitude is a standard use.", "acclimate to altitude 是典型用法。"], ["adapt", "resist", "displace"]),

  vocab(38, "accolade", "/ˈæk.ə.leɪd/", "noun", "同意赞赏：approval; 赞扬：praise", "an award, honor, or expression of high praise", "荣誉；奖项；赞誉",
    "聚光灯下，一条象征荣誉的绶带被披到获奖者肩上。",
    [["receive an accolade", "获得荣誉", "The scientist received the field's highest accolade.", "这位科学家获得该领域最高荣誉。"], ["critical accolades", "评论界赞誉", "The film won critical accolades but few viewers.", "影片赢得评论界赞誉，却观众寥寥。"], ["heap accolades on", "大加赞誉", "Reviewers heaped accolades on the debut novel.", "评论家对这部处女作大加赞誉。"]],
    [["approval", "认可；赞同", "原表注解 · 相关概念", "approval 可以只是同意；accolade 通常是公开而高度的赞誉或奖项。", "The plan won regulatory approval.", "计划获得监管批准。"], ["praise", "赞扬", "原表注解 · 上位词", "praise 可轻可重；accolade 是正式、显著的 praise。", "The teacher praised her careful work.", "老师称赞她工作细致。"], ["tribute", "致敬；颂词", "近义词", "tribute 表示敬意，未必是奖项；accolade 可具体指荣誉。", "The concert was a tribute to the composer.", "音乐会向作曲家致敬。"]],
    M("中文谐音：accolade ≈“阿哥来得奖”——阿哥一来就获得最高荣誉。", "可靠词源：来自法语 accolade“拥抱、授勋动作”，可追溯到拉丁语 ad collum“到颈部”；授勋时曾有拥抱或触肩动作。", "熟词桥：award、honor、praise 都可汇入 accolade；receive/win an accolade 是常用搭配。", "阿哥来领奖，国王把金色绶带绕到他颈上，金勺王冠也落在肩头，全场鼓掌。", "公开的高度 praise 若凝结成奖项、称号或荣誉，就是 accolade。", "普通 approval 不够强，accolade 指显著赞誉或荣誉；常为可数名词，win numerous accolades。", "A-Ge came to collect an accolade: a golden crown made entirely of spoons.", "阿哥来领取一项荣誉——一顶完全由金勺制成的王冠。"),
    ["Why is regulatory approval not normally an accolade?", "为什么监管批准通常不叫 accolade？", "Approval may merely authorize; an accolade expresses high honor or praise.", "approval 可能只是许可；accolade 表示高度荣誉或赞誉。"],
    ["The prize is widely regarded as the profession's highest ________.", "该奖被公认为这一职业的最高荣誉。", "An accolade can be a distinguished award.", "accolade 可指重要奖项。"], ["praise", "censure", "rebuke"]),

  vocab(39, "accommodate", "/əˈkɒm.ə.deɪt/", "verb", "提供所需：provide; 改变以适应：make suitable; 使和谐：free of conflicts", "to provide room or needs, adapt, or reconcile differences", "容纳；提供所需；调整适应；调和",
    "一间会变形的房间：加床容纳客人、移动墙壁适应需求、把冲突双方安排妥当。",
    [["accommodate guests", "为客人提供住宿；容纳客人", "The lodge can accommodate fifty guests.", "旅馆可容纳五十名客人。"], ["accommodate changing needs", "适应不断变化的需求", "The schedule was revised to accommodate changing needs.", "日程经过修改以适应变化的需求。"], ["accommodate differences", "调和差异", "A durable agreement must accommodate regional differences.", "持久协议必须调和地区差异。"]],
    [["provide", "提供", "原表注解 · 供给义", "provide 强调给予资源；accommodate 常同时意味着安排空间或调整条件。", "The clinic provides free care.", "诊所提供免费医疗。"], ["adapt", "调整以适应", "原表注解 · 调整义", "adapt 可改变自己或对象；accommodate 往往改变计划或安排，为某项需求腾出空间。", "We adapted the lesson for beginners.", "我们调整课程以适合初学者。"], ["reconcile", "调和；使一致", "原表注解 · 和谐义", "reconcile 直接解决矛盾；accommodate differences 可保留差异但安排共存。", "The theory reconciles two conflicting results.", "该理论调和了两个冲突结果。"]],
    M("声音联想（非词源）：accommodate ≈“阿哥们，得挪”——阿哥们得挪床，才能容纳新客人。", "可靠词根：拉丁语 accommodare，来自 ad-（向、使）+ commodus（合适、便利），即“使之合适”。", "熟词桥：accommodation 是住宿/调整措施；commodious 表示宽敞的，可帮助记住“给出合适空间”。", "酒店经理喊“阿哥们，得挪！”墙壁立刻伸缩、床铺自动加长，还把两个争吵乐团隔开。", "为人或物“使条件合适”可表现为容纳、提供所需、调整安排或调和冲突。", "拼写有双 c、双 m：accommodate；accommodate guests 是容纳，accommodate a request 是设法满足。", "The elastic hotel accommodated guests, wheelchairs, and two rival orchestras by moving every wall.", "这家弹性酒店移动所有墙壁，容纳了客人、轮椅和两个敌对乐团。"),
    ["What single idea links housing guests and adapting a schedule?", "容纳客人与调整日程共享什么核心？", "Making room—physical or figurative—for a need.", "为某种需求腾出物理或比喻空间。"],
    ["The policy was revised to ________ small businesses.", "政策经修订以照顾小企业的需求。", "Accommodate can mean adjust to meet a need.", "accommodate 可表示调整以满足需要。"], ["provide", "exclude", "disrupt"]),

  vocab(40, "accost", "/əˈkɒst/", "transitive verb", "以挑衅形式搭讪：challenging or aggressive way", "to approach and address someone boldly or aggressively", "贸然上前搭话；挑衅性地接近",
    "陌生人突然挡住去路，逼近并开口，让人没有从容回应的空间。",
    [["be accosted by a stranger", "被陌生人贸然搭话", "She was accosted by a stranger outside the station.", "她在车站外被陌生人贸然拦住搭话。"], ["accost someone in the street", "在街上拦住某人搭话", "Reporters accosted the minister in the street.", "记者们在街上围住部长发问。"], ["aggressively accost", "挑衅性地搭讪", "The guard aggressively accosted peaceful visitors.", "警卫挑衅性地盘问和平来访者。"]],
    [["a challenging or aggressive approach", "带挑衅或攻击性的接近搭话", "原表注解 · 完整动作", "accost 不只是走近：还要主动开口，而且方式通常突然、冒犯或咄咄逼人。", "The stranger's aggressive approach made the passengers uneasy.", "陌生人咄咄逼人的接近令乘客不安。"], ["confront", "当面对质", "近义词", "confront 聚焦直面问题或人；accost 还包含主动靠近并说话。", "She confronted him about the missing funds.", "她就失踪资金当面质问他。"], ["approach", "接近；搭话", "中性对比", "approach 中性；accost 常突然、冒犯或带攻击性。", "A student approached the lecturer politely.", "一名学生礼貌地走近讲师。"], ["waylay", "拦截；伏击", "近义词", "waylay 强调堵截路线；accost 强调接近并搭话。", "Protesters waylaid the convoy.", "抗议者拦住了车队。"]],
    M("声音联想（非词源）：accost ≈“阿哥靠死”——陌生阿哥突然靠得太近，堵住你厉声搭话。", "可靠词源：经法语 accoster、意大利语 accostare，字面是“走到旁边”；与拉丁语 costa“肋骨、侧边”相关。", "熟词桥：coast 也来自表示“侧边”的 costa；把 accost 记成 come alongside and address，但语气通常冒犯。", "阿哥贴到你身侧，像一堵会说话的墙拦住去路，突然要求你交“企鹅税”。", "完整动作是 boldly/aggressively approach + address，不只是看见或靠近。", "accost 不等于中性的 greet/approach，往往让对方不舒服；它也不来自 a + cost，cost 只能作声音钩子，不能当词根。", "A penguin accosted the mayor in the street and loudly demanded a new fish tax.", "一只企鹅在街上拦住市长，大声要求征收新的鱼税。"),
    ["Why is accost stronger than approach?", "为什么 accost 比 approach 更强？", "It implies a bold, abrupt, or aggressive approach followed by speech.", "它暗示突然或挑衅地接近并开口。"],
    ["Journalists ________ the official as he left the courthouse.", "官员离开法院时被记者们围住发问。", "Accost fits an abrupt, forceful approach.", "accost 适合突然强势接近的语境。"], ["confront", "greet", "avoid"]),
];

const all = [...words, ...moreWords, ...finalWords, ...lastWords];
const group = (start) => all.slice(start - 21, start - 16);

export const set05 = compactSet(5, "The Absolute Banquet", group(21), {
  title: "The Absolute Banquet",
  targetForms: ["absolute", "absolved", "abstained", "abstemious", "abstracted"],
  plain: "An absolute monarch absolved a goat of treason, abstained from dessert, praised an abstemious dragon, and abstracted the entire constitution into a drawing of one enormous spoon.",
  translation: "一位专制君主免除了一只山羊的叛国罪，主动不吃甜点，赞扬了一条饮食节制的龙，还把整部宪法概括成一幅巨勺图。",
});
export const set06 = compactSet(6, "The Scholar at the Fence", group(26), {
  title: "The Scholar at the Fence",
  targetForms: ["abstruse", "absurd", "abundant", "abused", "abutted"],
  plain: "An abstruse scholar proposed an absurd theory: abundant cheese had abused its authority because every wheel of it abutted the palace fence at midnight.",
  translation: "一位深奥学者提出荒谬理论：大量奶酪滥用了权力，因为每轮奶酪午夜都紧贴宫殿围墙。",
});
export const set07 = compactSet(7, "The Abysmal Coronation", group(31), {
  title: "The Abysmal Coronation",
  targetForms: ["abysmal", "acceded", "accelerated", "accessible", "accessory"],
  plain: "After an abysmal coronation, a turtle acceded to the throne, accelerated the royal elevator, made every tower accessible, and wore a jeweled toaster as his favorite accessory.",
  translation: "一场糟透的加冕礼后，一只乌龟继承王位，加速皇家电梯，让每座塔都可进入，还把一台镶宝石的烤面包机当作最爱的配饰戴在身上。",
});
export const set08 = compactSet(8, "The Elastic Hotel", group(36), {
  title: "The Elastic Hotel",
  targetForms: ["accidental", "acclimate", "accolade", "accommodate", "accosted"],
  plain: "An accidental snowstorm forced flamingos to acclimate indoors, where the hotel won an accolade for stretching to accommodate them until a furious penguin accosted the doorman.",
  translation: "一场意外暴雪迫使火烈鸟适应室内生活；酒店因伸展建筑容纳它们而获奖，直到一只愤怒企鹅拦住门卫质问。",
});
