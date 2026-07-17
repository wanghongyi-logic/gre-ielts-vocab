import { lesson, memory, set } from "./range-136-170-helpers.js";

const set28Lessons = [
  lesson({
    number: 136,
    word: "apt",
    ipa: "/æpt/",
    pos: "adjective",
    register: "中性；“聪明的”义偏正式",
    rawNote: "恰当的，合适的：suitable, appropriate; 有倾向的，可能的：tendency, likely; 聪明的：intelligent, responsive",
    coreEn: "exactly suitable; likely or naturally inclined; quick to learn",
    coreZh: "恰当贴切的；易于、倾向于；聪颖而学得快的",
    imageZh: "一把钥匙恰好插进锁孔；同一个学生又总容易注意到规律，并能迅速学会开锁。",
    senses: [
      ["SUITABLE", "恰当、贴切", "强调描述、评论、比喻或选择与具体情境贴合得很准。", [
        ["an apt description", "贴切的描述", "“A paper maze” is an apt description of the old permit system.", "“纸做的迷宫”是对旧许可制度的贴切描述。"],
        ["an apt metaphor", "恰当的比喻", "The bridge is an apt metaphor for the treaty.", "这座桥是该条约的恰当比喻。"],
        ["an apt choice", "合适的选择", "Blue was an apt choice for the calm reading room.", "蓝色是安静阅览室的合适选择。"],
      ], [
        ["Her remark was brief but remarkably apt.", "她的评论很简短，却异常贴切。"],
        ["The title is apt for a book about second chances.", "这个标题很适合一本讨论第二次机会的书。"],
      ]],
      ["LIKELY", "有倾向、很可能", "固定结构 be apt to do 表示某人或某物具有反复出现的倾向，因此某事容易发生。", [
        ["be apt to forget", "容易忘记", "Without a list, I am apt to forget one small item.", "没有清单时，我很容易忘掉一件小东西。"],
        ["be apt to leak", "容易漏水", "This flat roof is apt to leak after heavy snow.", "这座平屋顶在大雪后容易漏水。"],
        ["be apt to change", "往往会变化", "Public moods are apt to change quickly.", "公众情绪往往变化很快。"],
      ], [
        ["Young plants are apt to bend toward the light.", "幼苗往往会朝光线弯曲。"],
        ["He is apt to answer before hearing the whole question.", "他往往没听完整个问题就回答。"],
      ]],
      ["QUICK TO LEARN", "聪颖、领悟快", "较正式地形容学生或学习者天资敏捷，能迅速理解并作出恰当反应。", [
        ["an apt pupil", "聪颖的学生", "The apt pupil mastered the pattern after two examples.", "这名聪颖的学生看两个例子就掌握了规律。"],
        ["an apt student", "领悟快的学生", "She was an apt student of languages and accents.", "她学习语言和口音很有悟性。"],
        ["an apt learner", "学得快的人", "An apt learner asks precise questions.", "领悟快的学习者会提出精准的问题。"],
      ], [
        ["The tutor found him apt and unusually observant.", "导师发现他聪颖而且观察力异常敏锐。"],
        ["Even as a child, she was an apt learner of musical patterns.", "她小时候学习音乐规律就很有悟性。"],
      ]],
    ],
    comparisons: [
      ["suitable", "/ˈsuː.t̬ə.bəl/", "原表注解 · 常用近义词", "适合特定目的或条件的", "suitable 范围最广；apt 往往多一层“选得很准、说得很贴切”。", [["The room is suitable for small meetings.", "这个房间适合小型会议。"]]],
      ["appropriate", "/əˈproʊ.pri.ət/", "原表注解 · 规范性近义词", "恰当的；符合场合或规则的", "appropriate 强调符合情境、礼仪或标准；apt 常强调语言、比喻或选择精准命中。", [["Formal dress is appropriate for the ceremony.", "正式服装适合这场典礼。"]]],
      ["tendency", "/ˈten.dən.si/", "原表注解 · 名词关系", "倾向；趋势", "tendency 不是 apt 的同义词；be apt to do 用形容词结构表达一种反复出现的 tendency。", [["The machine has a tendency to overheat.", "这台机器有过热的倾向。"]]],
      ["likely", "/ˈlaɪ.kli/", "原表注解 · 概率近义", "可能发生的", "likely 可陈述一次事件的概率；be apt to 更常暗示人或事物一贯容易如此。", [["Rain is likely tonight.", "今晚很可能下雨。"]]],
      ["intelligent", "/ɪnˈtel.ə.dʒənt/", "原表注解 · 能力近义", "聪明的；理解力强的", "intelligent 是广义智力高；apt 的此义更具体，指学习快、领悟敏捷。", [["She is intelligent enough to question the assumption.", "她很聪明，懂得质疑这个假设。"]]],
      ["responsive", "/rɪˈspɑːn.sɪv/", "原表注解 · 表现关系", "反应快的；有响应的", "responsive 强调对刺激、意见或治疗作出反应；apt pupil 是因为天资而学得快，不等于单纯愿意回应。", [["The audience was responsive to the speaker's questions.", "听众对演讲者的问题反应积极。"]]],
      ["fitting", "/ˈfɪt̬.ɪŋ/", "补充近义词", "合宜的；相称的", "fitting 常强调某事在象征或道义上相称；apt 更突出精准、贴切。", [["The award was a fitting end to her career.", "这个奖项是她职业生涯一个相称的结尾。"]]],
      ["prone", "/proʊn/", "补充近义词 · 倾向义", "易于遭受或做某事的", "prone to 常指负面倾向，后接名词或 -ing；apt to 可中性地接动词原形。", [["The coastal road is prone to flooding.", "这条沿海公路容易被淹。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：apt 像“爱配它”——这把钥匙偏偏爱配这把锁，说明它选得恰当。",
      "可靠词源：来自拉丁语 aptus，意为 fitted、suited，历史核心就是“被接合好、很合适”。",
      "熟词桥：adapt 是“调整到适合”；apt 则直接表示 suited。再把 be apt to 整块记成“容易会……”。",
      "一把写着 apt 的钥匙精准开门；门后学生只看两次就学会，而旧屋顶又一到雨天就漏水。",
      "fit exactly → 恰当；人的行为模式很“贴合”某结果 → 容易发生；头脑很适合学习 → 聪颖。",
      "易混刹车：apt to do 表倾向，appropriate 表合乎场合；apt pupil 是学得快，不是 merely responsive。",
      "The apt pupil chose an apt metaphor but was apt to repeat it too often.",
      "聪颖的学生选了一个贴切的比喻，却又总爱把它重复太多遍。"
    ),
    recall: ["Name the three bridges from apt to its senses.", "怎样用三座桥串起 apt 的三层含义？", "Exactly suitable; apt to means likely or inclined; an apt learner is quick to learn.", "精准合适；apt to 表示容易或倾向；apt learner 表示领悟快。"],
    context: ["The roof is ________ to leak, and “a sieve” is an ________ description of it.", "屋顶容易漏水，而“筛子”是对它的贴切描述。两个空填同一词。", "Use apt in both blanks: apt to marks a tendency, while an apt description is exactly suitable.", "两空都用 apt：apt to 表倾向；an apt description 表示描述精准贴切。"],
    quiz: ["Which sentence uses apt to express learned ability rather than suitability or tendency?", "哪一句中的 apt 表示领悟能力，而不是合适或倾向？", "The apt pupil solved the new pattern immediately.", ["The old pipe is apt to freeze.", "“Labyrinth” is an apt description.", "The dress is appropriate for court."], "An apt pupil is naturally quick to learn.", "an apt pupil 指天资聪颖、学得快。"],
  }),

  lesson({
    number: 137,
    word: "archaic",
    ipa: "US /ɑːrˈkeɪ.ɪk/ · UK /ɑːˈkeɪ.ɪk/",
    pos: "adjective",
    register: "中性历史标签；评价现行制度时常带批评",
    rawNote: "过时的，久远的：no, current, antiquated",
    coreEn: "belonging to an ancient time or no longer current in form or use",
    coreZh: "古老久远的；形式或用法已经过时的",
    imageZh: "博物馆玻璃柜里放着古代文字；若有人还拿它填写现代电子表格，它就显得过时。",
    senses: [
      ["NO LONGER CURRENT", "陈旧、过时", "形容仍被看见却已不适合现代需要的词语、制度、观念或技术。", [
        ["an archaic law", "过时的法律", "The archaic law still refers to telegrams.", "这部过时法律仍然提到电报。"],
        ["archaic language", "古旧语言", "The contract is full of archaic language.", "这份合同充满古旧措辞。"],
        ["an archaic system", "陈旧的制度", "An archaic filing system slowed every application.", "陈旧的归档制度拖慢了每份申请。"],
      ], [
        ["The manual uses archaic terms that confuse new staff.", "手册使用过时术语，使新员工困惑。"],
        ["Their archaic assumptions no longer match social reality.", "他们陈旧的假设已不符合社会现实。"],
      ]],
      ["ANCIENT PERIOD", "属于古代或早期阶段", "作为历史或考古标签时可以是中性的，表示属于非常早的时期。", [
        ["the Archaic period", "古风时期；早期历史阶段", "The statue dates from the Archaic period of Greece.", "这尊雕像可追溯到希腊古风时期。"],
        ["an archaic script", "古代文字", "Researchers decoded an archaic script on the tablet.", "研究者解读了泥板上的古代文字。"],
        ["an archaic form", "古老形式", "The poem preserves an archaic form of the verb.", "这首诗保留了该动词的古老形式。"],
      ], [
        ["The cave preserves archaic symbols rather than modern writing.", "洞穴保存的是远古符号，而非现代文字。"],
        ["Some dialects retain archaic grammatical features.", "一些方言保留了古老的语法特征。"],
      ]],
    ],
    comparisons: [
      ["no / not current", "/noʊ/ · /nɑːt ˈkɝː.ənt/", "原表注解 · 碎片还原", "不再通行；不再现行", "原表的 no, current 应合起来理解为 not current；no 单独不是 archaic 的同义词。", [["That spelling is not current in modern English.", "那种拼写在现代英语中已不通行。"]]],
      ["current", "/ˈkɝː.ənt/", "原表注解 · 反向概念", "当前通行的；现行的", "current 指现在使用或有效，正是 archaic 在“过时”义上的反面。", [["Please consult the current version of the regulation.", "请查阅该法规的现行版本。"]]],
      ["antiquated", "/ˈæn.t̬ə.kweɪ.t̬ɪd/", "原表注解 · 批评性近义", "陈旧过时的", "antiquated 几乎总带负面评价；archaic 还可中性指一个古代历史阶段。", [["The office relies on antiquated equipment.", "办公室依赖陈旧设备。"]]],
      ["outdated", "/ˌaʊtˈdeɪ.t̬ɪd/", "补充近义词", "过时、不再准确或有用的", "outdated 是日常通用词；archaic 更强调年代久远，语气也更书面。", [["The website contains outdated advice.", "该网站含有过时建议。"]]],
      ["ancient", "/ˈeɪn.ʃənt/", "补充近义词 · 历史义", "古代的；年代极久的", "ancient 只说明极古老；archaic 除历史标签外还可暗示现代继续使用会显得不合时宜。", [["They uncovered an ancient road beneath the city.", "他们在城市下方发现一条古道。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：archaic 像“阿凯一开”——阿凯一开电脑，屏幕却要求插入软盘，古旧得离谱。",
      "可靠词源：来自希腊语 arkhaios（古老的），与 arkhē（开端、起源）相关；核心是“来自早期”。",
      "熟词桥：archaeology 研究古代遗存；archaic 描写属于古代或像古代遗物一样不再通行的东西。",
      "博物馆里的古代石板忽然被搬到办事大厅，工作人员坚持用石凿填写今日表格。",
      "early/ancient → 历史上的古老；old form surviving now → 过时、不合现代需要。",
      "易混刹车：archaic 不总是贬义；Archaic Greece 是中性历史标签。antiquated 则通常直接批评陈旧落后。",
      "The archaic rule required every email to arrive by horse.",
      "这条过时规则要求每封电子邮件都必须骑马送达。"
    ),
    recall: ["When is archaic neutral, and when is it critical?", "archaic 什么时候中性，什么时候带批评？", "It is neutral for an ancient historical period, but critical when an old system or idea is no longer suitable today.", "指古代历史阶段时可中性；指旧制度或观念已不适合今天时带批评。"],
    context: ["The statute's reference to telegram fees now seems ________.", "法规仍提电报费，如今显得怎样？", "Archaic fits because the wording survives from an earlier age and is no longer current.", "archaic 表示该措辞来自更早年代，今天已不再通行。"],
    quiz: ["Which use of archaic is a neutral historical label?", "哪一句把 archaic 用作中性历史标签？", "The vase belongs to Greece's Archaic period.", ["Their archaic payroll system wastes days.", "The current rules replaced the old code.", "The office bought antiquated printers."], "A named historical period can be archaic without being criticized as useless.", "命名的历史时期可以称 archaic，并不等于批评其无用。"],
  }),

  lesson({
    number: 138,
    word: "archetype",
    ipa: "US /ˈɑːr.kə.taɪp/ · UK /ˈɑː.kɪ.taɪp/",
    pos: "countable noun",
    register: "正式 · 文学、设计与心理学常用",
    rawNote: "典范，榜样：ideal; 先驱，鼻祖：earlier; 原型：copies",
    coreEn: "a perfect or typical example, or an original pattern behind later copies",
    coreZh: "典型典范；供后来事物仿效或复制的原始模型；原型意象",
    imageZh: "一枚最初的模具先压出无数复制品，后来又成为人们心里“这一类事物应有的样子”。",
    senses: [
      ["TYPICAL IDEAL", "某一类型的典型或典范", "指集中体现一类事物关键特征的代表性实例，有时接近理想榜样。", [
        ["the archetype of a hero", "英雄的典型", "She became the archetype of the reluctant hero.", "她成了“不情愿英雄”这一类型的典型。"],
        ["a cultural archetype", "文化典型", "The wandering sage is a familiar cultural archetype.", "游方智者是熟悉的文化典型。"],
        ["an archetype of courage", "勇气的典范", "For the village, the nurse was an archetype of courage.", "对村民而言，这名护士是勇气的典范。"],
      ], [
        ["The character is an archetype rather than a fully individualized person.", "这个角色是一个类型典型，而非充分个体化的人物。"],
        ["The small cooperative became an archetype for community-owned businesses.", "这家小型合作社成了社区所有制企业的典范。"],
      ]],
      ["ORIGINAL MODEL", "先于后来版本的原始模型", "指时间上更早、后来版本或 copies 由它发展而来的原型；中文可据语境译作鼻祖，但并非泛指任何先驱人物。", [
        ["the archetype for later designs", "后来设计的原型", "This chair was the archetype for dozens of later designs.", "这把椅子是后来数十种设计的原型。"],
        ["an original archetype", "原始范型", "The archive preserves the original archetype behind the copies.", "档案馆保存着这些复制品背后的原始范型。"],
        ["serve as an archetype", "作为原型", "The early engine served as an archetype for modern compact models.", "这台早期发动机成为现代紧凑型号的原型。"],
      ], [
        ["Later constitutions borrowed from this earlier archetype.", "后来的宪法借鉴了这一更早的范型。"],
        ["The prototype was practical; the archetype was the underlying model it embodied.", "prototype 是实际试制品；archetype 是它所体现的底层范型。"],
      ]],
      ["UNIVERSAL PATTERN", "文学或心理学中的原型意象", "在文学批评和荣格心理学语境中，指反复出现的深层角色、形象或叙事模式。", [
        ["the mother archetype", "母亲原型", "The novel transforms the mother archetype into a political symbol.", "小说把母亲原型转化为政治象征。"],
        ["a Jungian archetype", "荣格原型", "The shadow is often discussed as a Jungian archetype.", "“阴影”常被讨论为一种荣格原型。"],
        ["archetypal imagery", "原型意象", "The dream is rich in archetypal imagery.", "这个梦充满原型意象。"],
      ], [
        ["Readers recognize the trickster archetype across many cultures.", "读者能在许多文化中认出“捣蛋鬼”原型。"],
        ["An archetype is a recurring pattern, not a claim that every story is identical.", "原型是反复出现的模式，并不宣称所有故事都一样。"],
      ]],
    ],
    comparisons: [
      ["ideal", "/aɪˈdiː.əl/", "原表注解 · 典范义", "理想；完美标准", "ideal 是希望达到的完美标准；archetype 是把一类特征集中体现出来的典型，有时但不总是完美。", [["The plan describes an ideal that reality rarely reaches.", "该计划描述了现实很少达到的理想。"]]],
      ["earlier", "/ˈɝː.li.ɚ/", "原表注解 · 时间关系", "更早的", "earlier 只说明时间先后；archetype 还要求这个较早模型对后来形式具有范型关系。", [["An earlier machine used steam but did not shape later designs.", "更早的机器使用蒸汽，却未影响后来的设计。"]]],
      ["copies", "/ˈkɑː.piz/", "原表注解 · 派生结果", "复制品；仿制品", "copies 不是 archetype 的同义词；传统定义中，copies 是从 original archetype 复制或发展而来的。", [["The museum displayed copies while the original remained in storage.", "博物馆展出复制品，原件则留在库房。"]]],
      ["prototype", "/ˈproʊ.t̬ə.taɪp/", "补充近义词 · 工程易混", "试制原型", "prototype 通常是为测试而制作的首个实物版本；archetype 更抽象，可指一类事物背后的原始或典型模式。", [["Engineers tested a working prototype of the vehicle.", "工程师测试了车辆的可运行原型。"]]],
      ["forerunner", "/ˈfɔːrˌrʌn.ɚ/", "补充近义词 · 先驱义", "先驱；前身", "forerunner 强调在时间上预示或促成后来事物；archetype 强调作为模型或范型。", [["The telegraph was a forerunner of modern digital messaging.", "电报是现代数字通信的先驱。"]]],
      ["stereotype", "/ˈster.i.ə.taɪp/", "易混词", "刻板印象", "stereotype 是僵化、过度简化的群体观念；archetype 是反复出现的基本类型或典型模式。", [["The film challenges the stereotype of the helpless elder.", "影片挑战了“老人无助”的刻板印象。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：archetype 像“阿奇 type”——阿奇先造出第一种 type，之后所有玩具都照它复制。",
      "可靠词根：希腊语 arkhē 表示 beginning/origin，typos 表示 impression/model；合起来就是 original pattern。",
      "熟词桥：arch- 可提示 first/principal，type 是类型；prototype 是试制版本，archetype 是更底层的“第一范型”。",
      "阿奇把一只英雄模具压进云层，掉下无数复制英雄；每个故事里又出现同一位披斗篷的英雄形象。",
      "original pattern → later copies；集中体现整类特征 → typical ideal；跨故事反复出现 → universal pattern。",
      "易混刹车：archetype 不是 stereotype。前者是基本范型，后者常是对群体的僵化简化；prototype 则多是可测试实物。",
      "The archetype wore a cape, so every copy arrived dressed for unnecessary drama.",
      "原型披着斗篷，于是每件复制品都穿得像要上演一场多余的大戏。"
    ),
    recall: ["How do copies, a prototype, and an archetype differ?", "copies、prototype 与 archetype 如何区分？", "Copies reproduce something; a prototype is an early test version; an archetype is the original or typical pattern behind a class.", "copies 是复制品；prototype 是早期试制版本；archetype 是一类事物背后的原始或典型范型。"],
    context: ["The first folding chair became the ________ for a whole family of later designs.", "第一把折叠椅成了后来一整族设计的什么？", "Archetype fits because the earlier model established the pattern followed by later designs.", "archetype 表示这个更早的模型建立了后来设计遵循的范型。"],
    quiz: ["Which statement best distinguishes an archetype from a prototype?", "哪一项最准确地区分 archetype 与 prototype？", "An archetype is an underlying original or typical pattern; a prototype is usually a testable early version.", ["They always mean the same physical object.", "An archetype is a copy made from a prototype.", "A prototype is a rigid social stereotype."], "Archetype is a broad conceptual pattern; prototype is usually an early model built for testing.", "archetype 是宽泛的概念范型；prototype 通常是为测试制作的早期型号。"],
  }),

  lesson({
    number: 139,
    word: "ardor",
    ipa: "/ˈɑːr.dɚ/",
    pos: "noun (usually uncountable)",
    register: "正式 · 文学色彩；英式常拼 ardour",
    rawNote: "狂热：strong enthusiasm, devotion, zeal",
    coreEn: "intense warmth, enthusiasm, or passionate devotion",
    coreZh: "炽烈的热情、激情或献身般的投入",
    imageZh: "胸口像有一团火，推动人热烈发言、投入事业或追求目标。",
    senses: [
      ["PASSIONATE ENTHUSIASM", "炽热的热情与投入", "比普通 enthusiasm 更有“发热、燃烧”的强度，常修饰信念、追求、改革或爱情。", [
        ["with ardor", "满怀热情地", "The volunteers worked with ardor through the night.", "志愿者满怀热情地工作了一整夜。"],
        ["revolutionary ardor", "革命热情", "Revolutionary ardor filled the crowded hall.", "拥挤的大厅里充满革命热情。"],
        ["religious ardor", "宗教热忱", "Her religious ardor shaped every decision.", "她的宗教热忱影响着每个决定。"],
        ["the ardor of youth", "青春的激情", "The memoir recalls the ardor of youth without mocking it.", "回忆录追忆青春激情，并未加以嘲弄。"],
      ], [
        ["He defended the proposal with an ardor that surprised the committee.", "他以令委员会吃惊的热情为提案辩护。"],
        ["Their initial ardor cooled when the routine work began.", "日常工作开始后，他们最初的热情冷却了。"],
      ]],
    ],
    comparisons: [
      ["strong enthusiasm", "/strɔːŋ ɪnˈθuː.zi.æz.əm/", "原表注解 · 直释", "强烈热情", "strong enthusiasm 是中性直白释义；ardor 更凝练、正式，并保留“热火”意象。", [["The students showed strong enthusiasm for the experiment.", "学生们对实验表现出强烈热情。"]]],
      ["devotion", "/dɪˈvoʊ.ʃən/", "原表注解 · 持久投入", "忠诚；献身；挚爱", "devotion 强调长期忠诚和投入；ardor 强调当下炽热而有推动力的情感，可能较短暂。", [["Her devotion to patient care never weakened.", "她对患者照护的投入从未减弱。"]]],
      ["zeal", "/ziːl/", "原表注解 · 目标导向近义", "热忱；积极投入", "zeal 强调为目标勤奋积极，往往持续行动；ardor 更强调情绪的热度。", [["He pursued the reform with tireless zeal.", "他以不懈热忱推进改革。"]]],
      ["passion", "/ˈpæʃ.ən/", "补充近义词", "强烈感情；激情", "passion 范围更广，可指愤怒、爱欲或兴趣；ardor 通常是热烈的爱、信念或追求。", [["Music has been her lifelong passion.", "音乐一直是她毕生的热爱。"]]],
      ["fervor", "/ˈfɝː.vɚ/", "补充近义词", "热烈；热忱", "fervor 与 ardor 很接近，但常暗示持续、庄严的信念热度；ardor 有时更兴奋，也可能更易冷却。", [["The crowd sang with patriotic fervor.", "人群以爱国热忱歌唱。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：ardor 像“阿朵热”——阿朵一谈理想就热得胸口冒火，热情极盛。",
      "可靠词源：来自拉丁语 ardor（燃烧、烈热、激情），源于 ardere（燃烧）；“情绪像火”不是牵强拆字。",
      "熟词桥：ardent 是“热情的”，ardor 是对应名词；an ardent supporter shows ardor。",
      "演讲者胸前的火焰越说越高，最后点燃横幅，却仍以为那只是掌声发热。",
      "literal burning heat → figurative emotional heat → passionate enthusiasm or devotion。",
      "易混刹车：ardor 是“热情”；arduous 是“艰难费力”。两词拼形相近，意义与词源路线不同。",
      "With absurd ardor, the choir sang until the candles applauded.",
      "合唱团以荒诞的热情唱到蜡烛都开始鼓掌。"
    ),
    recall: ["What fire image separates ardor from ordinary interest?", "什么火焰意象把 ardor 与普通兴趣区分开？", "Ardor is intense emotional heat that drives enthusiastic or devoted action.", "ardor 是推动热烈行动或献身投入的情感高热。"],
    context: ["The campaign began with great ________, but excitement faded during months of paperwork.", "运动开始时热情炽烈，但在数月文书工作中消退。", "Ardor captures intense, heated enthusiasm that can later cool.", "ardor 表示会像火一样升高、也可能冷却的炽烈热情。"],
    quiz: ["Which word emphasizes lasting loyal commitment more than emotional heat?", "哪个词比情绪热度更强调长期忠诚投入？", "devotion", ["ardor", "fervor", "passion"], "Devotion centers on sustained commitment; ardor centers on burning intensity.", "devotion 以持久投入为中心；ardor 以燃烧般的强度为中心。"],
  }),

  lesson({
    number: 140,
    word: "arduous",
    ipa: "/ˈɑːr.dʒu.əs/",
    pos: "adjective",
    register: "正式 · 常修饰长期任务、旅程或过程",
    rawNote: "难以做到的，费劲的：difficult",
    coreEn: "requiring prolonged, strenuous effort because it is difficult",
    coreZh: "艰巨而费力的，需要长期或持续努力的",
    imageZh: "不是跨过一道小坎，而是背着重包沿陡坡走很久，直到终点仍需坚持。",
    senses: [
      ["SUSTAINED EFFORT", "艰巨、费力而漫长", "用于必须投入大量体力、脑力、耐心或时间才能完成的任务、旅程和过程。", [
        ["an arduous task", "艰巨任务", "Restoring the damaged archive was an arduous task.", "修复受损档案是一项艰巨任务。"],
        ["an arduous journey", "艰苦旅程", "The refugees survived an arduous journey across the mountains.", "难民熬过了翻山越岭的艰苦旅程。"],
        ["an arduous process", "艰难过程", "Rebuilding trust is an arduous process.", "重建信任是一个艰难过程。"],
        ["arduous work", "费力工作", "Cataloguing every fragment was arduous work.", "给每块碎片编目是费力工作。"],
      ], [
        ["Learning the script proved arduous but ultimately rewarding.", "学习这种文字很艰难，但最终很值得。"],
        ["After an arduous climb, they reached the observatory before dawn.", "经过艰苦攀登，他们在黎明前到达天文台。"],
      ]],
    ],
    comparisons: [
      ["difficult", "/ˈdɪf.ə.kəlt/", "原表注解 · 上位词", "困难的", "difficult 可指任何不好做或不好理解的事；arduous 特别强调长时间、费力和坚持。", [["The riddle is difficult but takes only a minute to solve.", "谜题很难，但只需一分钟就能解开。"]]],
      ["laborious", "/ləˈbɔːr.i.əs/", "补充近义词", "费工的；辛苦的", "laborious 强调工作过程繁重、缓慢；arduous 还可形容旅程、谈判和训练等整体挑战。", [["Copying the records by hand was laborious.", "手抄记录十分费工。"]]],
      ["strenuous", "/ˈstren.ju.əs/", "补充近义词", "高强度的；耗体力的", "strenuous 常聚焦强烈的体力或能量消耗；arduous 更常兼有漫长、艰难与需坚持。", [["The doctor advised against strenuous exercise.", "医生建议避免剧烈运动。"]]],
      ["onerous", "/ˈɑː.nɚ.əs/", "补充近义词 · 负担义", "繁重而令人不快的", "onerous 强调义务、成本或责任成为负担；arduous 强调完成过程需要艰苦努力。", [["The contract imposed onerous reporting duties.", "合同规定了繁重的报告义务。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：arduous 像“阿杜要死”——阿杜背着钢琴爬长坡，累得夸张大喊“要死了”。",
      "可靠词源：来自拉丁语 arduus，原指 high、steep，后自然引申为 difficult to accomplish。",
      "英文近音桥（也非词源）：把 arduous 听成 hard for us，只用于召回“对我们很费劲”；真实词源是拉丁语“高、陡”。",
      "阿杜背钢琴攀上没有尽头的陡坡，每到一个弯道，坡顶就礼貌地再升高十米。",
      "steep and hard to climb → 需要持久努力 → 艰巨任务、艰苦旅程、漫长过程。",
      "易混刹车：arduous 不等于任何 difficult。一个瞬间难懂的谜题可 difficult，却未必 arduous；还要有费力与持续。",
      "The arduous climb ended at a café that had moved uphill again.",
      "艰苦攀登的终点是一家又往山上搬了一次的咖啡馆。"
    ),
    recall: ["What extra burden does arduous add to difficult?", "arduous 比 difficult 多出什么负担？", "It adds prolonged, strenuous effort and the need to persevere.", "它多出长时间的艰苦付出与坚持到底的要求。"],
    context: ["Digitizing three million handwritten cards was an ________ task.", "将三百万张手写卡片数字化是一项怎样的任务？", "Arduous is apt because the work is difficult, labor-intensive, and prolonged.", "这项工作既难、又费工、又漫长，适合用 arduous。"],
    quiz: ["Which situation is difficult but not necessarily arduous?", "哪种情形可能 difficult，却未必 arduous？", "A tricky riddle solved in thirty seconds", ["A month-long climb through ice", "Years of rebuilding a ruined archive", "A labor-intensive national census"], "Arduous normally involves sustained effort, not merely a brief intellectual difficulty.", "arduous 通常需要持续付出，不只是短暂的脑力难题。"],
  }),
];

export const set28 = set(28, "The Moon-Toasting Blueprint", set28Lessons, {
  title: "The Moon-Toasting Blueprint",
  targetForms: ["apt", "archaic", "archetype", "ardor", "arduous"],
  plain: "An apt octopus used an archaic toaster as the archetype for a submarine, approached the arduous launch with scientific ardor, and accidentally toasted the moon.",
  translation: "一只聪颖的章鱼把古旧烤面包机当作潜艇原型，怀着科学热情迎接艰巨的下水任务，却意外烤焦了月亮。",
});

const set29Lessons = [
  lesson({
    number: 141,
    word: "argot",
    ipa: "/ˈɑːr.ɡoʊ/ (also /ˈɑːr.ɡət/)",
    pos: "countable or uncountable noun",
    register: "正式 · 语言学或群体文化语境",
    rawNote: "隐语，黑话，行话：specialized, particular",
    coreEn: "the specialized, often partly secret vocabulary of a particular group",
    coreZh: "某一特定群体使用的专门词汇、行话或半隐秘黑话",
    imageZh: "同一桌的人说“蓝月亮到了”，外人只看见月亮，圈内人却立刻知道该把文件藏进茶壶。",
    senses: [
      ["GROUP VOCABULARY", "特定群体的专门行话", "指职业、亚文化或共同兴趣群体内部熟悉的词汇和表达，外人可能难以理解。", [
        ["the argot of finance", "金融行话", "The article explains the argot of finance in plain English.", "文章用浅白英语解释金融行话。"],
        ["the argot of cyberspace", "网络空间行话", "New terms quickly enter the argot of cyberspace.", "新词很快进入网络空间的行话。"],
        ["professional argot", "职业行话", "Professional argot made the report opaque to patients.", "职业行话使报告令患者难懂。"],
      ], [
        ["Every craft develops an argot that compresses shared knowledge.", "每种技艺都会形成一套压缩共同知识的行话。"],
        ["The novel reproduces the argot of backstage workers.", "这部小说再现后台工作人员的行话。"],
      ]],
      ["SECRET IN-GROUP SPEECH", "隐语、黑话", "可特指封闭群体为隐藏身份、活动或意义而使用的私密词汇。", [
        ["criminal argot", "犯罪团伙黑话", "Investigators compiled a glossary of criminal argot.", "调查人员编制了一份犯罪团伙黑话表。"],
        ["a thieves' argot", "盗贼隐语", "The diary records a nineteenth-century thieves' argot.", "日记记录了一套十九世纪盗贼隐语。"],
        ["decode the argot", "解读隐语", "Only an insider could decode the argot in the message.", "只有圈内人能解读消息里的隐语。"],
      ], [
        ["Their argot protected secrets but also marked group identity.", "他们的隐语既保护秘密，也标示群体身份。"],
        ["To outsiders the phrase sounded ordinary; within the argot it was a warning.", "外人听来这句话很普通，在这套黑话中却是一则警告。"],
      ]],
    ],
    comparisons: [
      ["specialized", "/ˈspeʃ.ə.laɪzd/", "原表注解 · 性质", "专门化的", "specialized 描述用途或知识领域；argot 是该 specialized group 实际使用的一套词汇。", [["The manual uses specialized medical terms.", "手册使用专业医学术语。"]]],
      ["particular", "/pɚˈtɪk.jə.lɚ/", "原表注解 · 归属关系", "特定的", "particular 说明范围限定；argot 必须属于 a particular group，而 particular 本身不是其同义词。", [["This custom belongs to a particular community.", "这一习俗属于某个特定社群。"]]],
      ["jargon", "/ˈdʒɑːr.ɡən/", "补充近义词", "专业术语；难懂行话", "jargon 最常用，可指行业术语并常暗示难懂；argot 更突出特定群体身份，有时带隐秘性。", [["The lawyer translated the legal jargon for us.", "律师为我们解释了法律术语。"]]],
      ["slang", "/slæŋ/", "补充近义词", "俚语", "slang 是非正式、常短暂流行的表达；argot 是一个群体较完整的内部词汇体系，可正式描述。", [["Teenage slang changes rapidly.", "青少年俚语变化很快。"]]],
      ["cant", "/kænt/", "补充近义词 · 隐语义", "隐语；黑话；虚伪套话", "cant 在历史上可指盗贼隐语，也常指虚伪套话；argot 没有必然的虚伪评价。", [["The pamphlet records fragments of thieves' cant.", "小册子记录了盗贼隐语片段。"]]],
      ["lingo", "/ˈlɪŋ.ɡoʊ/", "补充近义词 · 口语", "某群体的说法；行话", "lingo 更口语、轻松；argot 更正式，常用于分析群体语言与身份。", [["I am still learning the lingo of the film crew.", "我还在学习摄制组的行话。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：argot 读起来像“阿狗”——守门的阿狗只听圈内口令，外人一句也听不懂。",
      "可靠边界：英语 argot 于十九世纪从法语 argot 借入；法语词更深层的来源众说不一，不应把任何流行拆解冒充定论。",
      "英文熟词桥：记成 a group's code-like vocabulary；group identity + special words = argot。",
      "地下茶馆里，阿狗听见“蓝月亮喝茶”就打开暗门；游客却认真抬头寻找一颗蓝色卫星。",
      "particular group → specialized vocabulary；若还用于排除外人或隐藏意义，就更接近隐语、黑话。",
      "易混刹车：jargon 常指专业难词，slang 强调非正式，argot 强调群体专属且可能隐秘；标准读音通常不读词尾 t。",
      "In the pigeons' argot, “crumb” meant both treasure and urgent diplomacy.",
      "在鸽子的黑话里，crumb 同时表示宝藏和紧急外交。"
    ),
    recall: ["What two features turn vocabulary into argot?", "哪两个特征会让一套词汇成为 argot？", "It belongs to a particular group and is specialized, sometimes deliberately secret.", "它属于特定群体，并且专门化，有时还故意保密。"],
    context: ["New employees needed a glossary to understand the laboratory's private ________.", "新员工需要词汇表才能理解实验室内部那套专门说法。", "Argot fits a specialized vocabulary shared by a particular in-group.", "argot 正是特定圈内群体共享的专门词汇。"],
    quiz: ["Which term most strongly suggests a group's identity-marking, possibly secret vocabulary?", "哪个词最突出某群体标示身份、甚至可能保密的内部词汇？", "argot", ["particular", "grammar", "accent"], "Argot is the distinctive vocabulary and idiom of a particular group.", "argot 是某一特定群体独有的词汇和习语系统。"],
  }),

  lesson({
    number: 142,
    word: "arrest",
    ipa: "/əˈrest/",
    pos: "transitive verb · countable or uncountable noun",
    register: "常用法律义；“制止发展、吸引注意”义较正式",
    rawNote: "使不活跃：inactive; 停止：stopping, standstill; 逮捕：keep; 吸引（某人）注意力：hold, attention",
    coreEn: "to take into legal custody, stop a process, or catch and hold attention",
    coreZh: "依法逮捕；使过程停止或停滞；攫住并保持注意力",
    imageZh: "警察举起一只巨大的 STOP 手掌：嫌疑人停下、疾病扩散停下，连路人的目光也停在一幅画上。",
    senses: [
      ["LEGAL CUSTODY", "依法逮捕、拘捕", "警方或有权机关依法限制某人的自由，以便调查或起诉；名词可指逮捕行为或被捕状态。", [
        ["arrest a suspect", "逮捕嫌疑人", "Police arrested a suspect near the station.", "警方在车站附近逮捕了一名嫌疑人。"],
        ["be under arrest", "处于被捕状态", "You are under arrest and have the right to remain silent.", "你已被捕，并有权保持沉默。"],
        ["arrest someone for", "因……逮捕某人", "Officers arrested him for attempting to enter the sealed building.", "警员因他试图进入封锁建筑而将其逮捕。"],
      ], [
        ["The court ruled that the arrest had been lawful.", "法院裁定此次逮捕合法。"],
        ["She was questioned but never placed under arrest.", "她接受了询问，但从未被正式逮捕。"],
      ]],
      ["STOP DEVELOPMENT", "制止发展或使活动停滞", "正式及物用法，常把疾病扩散、衰退、腐蚀、生长或社会进程阻止在当前阶段。", [
        ["arrest the spread", "遏止扩散", "The treatment may arrest the spread of the infection.", "这种治疗可能遏止感染扩散。"],
        ["arrest the decline", "阻止衰退", "Emergency repairs arrested the building's decline.", "紧急修缮阻止了建筑继续衰败。"],
        ["arrest development", "使发展停滞", "Severe malnutrition can arrest development.", "严重营养不良会使发育停滞。"],
      ], [
        ["The new barrier arrested further erosion of the shore.", "新屏障阻止了海岸进一步侵蚀。"],
        ["The policy slowed the crisis but did not fully arrest it.", "该政策减缓了危机，却未将其完全遏止。"],
      ]],
      ["CESSATION", "停止、骤停的状态", "名词在医学与技术语境中表示功能、运动或进程停止，接近 stopping 或 standstill。", [
        ["cardiac arrest", "心脏骤停", "The team began CPR immediately after cardiac arrest.", "患者心脏骤停后，团队立即开始心肺复苏。"],
        ["respiratory arrest", "呼吸停止", "Respiratory arrest requires immediate intervention.", "呼吸停止需要立即干预。"],
        ["developmental arrest", "发育停滞", "The scan suggested developmental arrest at an early stage.", "扫描显示发育可能在早期阶段停滞。"],
      ], [
        ["An arrest of motion leaves the mechanism at a standstill.", "运动的停止会让机械装置静止不动。"],
        ["Cardiac arrest is not the same as an ordinary heart attack.", "心脏骤停并不等同于普通心脏病发作。"],
      ]],
      ["HOLD ATTENTION", "抓住并保持注意力", "正式比喻用法：某个图像、声音或细节让人的注意暂时“停住”。", [
        ["arrest someone's attention", "吸引某人注意", "A red mark in the margin arrested my attention.", "页边的红色标记吸引了我的注意。"],
        ["arrest the eye", "抓住目光", "The silver doorway arrests the eye at once.", "银色门廊立刻抓住目光。"],
        ["arrest the reader's attention", "攫住读者注意", "The opening question arrests the reader's attention.", "开篇问题攫住了读者的注意力。"],
      ], [
        ["One unexpected detail arrested her attention.", "一个意外细节吸引了她的注意。"],
        ["The contrast arrests the eye without overwhelming the page.", "这种对比抓住目光，却没有压过整个页面。"],
      ]],
    ],
    comparisons: [
      ["inactive", "/ɪnˈæk.tɪv/", "原表注解 · 结果状态", "不活跃的；未运作的", "inactive 描述停止活动后的状态；arrest 是使某个过程停止或停滞的动作。", [["The account remained inactive for a year.", "该账户一年没有活动。"]]],
      ["stopping", "/ˈstɑː.pɪŋ/", "原表注解 · 动作概括", "停止；制止", "stopping 是宽泛概括；arrest 在非法律义中较正式，常指遏止发展、扩散或功能。", [["Stopping the leak required a new valve.", "止住泄漏需要一个新阀门。"]]],
      ["standstill", "/ˈstænd.stɪl/", "原表注解 · 结果名词", "完全停顿；停滞", "standstill 是完全不再推进的状态；arrest 可指导致这一状态的动作，也可用于医学骤停。", [["The strike brought production to a standstill.", "罢工使生产完全停顿。"]]],
      ["keep / detain", "/kiːp/ · /dɪˈteɪn/", "原表注解 · 法律关系", "扣留；使留在拘押中", "keep 过于宽泛；detain 可短暂扣留而未正式逮捕，arrest 则以法律权力正式剥夺自由。", [["Officials detained the traveler for questioning but did not arrest her.", "官员扣留旅客问话，但没有正式逮捕她。"]]],
      ["hold", "/hoʊld/", "原表注解 · 注意力关系", "保持；抓住", "arrest attention 不只是瞬间吸引，还隐含把目光 hold 在那里；hold 本身不表达突然攫住。", [["The final scene held the audience's attention.", "最后一幕一直抓住观众的注意。"]]],
      ["attention", "/əˈten.ʃən/", "原表注解 · 固定宾语", "注意力", "attention 是被 arrest 的对象，不是同义词；固定搭配是 arrest someone's attention。", [["The warning attracted immediate attention.", "这则警告立即引起注意。"]]],
      ["halt", "/hɔːlt/", "补充近义词", "使停止；停止", "halt 更通用，可及物也可不及物；arrest 非法律义更正式，常用于 growth、spread、decline。", [["The convoy halted at the border.", "车队在边境停下。"]]],
      ["apprehend", "/ˌæp.rɪˈhend/", "补充近义词 · 法律", "逮捕；抓获", "apprehend 正式强调抓到嫌疑人；arrest 还强调依法置于拘押状态，且拥有多个非法律义。", [["Agents apprehended the fugitive after a long search.", "探员长期搜寻后抓获了逃犯。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：arrest 像“啊，rest！”——警察一喊，嫌疑人、病毒和所有人的目光同时停下。",
      "可靠词源：经古法语 arester，来自通俗拉丁语 *arrestare；可追到 ad-（向）+ restare（停住、留在后面），其中 stare 表“站”。",
      "英文熟词桥：把 arrest 的共同核心记成 cause to stop：人被法律叫停，过程被遏止，注意力被画面叫停。",
      "一只巨型警察手掌分成四格：扣住嫌疑人、封住病毒、让心电线归零、把观众目光钉在红伞上。",
      "legal stop → 逮捕；process stop → 遏止发展；bodily-function stop → 骤停；mental stop → 抓住注意。",
      "易混刹车：detain 可只是临时扣留；arrest attention 是正式搭配。cardiac arrest 也不等于一般 heart attack。",
      "The painting arrested my attention while the guard arrested the thief behind it.",
      "画作抓住我的注意时，警卫逮捕了躲在它后面的小偷。"
    ),
    recall: ["What single image unites legal arrest, arrested growth, and arrested attention?", "什么共同图像串起依法逮捕、发展停滞和注意被吸引？", "A force makes a person, process, or wandering attention stop and remain in place.", "某种力量让人、过程或游移的注意停下并留在原处。"],
    context: ["The drug may ________ tumor growth, but it cannot guarantee a cure.", "药物可能遏止肿瘤生长，却不能保证治愈。", "Arrest formally means to stop or interrupt development, without necessarily reversing prior damage.", "arrest 可正式表示制止发展，但不一定逆转既有损害。"],
    quiz: ["Which sentence describes temporary detention without necessarily making a formal arrest?", "哪一句描述临时扣留，却不一定构成正式逮捕？", "Border officers detained him briefly for questioning.", ["Police placed the suspect under arrest.", "The treatment arrested the spread.", "The photograph arrested her attention."], "Detain can be a temporary hold; arrest is a formal legal act.", "detain 可以只是临时扣留；arrest 是正式法律行为。"],
  }),

  lesson({
    number: 143,
    word: "arresting",
    ipa: "/əˈres.tɪŋ/",
    pos: "adjective",
    register: "正式 · 艺术、外观与写作评论",
    rawNote: "吸引人的：attracting, striking",
    coreEn: "so striking or attractive that it immediately captures attention",
    coreZh: "醒目而引人注意的；美得或奇得让目光停住的",
    imageZh: "人群匆匆走过灰墙，只有一扇鲜红的门像伸手一样把每道目光拦了下来。",
    senses: [
      ["ATTENTION-STOPPING", "醒目、引人注目", "形容外表、图像、声音、对比或写法强烈到让人停下注意；不必一定漂亮。", [
        ["an arresting image", "引人注目的图像", "The cover uses an arresting image of a blue horse.", "封面使用了一幅醒目的蓝马图像。"],
        ["an arresting appearance", "引人注目的外表", "Her silver coat gave her an arresting appearance.", "银色外套让她的外表非常醒目。"],
        ["an arresting contrast", "醒目的对比", "The arresting contrast directs the eye toward the doorway.", "醒目的对比把目光引向门口。"],
        ["an arresting opening", "抓人的开场", "The essay begins with an arresting question.", "文章以一个抓人的问题开篇。"],
      ], [
        ["The dancer's stillness was more arresting than the music.", "舞者的静止比音乐更抓人。"],
        ["It is an arresting design, although not everyone finds it beautiful.", "这是个醒目的设计，尽管并非人人觉得它美。"],
      ]],
    ],
    comparisons: [
      ["attracting", "/əˈtræk.tɪŋ/", "原表注解 · 作用", "正在吸引的", "attracting 描述吸引这一作用；arresting 是固定形容词，强调效果强到立即抓住注意。", [["The campaign is attracting younger readers.", "这项活动正在吸引年轻读者。"]]],
      ["striking", "/ˈstraɪ.kɪŋ/", "原表注解 · 核心近义词", "醒目的；显著的", "striking 与 arresting 很接近，范围更广；arresting 的形象核心是让目光或思绪突然停住。", [["There is a striking contrast between the two proposals.", "两项提案之间有显著对比。"]]],
      ["eye-catching", "/ˈaɪˌkætʃ.ɪŋ/", "补充近义词 · 常用", "抢眼的", "eye-catching 较口语，常用于广告和视觉设计；arresting 更书面，也可形容声音、观点和开场。", [["The poster uses an eye-catching yellow border.", "海报用了抢眼的黄色边框。"]]],
      ["stunning", "/ˈstʌn.ɪŋ/", "补充近义词", "惊艳的；令人震撼的", "stunning 常带强烈赞美或震撼；arresting 只保证引人注意，可能因怪异、严峻或不安。", [["The valley offers stunning views at sunrise.", "山谷在日出时景色惊艳。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：arresting 像“啊，resting？”——红门太醒目，路人惊呼后停步休息，目光被拦住。",
      "可靠构词与语义史：arresting 是 arrest 的 -ing 形式；arrest 先有“使停止”，后来发展出“抓住注意”，形容词遂表示 striking。",
      "熟词桥：an arresting image arrests your attention。用同一句把形容词和动词固定搭配锁在一起。",
      "灰色城市里只有一扇红门会唱歌，所有行人同时停步，连交通灯都转头看它。",
      "cause attention to stop → immediately noticeable → striking and sometimes unusually attractive。",
      "易混刹车：arresting 是“引人注目的”；arrested 是“被捕的”或“停滞的”。an arresting officer 还可能只是“执行逮捕的警员”。",
      "The arresting hat stopped traffic, clocks, and one extremely polite cloud.",
      "那顶醒目的帽子让交通、时钟和一朵极有礼貌的云都停了下来。"
    ),
    recall: ["Must something arresting be beautiful?", "arresting 的东西一定漂亮吗？", "No. It must strongly capture attention; beauty is possible but not required.", "不一定。它必须强烈抓住注意力，但可能漂亮，也可能怪异或令人不安。"],
    context: ["The photographer chose one ________ image that made visitors stop at the entrance.", "摄影师选了一幅让访客在入口停步的醒目图像。", "Arresting describes an image powerful enough to capture attention immediately.", "arresting 形容图像强烈到立刻攫住注意。"],
    quiz: ["Which adjective can describe an image's attention-grabbing force without saying it is conventionally beautiful?", "哪个形容词能描述图像十分抓眼，却不保证它符合传统美感？", "arresting", ["arrested", "current", "inactive"], "Arresting means striking and attention-catching; it does not necessarily mean pretty.", "arresting 表示醒目抓人，并不必然等于漂亮。"],
  }),

  lesson({
    number: 144,
    word: "arrhythmic",
    ipa: "UK /əˈrɪð.mɪk/ · US /eɪˈrɪð.mɪk/",
    pos: "adjective",
    register: "医学专业；也可正式描述音乐、运动或周期",
    rawNote: "不规律的：lacking, regularity",
    coreEn: "lacking a regular rhythm or normal rhythmic pattern",
    coreZh: "缺乏规则节律的；心律失常相关的；节奏不规律的",
    imageZh: "节拍器本该“嗒—嗒—嗒”，却突然变成“嗒嗒——停——砰”，心电图和鼓手一起迷路。",
    senses: [
      ["MEDICAL RHYTHM", "心律不规则或与心律失常有关", "医学中形容心脏节律事件、死亡风险或状态；可涉及节律不规则或速率异常。", [
        ["an arrhythmic heartbeat", "心律不齐的心跳", "The monitor detected an arrhythmic heartbeat.", "监护仪检测到心律不齐的心跳。"],
        ["an arrhythmic event", "心律失常事件", "No further arrhythmic events occurred during follow-up.", "随访期间未再发生心律失常事件。"],
        ["arrhythmic risk", "心律失常风险", "The study assessed arrhythmic risk after surgery.", "研究评估了术后心律失常风险。"],
      ], [
        ["The cardiologist reviewed each arrhythmic episode.", "心脏科医生复核了每次心律失常发作。"],
        ["An arrhythmic pattern on a monitor requires clinical interpretation.", "监护仪上的心律异常模式需要临床解读。"],
      ]],
      ["IRREGULAR PATTERN", "一般节奏或周期不规律", "非医学用法可形容音乐、动作、叙事或商业周期不遵循稳定重复节拍。", [
        ["arrhythmic music", "无规则节拍的音乐", "The film uses arrhythmic music to create unease.", "影片用无规则节拍的音乐制造不安。"],
        ["arrhythmic movement", "节律不规则的动作", "The machine produced an arrhythmic movement and then stopped.", "机器做出不规则运动后停了下来。"],
        ["arrhythmic cycles", "不规则周期", "Demand now rises in increasingly arrhythmic cycles.", "需求如今以愈发不规则的周期起伏。"],
      ], [
        ["The drummer deliberately made the final passage arrhythmic.", "鼓手故意让最后一段失去规律节拍。"],
        ["Arrhythmic flashes made the signal hard to predict.", "无规律闪烁使信号难以预测。"],
      ]],
    ],
    comparisons: [
      ["lacking", "/ˈlæk.ɪŋ/", "原表注解 · 结构关系", "缺少……的", "lacking 是分词形容词，需说明缺什么；arrhythmic 具体等于 lacking a regular rhythm。", [["The report is lacking in detail.", "报告缺少细节。"]]],
      ["regularity", "/ˌreɡ.jəˈler.ə.t̬i/", "原表注解 · 被缺少的性质", "规律性；规则性", "regularity 是 arrhythmic 所缺乏的性质，不是同义词；原表应整体读作 lacking regularity。", [["The regularity of the pulse reassured the patient.", "脉搏的规律性让患者放心。"]]],
      ["irregular", "/ɪˈreɡ.jə.lɚ/", "补充近义词 · 上位词", "不规则的", "irregular 可描述任何不规则现象；arrhythmic 专指 rhythm 或周期模式缺乏规律。", [["The tiles form an irregular shape.", "这些瓷砖构成不规则形状。"]]],
      ["rhythmic", "/ˈrɪð.mɪk/", "反向概念", "有节律的；有规律节拍的", "rhythmic 遵循重复节拍；arrhythmic 的否定前缀 a- 表示没有这种节律。", [["The dancers moved in a slow rhythmic pattern.", "舞者以缓慢而有节律的模式移动。"]]],
      ["arithmetic", "/əˈrɪθ.mə.tɪk/", "易混形近词", "算术", "arithmetic 属于数学，含清音 /θ/；arrhythmic 描述节律异常，含浊音 /ð/，拼写还有双 r。", [["The child practiced arithmetic with colored blocks.", "孩子用彩色积木练习算术。"]]],
      ["antiarrhythmic", "/ˌæn.ti.əˈrɪð.mɪk/", "医学易混词", "抗心律失常的；抗心律失常药", "antiarrhythmic 是预防或治疗 arrhythmia 的药物或措施，不是“更没有节奏”。", [["The physician adjusted the antiarrhythmic medication.", "医生调整了抗心律失常药物。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：arrhythmic 像“啊，rhythm 没了！”——鼓点乱跳，指挥只剩一声惊叫。",
      "可靠构词：否定前缀 a-（without）+ rhythmic；rhythm 最终来自希腊语 rhythmos（有度量的流动、节律）。",
      "英文熟词桥：rhythmic = with rhythm；arrhythmic = without a regular rhythm。把双 r 看作 a + rhythmic 的拼接痕迹。",
      "心电图、鼓手和交通灯原本同步，忽然各自乱拍：两下快跳、长停顿、再来一记巨响。",
      "lack regularity in rhythm → 医学心律异常；扩展到音乐、动作和周期 → 节奏无规律。",
      "易混刹车：arrhythmic 不是 arithmetic（算术）；antiarrhythmic 指抗心律失常治疗。医学判断不能只凭词义自行诊断。",
      "The arrhythmic clock struck thirteen, paused for lunch, and then struck two.",
      "那只节律紊乱的钟敲了十三下，午休片刻，又敲了两下。"
    ),
    recall: ["What does the initial a- do in arrhythmic?", "arrhythmic 开头的 a- 起什么作用？", "It is a negative prefix: arrhythmic lacks a regular rhythm.", "它是否定前缀：arrhythmic 表示缺少规则节律。"],
    context: ["The soundtrack avoids a steady beat and remains deliberately ________.", "配乐故意避免稳定节拍，始终保持无规律。", "Arrhythmic fits because the pattern lacks rhythmic regularity; the use is nonmedical but valid.", "arrhythmic 表示节律缺乏规律；这里不是医学语境，但用法成立。"],
    quiz: ["Which sentence uses arrhythmic outside medicine?", "哪一句在非医学语境中使用 arrhythmic？", "The percussion became deliberately arrhythmic.", ["The doctor prescribed an antiarrhythmic drug.", "The child solved an arithmetic problem.", "The dancers kept a rhythmic pulse."], "Music can be arrhythmic when it lacks a regular beat.", "音乐缺乏规则节拍时也可称 arrhythmic。"],
  }),

  lesson({
    number: 145,
    word: "arrogance",
    ipa: "US /ˈer.ə.ɡəns/ · UK /ˈær.ə.ɡəns/",
    pos: "uncountable noun",
    register: "明确贬义 · 人际、领导与公共评论",
    rawNote: "傲慢，自大：overbearing pride",
    coreEn: "an overbearing belief in one's superiority, often shown through contempt for others",
    coreZh: "傲慢自大：认定自己优越，并以盛气凌人或轻蔑的方式对待他人",
    imageZh: "孔雀站在镜山顶端，宣布太阳只是给自己打光的灯，山下所有意见都不值得听。",
    senses: [
      ["OVERBEARING SUPERIORITY", "傲慢、自大", "不仅是觉得自己有能力，而是夸大自身重要性或权利，并压过、轻视或不听他人。", [
        ["sheer arrogance", "十足的傲慢", "It was sheer arrogance to ignore every safety warning.", "无视所有安全警告是十足的傲慢。"],
        ["intellectual arrogance", "智识傲慢", "Intellectual arrogance kept him from testing his assumptions.", "智识傲慢使他不肯检验自己的假设。"],
        ["the arrogance to assume", "竟傲慢地认定", "She had the arrogance to assume that no one else understood.", "她竟傲慢地认定其他人都不懂。"],
        ["arrogance toward others", "对他人的傲慢", "His arrogance toward junior staff damaged the team.", "他对初级员工的傲慢损害了团队。"],
      ], [
        ["Her confidence inspired the group; her later arrogance silenced it.", "她的自信曾鼓舞团队，后来的傲慢却让团队噤声。"],
        ["The decision revealed arrogance rather than informed courage.", "这个决定显露的是傲慢，而非有根据的勇气。"],
      ]],
    ],
    comparisons: [
      ["overbearing", "/ˌoʊ.vɚˈber.ɪŋ/", "原表注解 · 行为特征", "专横跋扈的；盛气凌人的", "overbearing 描述把意志强加于人的作风；arrogance 是背后认定自己更优越的态度。", [["The overbearing manager interrupted every speaker.", "专横的经理打断了每位发言者。"]]],
      ["pride", "/praɪd/", "原表注解 · 上位情感", "自豪；自尊；骄傲", "pride 可以健康正面；overbearing pride 才接近 arrogance，因为它夸大自我并贬低他人。", [["She took pride in the team's careful work.", "她为团队细致的工作感到自豪。"]]],
      ["confidence", "/ˈkɑːn.fə.dəns/", "核心易混词", "自信", "confidence 相信自己能做到，不要求别人低人一等；arrogance 把自信膨胀为优越和轻蔑。", [["He answered with confidence while still inviting criticism.", "他自信作答，同时仍欢迎批评。"]]],
      ["conceit", "/kənˈsiːt/", "补充近义词", "自负；自命不凡", "conceit 常聚焦过高的自我评价；arrogance 更常显露为对他人的轻蔑和专横。", [["Success fed his conceit about his own talent.", "成功助长了他对自身才华的自负。"]]],
      ["haughtiness", "/ˈhɔː.t̬i.nəs/", "补充近义词", "高傲；傲慢", "haughtiness 强调冷淡、居高临下的外在姿态；arrogance 还可体现在鲁莽假设和不听证据。", [["Her haughtiness made ordinary conversation impossible.", "她的高傲让普通交谈都无法进行。"]]],
      ["hubris", "/ˈhjuː.brɪs/", "补充近义词 · 文学", "狂妄自大；招致失败的傲慢", "hubris 常指权势者过度自信并最终招致毁灭；arrogance 是更广泛的日常品格缺陷。", [["The tragedy portrays a ruler destroyed by hubris.", "这出悲剧描写一位因狂妄而毁灭的统治者。"]]],
    ],
    memory: memory(
      "谐音联想（绝非词源）：arrogance 像“阿罗敢说”——阿罗敢说太阳只是在给他这只孔雀打光。",
      "可靠词源：来自拉丁语 arrogantia，源于 arrogare（为自己声索、擅自取得），可分析为 ad- + rogare（询问、请求）。",
      "英文熟词桥：arrogate 是“无权却擅自攫取”；arrogance 是那种仿佛一切地位和正确答案都该归自己的态度。",
      "孔雀爬上镜山，命令太阳调整角度，并把所有反对意见投入一个标着“低等声音”的垃圾桶。",
      "claim too much for oneself → assume superiority → dismiss or dominate others，形成 overbearing pride。",
      "易混刹车：confidence 可以谦逊并欢迎证据；arrogance 必含夸大的优越感，常伴轻蔑。rogare 也不是 rogue，勿假词源。",
      "His arrogance convinced him that gravity should ask permission before acting.",
      "他的傲慢让他相信，重力行动前也该先征得他的许可。"
    ),
    recall: ["What moral boundary separates confidence from arrogance?", "confidence 与 arrogance 的品格边界是什么？", "Confidence trusts one's ability; arrogance adds exaggerated superiority and disregard for others.", "confidence 相信自身能力；arrogance 又加上夸大的优越感和对他人的轻视。"],
    context: ["Calling every critic ignorant revealed not confidence but ________.", "把每位批评者都称作无知，显露的不是自信而是什么？", "Arrogance fits because the speaker assumes superiority and dismisses everyone else.", "说话者认定自己更优越并贬低所有人，因此用 arrogance。"],
    quiz: ["Which behavior shows confidence without arrogance?", "哪种行为体现自信，却不傲慢？", "Presenting a firm view while inviting evidence and correction", ["Assuming junior staff have nothing to teach you", "Ignoring warnings because rules are for lesser people", "Calling disagreement proof of stupidity"], "Confidence can remain open to others; arrogance treats superiority as already proven.", "自信仍可向他人开放；傲慢则把自己的优越当成无需证明的事实。"],
  }),
];

export const set29 = set(29, "The Peacock's Irregular Decree", set29Lessons, {
  title: "The Peacock's Irregular Decree",
  targetForms: ["argot", "arrest", "arresting", "arrhythmic", "arrogance"],
  plain: "In royal argot, an arrhythmic peacock commanded guards to arrest a drum, whose arresting purple uniform displayed such arrogance that the moon resigned.",
  translation: "一只节律紊乱的孔雀用王室黑话命令卫兵逮捕一面鼓；那面鼓醒目的紫色制服显得如此傲慢，竟让月亮辞职了。",
});
