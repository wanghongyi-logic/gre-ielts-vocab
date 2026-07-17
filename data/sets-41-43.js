import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(201, "barb", "/bɑːb/", "noun", "尖锐而严厉的批评：critical", "a deliberately sharp, hurtful criticism; also a backward-pointing hook", "尖刻的批评；倒钩",
    "一句批评长出鱼钩，飞出去钩住演讲者的自尊。",
    [["a barbed comment", "一句尖刻评论", "She ignored the barbed comment and continued her presentation.", "她没有理会那句尖刻评论，继续陈述。"], ["trade barbs", "互相尖刻攻击", "The candidates traded barbs during the debate.", "候选人在辩论中互相尖刻攻击。"], ["a barb aimed at someone", "针对某人的讥刺", "The joke was really a barb aimed at the chairman.", "那个笑话其实是针对主席的讥刺。"]],
    [["critical", "批评的；关键的", "原表注解 · 评价", "critical 很宽泛；barb 是一句短促、故意刺人的批评。", "The review was critical of the weak evidence.", "评论批评了薄弱的证据。"], ["jab", "短促的挖苦", "近义词", "jab 与 barb 都可比喻言语攻击；barb 更突出像倒钩一样伤人。", "He made a playful jab at my old hat.", "他拿我的旧帽子开了个小玩笑。"]],
    M("声音联想（非词源）：barb 像‘疤’；尖话像倒钩，留下心里的疤。", "可靠词源：经 Old French barbe 来自 Latin barba（胡须）；倒钩像硬须，后引申为刺人的话。", "熟词桥：barbed wire 是带倒刺铁丝；barbed remark 就是带刺的话。", "记者抛出一句长着鱼钩的批评，把市长的领带钩上了吊灯。", "实体倒钩会刺伤，言语倒钩则伤害自尊。", "易混刹车：barb 是那句尖话；barbed 是‘带刺的’。critical 不一定尖酸。", "One tiny barb hooked the mayor's enormous pride.", "一句小小的尖刻话钩住了市长巨大的自尊。"),
    ["What makes a barb more specific than criticism?", "barb 比一般 criticism 更具体在哪里？", "It is brief, pointed, and intended to sting.", "它短促尖锐，而且有意刺痛对方。"],
    ["Her compliment concealed a sharp ________ about his laziness.", "她的恭维里藏着一句针对他懒惰的尖刻讥刺。", "A concealed verbal sting is a barb.", "藏在话里的刺痛性攻击是 barb。"], ["praise", "comfort", "apology"]),

  vocab(202, "barbarous", "/ˈbɑː.bər.əs/", "adjective", "野蛮的，凶残的：mercilessly; 未开化的：uncivilized", "savagely cruel or merciless; uncivilized in a strongly judgmental sense", "野蛮凶残的；残酷无情的；未开化的",
    "一位披兽皮的国王毫无怜悯地砸碎图书馆，并宣布礼貌违法。",
    [["barbarous cruelty", "野蛮的残酷行为", "The prisoners were subjected to barbarous cruelty.", "囚犯遭受了野蛮残酷的对待。"], ["a barbarous custom", "未开化的野蛮习俗", "The reformer condemned the practice as a barbarous custom.", "改革者谴责这种做法是野蛮习俗。"], ["a barbarous attack", "凶残的袭击", "The village survived a barbarous attack.", "村庄挺过了一次凶残袭击。"]],
    [["mercilessly", "毫无怜悯地", "原表注解 · 方式", "mercilessly 是副词，说明行为毫无怜悯；barbarous 是形容词，兼有残暴和野蛮感。", "The army punished the civilians mercilessly.", "军队毫无怜悯地惩罚平民。"], ["uncivilized", "未开化的；不文明的", "原表注解 · 社会判断", "uncivilized 强调缺乏文明规范；barbarous 往往还强烈谴责残酷。", "They dismissed the region as uncivilized.", "他们把该地区贬为未开化之地。"], ["brutal", "残忍的；严酷的", "近义词", "brutal 是常用强词；barbarous 更书面，并可能带‘文明之外’的历史评价。", "The report documented brutal treatment.", "报告记录了残忍待遇。"]],
    M("声音联想（非词源）：barbarous 像连续喊‘吧吧’，野蛮人不停砸门。", "可靠词源：来自 Greek barbaros（外国的、说陌生语言的），经 Latin；后来产生‘野蛮残酷’义。", "熟词桥：barbarian 是‘野蛮人’，barbarous 描述其被想象的残暴行为。", "野蛮国王骑着餐桌冲进图书馆，把字典当鼓敲。", "从古代‘异族/非本族语言’的标签，落到现代对残酷、不文明行为的强烈谴责。", "易混刹车：barbaric 与 barbarous 多有重叠；描述现实族群为 uncivilized 可能带偏见，应谨慎。", "The barbarous king outlawed kindness and taxed every smile.", "野蛮国王禁止善意，还对每个微笑征税。"),
    ["What two ideas can barbarous combine?", "barbarous 可结合哪两层意思？", "Merciless cruelty and a judgment of being uncivilized.", "毫无怜悯的残酷，以及‘不文明’的判断。"],
    ["The tribunal denounced the ________ treatment of captives.", "法庭谴责对俘虏的野蛮残酷待遇。", "Barbarous strongly condemns merciless cruelty.", "barbarous 强烈谴责毫无怜悯的残酷。"], ["humane", "civilized", "gentle"]),

  vocab(203, "barefaced", "/ˌbeəˈfeɪst/", "adjective", "公然的，厚颜无耻的：brazen", "openly and shamelessly bold, especially in wrongdoing or lying", "公然无耻的；厚颜无耻的",
    "小偷摘下面具，举着‘我没偷’的牌子，口袋里却有钟表在响。",
    [["a barefaced lie", "厚颜无耻的谎言", "His claim was a barefaced lie contradicted by the video.", "他的说法是被录像直接推翻的无耻谎言。"], ["barefaced hypocrisy", "公然的虚伪", "The speech displayed barefaced hypocrisy.", "这篇演讲表现出公然的虚伪。"], ["a barefaced attempt", "明目张胆的企图", "It was a barefaced attempt to silence criticism.", "这是一次明目张胆压制批评的企图。"]],
    [["brazen", "厚颜无耻的；明目张胆的", "原表注解 · 强近义", "brazen 强调大胆无耻；barefaced 尤其像‘不戴面具’，强调毫不掩饰。", "It was a brazen abuse of power.", "这是明目张胆的滥权。"], ["shameless", "无耻的", "近义词", "shameless 泛指没有羞耻感；barefaced 常修饰 lie、hypocrisy、attempt 等公开不端行为。", "The advertisement made a shameless appeal to fear.", "广告无耻地利用恐惧。"]],
    M("声音联想（非词源）：bare + faced 就是‘裸着脸’，做坏事连面具都不戴。", "可靠构词：bare（无遮盖的）+ faced（有……面孔的）；历史上可指不遮脸，后引申为公然无耻。", "熟词桥：bare hands 是赤手；barefaced lie 是完全不遮掩的谎言。", "小偷摘掉面具，对着十二台摄像机撒谎，还请求拍特写。", "脸无遮掩 → 行为毫不遮掩 → 厚颜无耻。", "易混刹车：barefaced 多是负面；open 或 frank 则可褒义。", "The barefaced thief denied everything while wearing the stolen crown.", "厚颜无耻的小偷戴着偷来的王冠否认一切。"),
    ["Why does barefaced suggest shameless openness?", "为什么 barefaced 表示公然无耻？", "The image is of wrongdoing done with no mask or concealment.", "它描绘做坏事不戴面具、毫不遮掩。"],
    ["The forged receipt supported his ________ lie.", "伪造的收据支撑着他厚颜无耻的谎言。", "A shamelessly open lie is barefaced.", "公然无耻的谎言是 barefaced lie。"], ["candid", "modest", "honorable"]),

  vocab(204, "bargain", "/ˈbɑː.ɡɪn/", "noun · verb", "协议：agreement; 讨价还价：negotiate", "an agreement, especially after negotiation; to negotiate terms or price", "协议；便宜货；讨价还价",
    "两只狐狸在菜市场握爪签协议，又为最后一根胡萝卜讨价还价。",
    [["strike a bargain", "达成协议", "The two sides struck a bargain before midnight.", "双方在午夜前达成了协议。"], ["bargain over the price", "就价格讨价还价", "They bargained over the price of the antique desk.", "他们就古董书桌的价格讨价还价。"], ["keep your side of the bargain", "履行你在协议中的责任", "I kept my side of the bargain.", "我履行了协议中自己一方的责任。"]],
    [["agreement", "协议；一致", "原表注解 · 名词义", "agreement 是宽泛协议；bargain 常是双方让步或交换条件后达成的约定。", "The countries signed a trade agreement.", "两国签署了贸易协议。"], ["negotiate", "谈判；协商", "原表注解 · 动词义", "negotiate 可谈复杂条款；bargain 常突出围绕价格或条件来回争取。", "The union negotiated a new contract.", "工会协商了一份新合同。"], ["deal", "交易；协议", "近义词", "deal 口语而宽泛；bargain 还可指价格特别划算的商品。", "We made a deal to share the costs.", "我们达成了分担费用的协议。"]],
    M("声音联想（非词源）：bargain 像‘把价给你’，市场里来回谈条件。", "可靠词源：经 Old French bargaignier，早期含交易、争论、讨价还价；更深来源不确定。", "熟词桥：a good bargain 是便宜货；strike a bargain 是谈成交换条件。", "两只狐狸为胡萝卜谈判，最终用三个月亮换一根菜叶。", "协商条件 → 达成协议；若价格谈得特别好，就成了‘便宜货’。", "易混刹车：bargain for 表示预料到；bargain with/over 表示与人或就条件讨价还价。", "The fox struck a bargain and paid for one carrot with three moons.", "狐狸达成协议，用三个月亮买了一根胡萝卜。"),
    ["How are the noun and verb senses of bargain linked?", "bargain 的名词义和动词义如何关联？", "People bargain over terms in order to reach a bargain.", "人们就条件讨价还价，从而达成协议。"],
    ["After hours of negotiation, they finally struck a ________.", "经过数小时谈判，他们终于达成协议。", "Strike a bargain means reach an agreement.", "strike a bargain 表示达成协议。"], ["quarrel", "delay", "refusal"]),

  vocab(205, "baroque", "/bəˈrɒk/", "adjective · noun", "装饰华丽的，过分雕琢的，复杂的：extravagance, complexity, flamboyance; （程度上）过分的：beyond, limit", "highly ornate, extravagant, and complex; excessively elaborate", "巴洛克式的；华丽繁复的；过分雕琢的",
    "一把椅子长出金天使、银藤蔓和七层楼梯，复杂到没人找得到座位。",
    [["baroque architecture", "巴洛克建筑", "The church is famous for its baroque architecture.", "这座教堂以巴洛克建筑闻名。"], ["a baroque scheme", "过分复杂的方案", "They devised a baroque scheme for ordering lunch.", "他们为点午餐设计了一套过分复杂的方案。"], ["baroque ornamentation", "华丽繁复的装饰", "Baroque ornamentation covered every surface.", "华丽繁复的装饰覆盖了每个表面。"]],
    [["extravagance", "铺张；过度华丽", "原表注解 · 装饰强度", "extravagance 是过度铺张这一性质；baroque 把它与密集装饰和戏剧感结合。", "The palace was criticized for its extravagance.", "宫殿因铺张而受批评。"], ["complexity", "复杂性", "原表注解 · 结构", "complexity 可中性；baroque 的复杂通常繁复到夸张。", "The complexity of the system caused delays.", "系统的复杂性造成延误。"], ["flamboyance", "华丽炫目", "原表注解 · 风格", "flamboyance 强调炫目张扬；baroque 还包含历史艺术风格和曲折结构。", "His flamboyance attracted photographers.", "他的华丽张扬吸引了摄影师。"], ["beyond the limit", "超出限度", "原表注解 · 程度", "该短语概括 baroque 的引申义：细节或程度多到超出实用限度。", "The decoration went beyond the limit of good taste.", "装饰超出了良好品味的限度。"]],
    M("声音联想（非词源）：baroque 像‘把楼刻’，整栋楼都刻满花纹。", "可靠词源：经 French baroque，通常联系 Portuguese barroco（形状不规则的珍珠）；更早细节有争议。", "熟词桥：Baroque music/architecture 是历史风格；小写可比喻任何过分繁复的设计。", "椅子被雕成一座金色迷宫，坐下前要先爬七层楼。", "不规则、华丽的艺术风格 → 任何装饰繁复、结构过度复杂的事物。", "易混刹车：ornate 只表示装饰华丽；baroque 常更夸张、更复杂，并可指特定历史时期。", "The baroque chair had seven staircases but nowhere to sit.", "那把巴洛克式椅子有七道楼梯，却没有地方坐。"),
    ["What does lowercase baroque often criticize outside art history?", "小写 baroque 在艺术史之外常批评什么？", "Excessive ornament, complexity, or flamboyance.", "过度装饰、复杂或炫丽。"],
    ["The simple request triggered a ________ approval procedure with forty forms.", "简单请求触发了一个要填四十张表的繁复审批流程。", "An excessively elaborate procedure can be baroque.", "过分雕琢复杂的流程可称为 baroque。"], ["minimal", "plain", "streamlined"]),

  vocab(206, "barrage", "/ˈbær.ɑːʒ/", "noun · verb", "弹幕：curtain; 有压倒之势的、集中倾泻的（如言语）：overwhelming, outpouring; （同时）袭来：attack with, overwhelming outpouring", "a concentrated curtain of fire or an overwhelming outpouring; to attack with many things at once", "弹幕；集中倾泻；连珠炮般袭击",
    "无数问号像炮弹同时飞向发言人，在讲台前形成一堵墙。",
    [["a barrage of questions", "连珠炮般的问题", "Reporters fired a barrage of questions at the minister.", "记者向部长连珠炮般发问。"], ["an artillery barrage", "炮火弹幕", "The troops waited for the artillery barrage to end.", "部队等待炮火弹幕结束。"], ["be barraged with complaints", "遭到大量投诉轰炸", "The office was barraged with complaints.", "办公室遭到大量投诉轰炸。"]],
    [["curtain", "幕；屏障", "原表注解 · 实体图像", "curtain 在此提示 curtain of fire；barrage 是密集火力形成的弹幕。", "A curtain of rain hid the hills.", "雨幕遮住了山丘。"], ["overwhelming", "压倒性的", "原表注解 · 强度", "overwhelming 描述强度；barrage 是大量事物同时而来造成这种压力。", "The team faced overwhelming demand.", "团队面对压倒性的需求。"], ["outpouring", "大量涌出", "原表注解 · 流量", "outpouring 常指情感或言语涌现；barrage 更有攻击性和连续冲击感。", "The verdict prompted an outpouring of relief.", "判决引发如潮的宽慰。"], ["volley", "齐射；接连发出", "近义词", "volley 是一轮齐发；barrage 通常更持续、更密集。", "A volley of criticism followed.", "随后是一轮批评。"]],
    M("声音联想（非词源）：barrage 像‘把人炸’，问题一起飞来像炮轰。", "可靠词源：来自 French barrage，由 barrer（阻挡）构成；原指堤坝，军事义后来指炮火屏障。", "熟词桥：a barrage of emails 把邮箱变成遭炮火覆盖的阵地。", "记者的问号装上火箭，成百上千地轰向一把会冒汗的椅子。", "阻挡用的坝/炮火屏障 → 密集攻击 → 大量言语、问题或投诉同时倾泻。", "易混刹车：barrage 强调密集且压倒；stream 只表示连续流，不必带攻击感。", "A barrage of questions forced the microphone to hide under the table.", "连珠炮般的问题逼得麦克风躲到桌下。"),
    ["What image unites artillery and verbal uses of barrage?", "barrage 的炮火义和言语义由什么图像连接？", "Many projectiles arriving densely enough to form an overwhelming curtain.", "大量投射物密集袭来，形成压倒性的幕墙。"],
    ["The spokesperson faced a ________ of hostile questions.", "发言人面对连珠炮般的敌意问题。", "A dense, overwhelming outpouring is a barrage.", "密集而压倒性的倾泻是 barrage。"], ["trickle", "pause", "whisper"]),

  vocab(207, "barren", "/ˈbær.ən/", "adjective", "不育的：incapable, producing; 不产生结果的，无效的：no results; 贫瘠的：deficient; 极度匮乏的：lacking", "unable to produce offspring, crops, or useful results; bleakly deficient or lacking", "不育的；贫瘠的；无结果的；匮乏的",
    "一片土地举着空篮子：既长不出庄稼，也结不出任何想法。",
    [["barren land", "贫瘠土地", "Only thorny shrubs grow on the barren land.", "这片贫瘠土地上只有带刺灌木生长。"], ["a barren debate", "毫无结果的辩论", "The meeting ended after hours of barren debate.", "会议在数小时毫无结果的辩论后结束。"], ["barren of ideas", "毫无想法", "The proposal was barren of practical ideas.", "这项提案毫无实用想法。"]],
    [["incapable of producing", "不能生产或生育", "原表注解 · 生产力", "该短语直释 barren 的生育或产出缺失；barren 还能比喻努力无成果。", "The damaged plant is incapable of producing seeds.", "受损植物无法结籽。"], ["no results", "没有结果", "原表注解 · 比喻义", "no results 说明结果为空；barren 强调过程像贫瘠土地一样不能结出成果。", "The search produced no results.", "搜索没有产生结果。"], ["deficient", "不足的；有缺陷的", "原表注解 · 贫乏", "deficient 表示低于需要量；barren 更强，常近乎完全缺乏。", "The diet is deficient in iron.", "这种饮食缺铁。"], ["lacking", "缺少的", "原表注解 · 状态", "lacking 是普通词；barren of 是书面表达，带空旷、无产出的图像。", "The account is lacking in detail.", "叙述缺少细节。"]],
    M("声音联想（非词源）：barren 像‘搬人’，人和庄稼都搬空，只剩贫瘠土地。", "可靠词源：经 Old French baraine 进入英语；更深来源不确定，不能用中文谐音解释。", "熟词桥：barren desert 是寸草难生；barren discussion 是结不出成果。", "土地把最后一颗种子装进空篮，宣布自己今天也不生产观点。", "不能生育/长庄稼 → 不能产生结果 → 极度缺乏某物。", "易混刹车：bare 是裸露、没有覆盖；barren 是没有生产力或成果。", "The barren field planted ten speeches and harvested silence.", "贫瘠田地种下十篇演讲，只收获了沉默。"),
    ["How does barren extend from land to discussion?", "barren 如何从土地义延伸到讨论？", "Both fail to produce something expected: crops or useful results.", "二者都无法产生预期之物：庄稼或有用结果。"],
    ["Months of negotiation proved ________ and produced no agreement.", "数月谈判毫无结果，未能达成协议。", "An effort that produces no result is barren.", "不产生结果的努力可称为 barren。"], ["fertile", "productive", "fruitful"]),

  vocab(208, "barricade", "/ˌbær.ɪˈkeɪd/", "noun · transitive verb", "障碍物：obstruction, rampart; 用障碍物阻止通过：prevent access", "a makeshift barrier or rampart; to block passage with such obstacles", "路障；街垒；用障碍物封锁",
    "桌椅堆成一堵会说‘禁止通行’的街垒，把走廊堵死。",
    [["erect a barricade", "架设路障", "Residents erected a barricade across the road.", "居民在道路上架设了路障。"], ["barricade the entrance", "用障碍物封住入口", "Police barricaded the entrance with trucks.", "警方用卡车封锁入口。"], ["behind the barricades", "在街垒后", "The protesters remained behind the barricades.", "抗议者留在街垒后。"]],
    [["obstruction", "障碍物；阻塞", "原表注解 · 上位词", "obstruction 是任何阻碍；barricade 通常是人为搭建以阻止通行的实体障碍。", "A fallen tree created an obstruction.", "倒下的树造成障碍。"], ["rampart", "防御壁垒", "原表注解 · 防御", "rampart 是较坚固的防御工事；barricade 常是临时用杂物搭成。", "Soldiers watched from the rampart.", "士兵从壁垒上监视。"], ["prevent access", "阻止进入", "原表注解 · 动词功能", "prevent access 是功能描述；barricade 表示通过设置障碍实现封锁。", "The gate prevents access after dark.", "天黑后大门禁止进入。"], ["barrier", "障碍；屏障", "近义词", "barrier 最宽泛；barricade 更强调故意部署和阻止人群或敌人通过。", "A glass barrier separated the rooms.", "玻璃隔断分开了房间。"]],
    M("声音联想（非词源）：barricade 像‘把路卡的’，用桌椅把路卡住。", "可靠词源：来自 French barricade，关联 barrique（桶）；早期街垒常用桶等杂物搭成。", "熟词桥：barrier 是障碍；barricade 是人为堆出来、带防守目的的障碍。", "一百只木桶排成墙，每只桶都举着‘此路不通’的小旗。", "用桶等杂物临时设防 → 名词街垒；也可作动词封住出入口。", "易混刹车：barricade 后直接接宾语：barricade the door；不要写 barricade from the door。", "The chairs formed a barricade and demanded passports from the mice.", "椅子组成街垒，要求老鼠出示护照。"),
    ["What intentional feature distinguishes a barricade from many obstructions?", "barricade 与一般 obstruction 的主要区别是什么？", "It is deliberately placed to block passage or defend a position.", "它被故意设置来阻止通行或防守位置。"],
    ["Workers used empty crates to ________ the unsafe doorway.", "工人用空箱子封住危险门口。", "To block an entrance with obstacles is to barricade it.", "用障碍物封住入口就是 barricade it。"], ["open", "uncover", "invite"]),

  vocab(209, "barter", "/ˈbɑː.tər/", "noun · verb", "以物换物：trade, without", "to trade goods or services directly without using money", "以物易物；易货贸易",
    "面包师用三条面包换来理发，双方的钱包全程睡觉。",
    [["barter goods for services", "用货物换服务", "Farmers bartered grain for medical services.", "农民用粮食换取医疗服务。"], ["a barter system", "易货制度", "The island relied on a barter system.", "这座岛依赖易货制度。"], ["barter with neighbors", "与邻居以物易物", "Families bartered with neighbors during the shortage.", "短缺期间，各家与邻居以物易物。"]],
    [["trade", "交易；贸易", "原表注解 · 上位词", "trade 可以用货币；barter 专指直接交换物品或服务。", "The nations trade machinery for cash.", "两国以现金进行机械贸易。"], ["without money", "不用货币", "原表注解 · 必要特征", "without money 是 barter 的关键限制：交换价值但不以货币结算。", "They exchanged labor without money.", "他们不用钱交换劳动。"], ["exchange", "交换", "近义词", "exchange 可交换任何东西；barter 常含协商比例，并以实物或服务互换。", "We exchanged phone numbers.", "我们交换了电话号码。"]],
    M("声音联想（非词源）：barter 像‘把它换’，不掏钱，直接把它换走。", "可靠词源：来自 Old French barater（交易、讨价还价，也曾含欺诈义）；更深来源不确定。", "熟词桥：trade without money 就是最短定义；barter X for Y。", "面包师拿会唱歌的面包换理发，理发师用剪下的头发换一把伞。", "直接交换物品或服务，价值流动但钱不参与。", "易混刹车：barter A for B；bargain 是谈价格或条件，不必实际以物换物。", "The baker bartered three loaves for a haircut and one cloud.", "面包师用三条面包换了一次理发和一朵云。"),
    ["What must be absent for a transaction to be barter?", "交易要成为 barter，必须缺少什么？", "Money; goods or services are exchanged directly.", "货币；商品或服务直接互换。"],
    ["The villagers began to ________ eggs for fuel when cash was scarce.", "现金短缺时，村民开始用鸡蛋换燃料。", "Direct exchange without money is barter.", "不用货币的直接交换是 barter。"], ["purchase", "donate", "invoice"]),

  vocab(210, "batch", "/bætʃ/", "noun · transitive verb", "一批次的量：unit; 一小群人：small number of persons", "a quantity produced or handled as one unit; a small group of people", "一批；一批次的量；一小群人",
    "烤箱一次吐出十二块饼干，贴着同一张‘第七批’身份证。",
    [["a batch of cookies", "一批饼干", "She baked a fresh batch of cookies.", "她烤了一批新鲜饼干。"], ["process in batches", "分批处理", "The laboratory processes samples in batches.", "实验室分批处理样本。"], ["a new batch of recruits", "一小批新兵", "A new batch of recruits arrived Monday.", "周一来了一批新兵。"]],
    [["unit", "单位；单元", "原表注解 · 处理整体", "unit 是任何作为整体的单位；batch 特指同一轮生产或处理的一批。", "The family functions as a social unit.", "家庭作为社会单位运作。"], ["small number of persons", "一小群人", "原表注解 · 人群", "该短语说明 batch 可非正式指同一轮到来的一小群人。", "A small number of persons entered the hall.", "一小群人进入大厅。"], ["lot", "一批；一组", "近义词", "lot 很宽泛；batch 常有共同生产、提交或处理时间。", "The first lot of books sold quickly.", "第一批书很快售罄。"]],
    M("声音联想（非词源）：batch 像‘八吃’，一炉八个，大家按批次吃。", "词源结论：batch 的早期来源不确定，可能与 bake 有历史联系，但不能当作确定构词。", "熟词桥：batch processing 是计算机把同类任务集中成批处理。", "烤箱给每块饼干发同一批次护照，然后整批乘火车离开。", "同一次烘烤/生产的量 → 同时处理的一组 → 同轮到来的一小群人。", "易混刹车：a batch 通常强调共同一轮；a bunch 只是松散的一群。", "One batch of cookies formed a union before leaving the oven.", "一批饼干在出炉前成立了工会。"),
    ["What common feature holds a batch together?", "一批 batch 的共同特征是什么？", "Its members are produced, submitted, or processed as one unit.", "其中成员作为一个单位被生产、提交或处理。"],
    ["The editor reviewed a ________ of ten articles together.", "编辑把十篇文章作为一批一起审阅。", "Items handled as one unit form a batch.", "作为一个单位处理的项目构成 batch。"], ["fragment", "individual", "void"]),

  vocab(211, "bathetic", "/bəˈθet.ɪk/", "adjective", "平凡的，陈腐的：commonplaceness", "ridiculously commonplace or sentimental, especially after an attempted lofty effect", "突降为平庸的；陈腐煽情的；滑稽反高潮的",
    "史诗英雄举剑准备拯救世界，却宣布自己的使命只是寻找一只袜子。",
    [["a bathetic ending", "突降平庸的结尾", "The epic speech had a bathetic ending about parking fees.", "史诗般的演讲以停车费作结，突降为平庸。"], ["bathetic sentimentality", "陈腐煽情", "The film slips into bathetic sentimentality.", "电影滑入了陈腐煽情。"], ["a bathetic anticlimax", "滑稽的反高潮", "The quest ended in a bathetic anticlimax.", "这场探索以滑稽的反高潮结束。"]],
    [["commonplaceness", "平凡；陈腐", "原表注解 · 落点", "commonplaceness 只是普通；bathetic 强调本想崇高却突然跌入可笑平庸。", "The essay suffers from commonplaceness.", "文章流于平凡。"], ["anticlimactic", "虎头蛇尾的；反高潮的", "近义词", "anticlimactic 强调效果落空；bathetic 还常含夸张煽情落入俗套。", "The final match was anticlimactic.", "决赛令人觉得虎头蛇尾。"], ["banal", "陈腐平庸的", "易混词 · 第197词", "banal 是缺乏原创；bathetic 特别包含从庄严到琐碎的滑稽降格。", "The dialogue is banal but clear.", "对白陈腐但清楚。"]],
    M("声音联想（非词源）：bathetic 像‘啪地跌’，庄严气氛啪地跌进俗套。", "可靠构词：来自 bathos（突降、反高潮）+ -etic；bathos 源自 Greek bathos（深度）。", "熟词桥：pathos 是感染力；bathos 是过头或降格造成的可笑效果。", "英雄爬上山巅发表宣言，最后一句却是‘谁拿了我的袜子？’。", "追求崇高或感人，却跌落为琐碎、陈腐或可笑。", "易混刹车：不要把 bathetic 误写成 pathetic；前者强调 bathos，后者常指可怜或差劲。", "The bathetic hero saved the world and then complained about parking.", "那位反高潮式英雄拯救世界后，抱怨起停车问题。"),
    ["What movement of tone makes something bathetic?", "什么样的语气变化会显得 bathetic？", "A fall from the lofty or emotional into the trivial or ridiculous.", "从崇高或强烈情感突然跌入琐碎可笑。"],
    ["The grand poem's final line about laundry felt painfully ________.", "宏大诗篇最后写洗衣的那一句显得滑稽地降格。", "A lofty work collapsing into triviality is bathetic.", "崇高作品坠入琐碎就是 bathetic。"], ["sublime", "moving", "majestic"]),

  vocab(212, "bawdy", "/ˈbɔː.di/", "adjective", "下流的，猥亵的：indecent", "humorously indecent, especially in sexual language", "下流诙谐的；猥亵的",
    "酒馆里的鹦鹉讲了个荤笑话，连木桶都羞得滚到桌下。",
    [["a bawdy joke", "荤笑话", "The actor told a bawdy joke that shocked the audience.", "演员讲了个令观众震惊的荤笑话。"], ["bawdy humor", "低俗猥亵的幽默", "The play mixes satire with bawdy humor.", "这出戏把讽刺与低俗荤幽默混在一起。"], ["a bawdy song", "下流歌曲", "Sailors sang a bawdy song in the tavern.", "水手们在酒馆唱了一首下流歌曲。"]],
    [["indecent", "不雅的；猥亵的", "原表注解 · 上位词", "indecent 可指衣着、行为或言语不雅；bawdy 常指带性暗示且有喜剧色彩的语言或作品。", "The broadcaster removed the indecent material.", "广播机构删掉了不雅内容。"], ["ribald", "粗俗诙谐的；猥亵的", "近义词 · 书面", "ribald 与 bawdy 很接近；ribald 更书面，bawdy 更常修饰 joke、song、comedy。", "The novel contains ribald humor.", "小说包含粗俗诙谐。"], ["vulgar", "粗俗的", "近义词", "vulgar 范围更广，可指没品味；bawdy 特指性方面的粗俗幽默。", "The gesture was vulgar.", "那个手势很粗俗。"]],
    M("声音联想（非词源）：bawdy 像‘包弟’，弟弟把荤笑话包进礼盒，打开后全桌脸红。", "可靠词源：由 bawd（历史上指妓院经营者等）+ -y 构成；词义后来集中为猥亵诙谐。", "熟词桥：bawdy comedy 是靠性暗示制造笑料的喜剧。", "鹦鹉讲荤段子，酒馆的桌椅一起捂耳朵，木桶羞得滚走。", "与性行业相关的旧词 → 带性暗示、粗俗又常逗笑的语言。", "易混刹车：bawdy 不只是‘好笑’，而是带不雅性内容；正式场合慎用。", "The bawdy parrot made even the wooden barrel blush.", "那只讲荤话的鹦鹉让木桶都脸红了。"),
    ["What kind of indecency does bawdy usually describe?", "bawdy 通常描述哪类不雅？", "Sexually suggestive language or humor, often comic.", "带性暗示的语言或幽默，通常具有喜剧性。"],
    ["The editor removed several ________ jokes from the family edition.", "编辑从家庭版中删掉了几个荤笑话。", "Sexually indecent jokes are bawdy.", "带性内容的不雅笑话是 bawdy jokes。"], ["wholesome", "refined", "innocent"]),

  vocab(213, "bedeck", "/bɪˈdek/", "transitive verb", "装饰，点缀：make more attractive", "to decorate elaborately or festively", "装饰；华丽地点缀",
    "一棵树戴满珠宝、彩灯和三十顶帽子，连树枝都走不动。",
    [["bedeck the hall with flowers", "用鲜花装饰大厅", "They bedecked the hall with flowers and ribbons.", "他们用鲜花和彩带装饰大厅。"], ["be bedecked in jewels", "佩满珠宝", "The statue was bedecked in jewels.", "雕像佩满珠宝。"], ["bedecked with flags", "用旗帜装点的", "Balconies were bedecked with flags.", "阳台上装点着旗帜。"]],
    [["make more attractive", "使更美观", "原表注解 · 目的", "该短语说明装饰目的；bedeck 常暗示装得丰富、显眼甚至华丽。", "Fresh paint made the room more attractive.", "新油漆让房间更美观。"], ["adorn", "装饰；点缀", "近义词 · 正式", "adorn 可少量优雅点缀；bedeck 往往是用许多装饰物覆盖。", "A silver pin adorned her coat.", "一枚银别针点缀她的外套。"], ["decorate", "装饰", "近义词 · 中性", "decorate 最普通；bedeck 更有节庆、华丽和堆满的画面。", "Children decorated the classroom.", "孩子们装饰教室。"]],
    M("声音联想（非词源）：bedeck 像‘把 deck 装满’，甲板挂满彩旗。", "可靠构词：be-（使、遍及）+ deck（装饰）；不是由中文读音形成。", "熟词桥：deck the halls 是装饰大厅；bedeck 把‘装满’感压进一个及物动词。", "树上挂了三十顶帽子、四十串灯，最后还戴上一艘小船。", "在表面铺上装饰 → 用丰富饰物把人或地方装点得醒目。", "易混刹车：常用 bedeck A with B 或 be bedecked in/with；它比简单 decorate 更华丽。", "They bedecked the tree until it needed wheels.", "他们把树装饰到它需要装轮子才能移动。"),
    ["What visual intensity does bedeck add to decorate?", "bedeck 比 decorate 多什么视觉强度？", "It suggests abundant, conspicuous, often festive decoration.", "它暗示丰富、醒目且常带节庆感的装饰。"],
    ["For the festival, residents ________ every doorway with flowers.", "节日期间，居民用鲜花装点每个门口。", "Lavish festive decoration is expressed by bedeck.", "丰富的节庆装饰可用 bedeck。"], ["strip", "empty", "deface"]),

  vocab(214, "belabor", "/bɪˈleɪ.bər/", "transitive verb", "（当众）严厉批评：criticize; 就···作过度的说明，喋喋不休：explain, excessively", "to criticize forcefully or to explain and discuss a point far too much", "严厉批评；反复啰嗦；过度说明",
    "老师拿充气锤反复敲同一个观点，直到句号也请求下课。",
    [["belabor the point", "反复啰嗦同一点", "I will not belabor the point any further.", "我不再反复阐述这一点。"], ["belabor someone with criticism", "不断严厉批评某人", "The host belabored the guest with criticism.", "主持人不断严厉批评嘉宾。"], ["belabor the obvious", "对显而易见之事喋喋不休", "The report belabors the obvious.", "报告对显而易见之事喋喋不休。"]],
    [["criticize", "批评", "原表注解 · 攻击义", "criticize 可以简短理性；belabor 可指猛烈、反复地攻击。", "The panel criticized the weak methodology.", "小组批评了薄弱的方法。"], ["explain excessively", "过度说明", "原表注解 · 啰嗦义", "explain excessively 直接点出 belabor the point：解释次数和篇幅远超需要。", "He explained the rule excessively.", "他过度解释了这条规则。"], ["dwell on", "反复谈论；纠缠于", "近义词", "dwell on 可因沉思而久谈；belabor 带‘敲打过度’的不耐烦评价。", "Do not dwell on a minor mistake.", "别纠缠于一个小错误。"]],
    M("声音联想（非词源）：belabor 像‘被劳动’，同一观点被反复加工到过劳。", "可靠构词：be-（彻底地）+ labor（劳作、费力处理）；早期也含痛打，后发展为言语攻击或过度展开。", "熟词桥：固定搭配 belabor the point 是考试重点：把一个点说到磨损。", "演讲者用锤子敲一个句号，敲了三小时，句号申请变成省略号逃走。", "费力反复击打 → 严厉攻击；对观点反复加工 → 喋喋不休。", "易混刹车：elaborate 是详细阐述，可中性；belabor 明确表示过度或猛烈。", "He belabored the point until the period resigned.", "他反复啰嗦那一点，直到句号辞职。"),
    ["What negative judgment is built into belabor the point?", "belabor the point 内含什么负面判断？", "The point has been explained longer or more repeatedly than necessary.", "这个观点被解释得过久、过于重复。"],
    ["The chair asked the speaker not to ________ an issue everyone understood.", "主席请发言者不要对大家都懂的问题喋喋不休。", "Overexplaining one point is belaboring it.", "对一点过度说明就是 belabor it。"], ["summarize", "clarify briefly", "omit"]),

  vocab(215, "beleaguer", "/bɪˈliː.ɡər/", "transitive verb", "包围，围攻：to surround; 使困扰，使烦恼，使消沉：trouble", "to surround as in a siege; to trouble persistently from many sides", "包围；围攻；使饱受困扰",
    "城堡被账单、电话和乌云团团围住，连吊桥都愁得垂下头。",
    [["a beleaguered city", "遭围困的城市", "Food was scarce in the beleaguered city.", "遭围困的城市里食物短缺。"], ["be beleaguered by problems", "被问题重重困扰", "The agency was beleaguered by scandals.", "该机构被丑闻重重困扰。"], ["beleaguer the defenders", "围困守军", "Enemy forces continued to beleaguer the defenders.", "敌军继续围困守军。"]],
    [["surround", "包围", "原表注解 · 空间动作", "surround 是中性地围住；beleaguer 原为军事围攻，暗示敌意和持续压力。", "Trees surround the house.", "树木环绕房屋。"], ["trouble", "困扰；麻烦", "原表注解 · 比喻义", "trouble 很宽泛；beleaguer 通常是问题从多方面持续压迫。", "Staff shortages trouble the hospital.", "人手短缺困扰医院。"], ["besiege", "围攻；围困", "近义词", "besiege 与军事义几乎同义，也可指请求蜂拥而至；beleaguer 更常见于 beleaguered organization/person。", "Reporters besieged the actor with questions.", "记者用问题围住演员。"]],
    M("声音联想（非词源）：beleaguer 像‘被围个’，城堡被围个水泄不通。", "可靠词源：来自 Dutch belegeren（围攻），由 be- + leger（营地）构成，即在目标周围扎营。", "熟词桥：league 不提供这里的词义；记 beleaguered company = 被问题围攻的公司。", "账单骑着小马在城堡四周扎营，电话从空中投下更多问题。", "军队环城扎营 → 围攻；麻烦从四面持续袭来 → 使困扰消沉。", "易混刹车：beleaguer 是及物动词，最常见过去分词 beleaguered；不要按 league 猜成‘结盟’。", "Bills beleaguered the castle until its drawbridge sighed.", "账单围困城堡，直到吊桥叹气。"),
    ["How does the figurative beleaguer preserve the siege image?", "beleaguer 的比喻义如何保留围城图像？", "Problems press persistently from many sides like an attacking army.", "问题像进攻军队一样从多方面持续施压。"],
    ["The ________ director faced lawsuits, debts, and staff resignations.", "这位饱受困扰的主管面对诉讼、债务和员工辞职。", "Pressure from many sides makes someone beleaguered.", "来自多方面的压力使人 beleaguered。"], ["untroubled", "protected", "relaxed"]),
];

const ipas = new Map([
  ["critical", "/ˈkrɪt.ɪ.kəl/"], ["jab", "/dʒæb/"], ["mercilessly", "/ˈmɜː.sɪ.ləs.li/"], ["uncivilized", "/ʌnˈsɪv.əl.aɪzd/"], ["brutal", "/ˈbruː.təl/"], ["brazen", "/ˈbreɪ.zən/"], ["shameless", "/ˈʃeɪm.ləs/"], ["agreement", "/əˈɡriː.mənt/"], ["negotiate", "/nɪˈɡəʊ.ʃi.eɪt/"], ["deal", "/diːl/"], ["extravagance", "/ɪkˈstræv.ə.ɡəns/"], ["complexity", "/kəmˈplek.sə.ti/"], ["flamboyance", "/flæmˈbɔɪ.əns/"], ["beyond the limit", "/bɪˌjɒnd ðə ˈlɪm.ɪt/"], ["curtain", "/ˈkɜː.tən/"], ["overwhelming", "/ˌəʊ.vəˈwel.mɪŋ/"], ["outpouring", "/ˈaʊtˌpɔː.rɪŋ/"], ["volley", "/ˈvɒl.i/"], ["incapable of producing", "/ɪnˌkeɪ.pə.bəl əv prəˈdjuː.sɪŋ/"], ["no results", "/nəʊ rɪˈzʌlts/"], ["deficient", "/dɪˈfɪʃ.ənt/"], ["lacking", "/ˈlæk.ɪŋ/"], ["obstruction", "/əbˈstrʌk.ʃən/"], ["rampart", "/ˈræm.pɑːt/"], ["prevent access", "/prɪˌvent ˈæk.ses/"], ["barrier", "/ˈbær.i.ər/"], ["trade", "/treɪd/"], ["without money", "/wɪˌðaʊt ˈmʌn.i/"], ["exchange", "/ɪksˈtʃeɪndʒ/"], ["unit", "/ˈjuː.nɪt/"], ["small number of persons", "/smɔːl ˌnʌm.bər əv ˈpɜː.sənz/"], ["lot", "/lɒt/"], ["commonplaceness", "/ˈkɒm.ən.pleɪs.nəs/"], ["anticlimactic", "/ˌæn.ti.klaɪˈmæk.tɪk/"], ["banal", "/bəˈnɑːl/"], ["indecent", "/ɪnˈdiː.sənt/"], ["ribald", "/ˈrɪb.əld/"], ["vulgar", "/ˈvʌl.ɡər/"], ["make more attractive", "/meɪk mɔːr əˈtræk.tɪv/"], ["adorn", "/əˈdɔːn/"], ["decorate", "/ˈdek.ə.reɪt/"], ["criticize", "/ˈkrɪt.ɪ.saɪz/"], ["explain excessively", "/ɪkˌspleɪn ɪkˈses.ɪv.li/"], ["dwell on", "/dwel ɒn/"], ["surround", "/səˈraʊnd/"], ["trouble", "/ˈtrʌb.əl/"], ["besiege", "/bɪˈsiːdʒ/"]
]);

for (const config of all) {
  config.register = "GRE 高频 · 正式 / 书面";
  for (const item of config.comparisons) item[6] = ipas.get(item[0]);
}
const group = (start) => all.slice(start - 201, start - 196);

export const set41 = compactSet(41, "The Negotiating Crown", group(201), {
  title: "The Negotiating Crown", targetForms: ["barb", "barbarous", "barefaced", "bargain", "baroque"],
  plain: "A barb called a barbarous king barefaced, so his crown made a bargain with a baroque chair and escaped through a window.",
  translation: "一句尖刻话说一位野蛮国王厚颜无耻，于是他的王冠与一把巴洛克式椅子达成协议，从窗户逃走了。",
});
export const set42 = compactSet(42, "The Cookie Fortress", group(206), {
  title: "The Cookie Fortress", targetForms: ["barrage", "barren", "barricade", "barter", "batch"],
  plain: "During a barrage of spoons, a barren oven built a barricade, tried to barter its door for a hat, and baked one batch of invisible cookies.",
  translation: "在勺子弹幕中，一只贫瘠烤箱筑起街垒，试图用炉门换帽子，并烤出一批隐形饼干。",
});
export const set43 = compactSet(43, "The Overdressed Speech", group(211), {
  title: "The Overdressed Speech", targetForms: ["bathetic", "bawdy", "bedecked", "belabored", "beleaguered"],
  plain: "A bathetic speech told a bawdy joke, bedecked its commas with feathers, belabored one syllable, and left the dictionary beleaguered by applause.",
  translation: "一篇反高潮式演讲讲了个荤笑话，给逗号插满羽毛，对一个音节喋喋不休，最终让词典被掌声围困。",
});
