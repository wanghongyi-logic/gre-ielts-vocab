import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(286, "cacophony", "/kəˈkɒf.ə.ni/", "noun", "刺耳的声音：inharmonious sound", "a harsh, discordant mixture of sounds", "刺耳嘈杂的声音；不和谐音响",
    "锅盖、警报器和公鸡组成乐队，每件乐器都坚持演奏不同的歌。",
    [["a cacophony of voices", "一片嘈杂人声", "A cacophony of voices filled the station.", "车站里充满一片嘈杂人声。"], ["create a cacophony", "制造刺耳杂音", "The alarms and horns created a cacophony.", "警报与喇叭制造出刺耳杂音。"], ["rise above the cacophony", "盖过嘈杂声", "Her clear announcement rose above the cacophony.", "她清晰的通知盖过了嘈杂声。"]],
    [["inharmonious sound", "不和谐的声音", "原表注解 · 核心", "inharmonious sound 是解释性短语；cacophony 强调许多刺耳声音混在一起。", "An inharmonious sound came from the broken piano.", "破钢琴发出不和谐的声音。"], ["discord", "不和谐音", "近义词", "discord 可指声音不和谐，也可指意见冲突；cacophony 通常是一团响亮杂音。", "A note of discord spoiled the chord.", "一个不和谐音破坏了和弦。"], ["din", "持续喧闹声", "近义词", "din 强调响而持续；cacophony 还强调多个声音彼此冲突、难听。", "The din of machinery continued all day.", "机器的喧闹声持续了一整天。"]],
    M("声音联想（非词源）：cacophony 像‘咔咔疯你’，刺耳杂音咔咔响到让人发疯。", "可靠词根：Greek kakos（bad）+ phōnē（sound, voice），经法语/拉丁形式进入英语。", "熟词桥：phone 与 phon- 都关联声音；caco- 表坏，合起来就是 bad sound。", "锅盖乐队、汽笛和公鸡各唱一首歌，指挥的耳塞先辞职了。", "坏的声音 → 多种刺耳、不和谐声音混成一团。", "易混刹车：cacophony 不只是 loud；响亮但和谐的合唱不是 cacophony。", "The cacophony was so fierce that the conductor's earplugs resigned.", "杂音刺耳到指挥的耳塞都辞职了。"),
    ["What makes a loud sound a cacophony?", "响亮声音满足什么条件才是 cacophony？", "It must be a harsh, discordant mixture rather than merely high in volume.", "它必须是刺耳且彼此冲突的混合声，而不只是音量大。"],
    ["A ________ of sirens, drills, and shouting surrounded the site.", "警笛、电钻和喊声形成的刺耳混响包围了现场。", "A harsh mixture of conflicting sounds is a cacophony.", "彼此冲突的刺耳混合声就是 cacophony。"], ["harmony", "silence", "melody"]),

  vocab(287, "cadge", "/kædʒ/", "verb", "乞讨，乞求：beg", "to obtain something by begging, borrowing, or imposing on others", "乞讨；讨要；揩油取得",
    "一只乌鸦拿着空杯，挨桌讨面包、车票和别人的耐心。",
    [["cadge a meal", "讨一顿饭", "He cadged a meal from an old acquaintance.", "他从旧相识那里讨了一顿饭。"], ["cadge a lift", "搭便车", "We cadged a lift to the next village.", "我们搭便车去了下一个村庄。"], ["cadge money from someone", "向某人讨钱", "The fraudster cadged money from sympathetic tourists.", "骗子向富有同情心的游客讨钱。"]],
    [["beg", "乞求；乞讨", "原表注解 · 核心", "beg 可真诚恳求任何事；cadge 较非正式，常指靠纠缠或占便宜弄到食物、钱或搭车。", "The child begged for another chance.", "孩子恳求再给一次机会。"], ["scrounge", "四处讨取；搜寻", "近义词", "scrounge 常四处搜罗；cadge 更突出从别人那里白拿或借用。", "They scrounged spare parts from nearby garages.", "他们从附近车库四处搜罗零件。"], ["borrow", "借入", "易混词", "borrow 通常承诺归还；cadge 可能借而不还，并带给别人添麻烦的语气。", "May I borrow your umbrella?", "我可以借你的伞吗？"]],
    M("声音联想（非词源）：cadge 像‘揩点儿’，到处揩点便宜、讨点东西。", "词源结论：cadge 的来源不完全确定；可能与早期携带货物、沿路兜售的词义有关，不能当作确定词根拆解。", "熟词桥：cadge a lift 是英式常见搭配，相当于靠请求搭一程便车。", "乌鸦端着空杯，从每张桌子讨一口面包，最后还要借走桌子。", "向别人请求取得 → 常带占便宜、白拿或纠缠色彩。", "易混刹车：cadge 比 ask 更负面、更非正式；正式请求帮助不要随便用它。", "The crow cadged a sandwich and then asked to borrow the picnic table.", "乌鸦讨走三明治，又要求借走野餐桌。"),
    ["What negative shade can cadge add to ask or borrow?", "cadge 比 ask 或 borrow 多什么负面色彩？", "It can imply getting things by imposing on others or habitually freeloading.", "它可能暗示给别人添麻烦或习惯性占便宜。"],
    ["He tried to ________ a free ticket from every person in the queue.", "他试图向队伍里的每个人讨一张免费票。", "Cadge means obtain something through persistent begging or freeloading.", "cadge 表示靠反复乞求或揩油取得。"], ["purchase", "return", "donate"]),

  vocab(288, "cajole", "/kəˈdʒəʊl/", "verb", "哄骗：wheedle", "to persuade with flattery, gentle pressure, or coaxing", "哄劝；诱骗；用甜言蜜语说服",
    "狐狸给倔强的门唱赞歌，哄得门自己打开。",
    [["cajole someone into agreeing", "哄某人同意", "She cajoled the board into agreeing to a trial.", "她哄劝董事会同意试行。"], ["cajole information out of someone", "哄出信息", "The reporter cajoled a detail out of the witness.", "记者从证人那里哄出一个细节。"], ["gently cajole", "温和哄劝", "He gently cajoled the child into tasting the soup.", "他温和地哄孩子尝汤。"]],
    [["wheedle", "用甜言蜜语哄骗", "原表注解 · 强近义", "wheedle 与 cajole 很近；wheedle 更突出奉承纠缠，cajole 可兼有温柔劝说和轻微施压。", "She wheedled an invitation from her neighbor.", "她用甜言蜜语从邻居那里讨到邀请。"], ["coax", "耐心劝诱", "近义词", "coax 往往温和耐心，不必欺骗；cajole 更可能包含奉承或操纵。", "We coaxed the frightened cat out of hiding.", "我们耐心把受惊的猫哄出藏身处。"], ["flatter", "奉承", "相关词", "flatter 是称赞取悦；cajole 用奉承作为手段，目标是让对方行动。", "He flattered the host's taste.", "他奉承主人的品味。"]],
    M("声音联想（非词源）：cajole 像‘夸就’，夸几句就把对方哄动了。", "可靠词源：来自 French cajoler（哄骗、奉承）；更深来源存在争议，不能硬拆成确定词根。", "熟词桥：cajole someone into doing 是考试高频结构，结果动作放在 into 后。", "狐狸给铁门戴花环、唱赞歌，门害羞得自己打开。", "用好话取悦 → 逐步说服，甚至带操纵性地哄到对方行动。", "易混刹车：persuade 中性；cajole 指手段是奉承、哄劝或柔性纠缠。", "The fox cajoled the door into opening by praising its hinges.", "狐狸夸门铰链漂亮，哄得门自己打开。"),
    ["Which structure shows the action produced by cajoling?", "哪个结构表示哄劝产生的行动？", "Cajole someone into doing something.", "cajole someone into doing something。"],
    ["The lobbyist tried to ________ officials into relaxing the rule.", "说客试图哄劝官员放宽规定。", "Cajole fits persuasion through flattery or gentle pressure.", "通过奉承或柔性施压说服适合用 cajole。"], ["command", "compel", "forbid"]),

  vocab(289, "calcify", "/ˈkæl.sɪ.faɪ/", "verb", "使僵化：inflexible, unchangeable", "to harden through calcium deposits; to become rigid and resistant to change", "钙化；使僵化、固定不变",
    "一条老规则变成石灰雕像，关节再也弯不了。",
    [["arteries calcify", "动脉钙化", "Arteries may calcify as deposits accumulate.", "随着沉积物积聚，动脉可能钙化。"], ["ideas become calcified", "思想变得僵化", "The institution's ideas had become calcified.", "该机构的思想已经变得僵化。"], ["calcify into doctrine", "僵化成教条", "A useful guideline calcified into rigid doctrine.", "一条有用准则僵化成了死板教条。"]],
    [["inflexible", "不灵活的；僵硬的", "原表注解 · 性质", "inflexible 描述状态；calcify 描写逐渐变硬、失去适应性的过程。", "The schedule is too inflexible for emergencies.", "日程过于死板，无法应对紧急情况。"], ["unchangeable", "不可改变的", "原表注解 · 结果", "unchangeable 可能天生固定；calcified 强调原本可变的东西后来僵死。", "The law is not unchangeable.", "法律并非不可改变。"], ["ossify", "骨化；僵化", "近义词", "ossify 与 calcify 的比喻义近；ossify 更常指制度习惯凝固，calcify 保留钙质沉积的医学图像。", "The once flexible system began to ossify.", "曾经灵活的体系开始僵化。"]],
    M("声音联想（非词源）：calcify 看到 calci- 就想到 calcium，钙沉积后变硬。", "可靠构词：Latin calx/calc-（lime，石灰）相关词干 + -ify（使成为）；与 calcium 同源关联。", "熟词桥：calcium builds hard structures；calcify 就是变得像钙质一样硬。", "一条规章喝下钙奶后变成石像，所有修订笔都被弹开。", "组织钙盐沉积而变硬 → 思想、制度失去弹性而僵化。", "易混刹车：clarify 是澄清；calcify 多了 c，核心是 calcium 与硬化。", "The rule calcified until even the stone committee called it rigid.", "规则僵化到连石头委员会都说它死板。"),
    ["What change does figurative calcify describe?", "calcify 的比喻义描述什么变化？", "Something flexible gradually becomes rigid and resistant to revision.", "原本灵活的事物逐渐变得僵硬、抗拒修改。"],
    ["Without debate, temporary customs can ________ into permanent rules.", "缺乏讨论时，临时习惯可能僵化成永久规则。", "Calcify into describes becoming rigid and fixed.", "calcify into 表示逐渐变得僵硬固定。"], ["adapt", "soften", "evolve"]),

  vocab(290, "calibrate", "/ˈkæl.ɪ.breɪt/", "verb", "调整，使标准化：standardize; （根据标准）精确测量：measure precisely", "to adjust an instrument to a standard or measure precisely against one", "校准；调整到标准；精确测量",
    "工程师拿标准尺给巨型温度计调零，再精确测量月亮温度。",
    [["calibrate an instrument", "校准仪器", "Technicians calibrate the instrument every month.", "技术人员每月校准仪器。"], ["calibrate against a standard", "按标准校准", "The sensor was calibrated against a certified standard.", "传感器按照认证标准校准。"], ["carefully calibrate a response", "仔细调整回应力度", "The diplomat carefully calibrated her response.", "外交官仔细拿捏回应力度。"]],
    [["standardize", "使标准化", "原表注解 · 调整", "standardize 让多个事物遵循统一规格；calibrate 是把测量工具或反应对准已知标准。", "The laboratory standardized its reporting format.", "实验室统一了报告格式。"], ["measure precisely", "精确测量", "原表注解 · 测量", "measure precisely 强调结果；calibrate 还可指测量前先调整仪器准确度。", "The device can measure pressure precisely.", "该设备能精确测量压力。"], ["adjust", "调整", "近义词", "adjust 是任何改变；calibrate 是基于尺度或目标进行精细、可控的调整。", "Please adjust the chair height.", "请调整椅子高度。"]],
    M("声音联想（非词源）：calibrate 像‘卡里摆正’，把刻度卡到标准位置。", "可靠词源：由 caliber/calibre（口径、尺度）派生；caliber 经法语来自阿拉伯语 qālib（模具、标准形式）。", "熟词桥：calibration curve 是校准曲线，把仪器读数和真实标准一一对齐。", "工程师拿一把黄金标准尺，给温度计每个刻度排队站直。", "对准标准尺度 → 保证精确测量 → 比喻上精细控制反应强度。", "易混刹车：calibrate 不是泛泛 repair；仪器没坏也需要定期校准。", "The engineer calibrated the thermometer before measuring the moon's fever.", "工程师校准温度计后才测量月亮是否发烧。"),
    ["What reference is essential to calibration?", "校准必不可少的参照是什么？", "A known standard or scale against which adjustment or measurement is made.", "用于调整或测量的已知标准或尺度。"],
    ["Before the trial, researchers must ________ every pressure sensor.", "试验前，研究人员必须校准每个压力传感器。", "Instruments are calibrated against standards for accurate readings.", "仪器按标准校准以获得准确读数。"], ["improvise", "discard", "misread"]),

  vocab(291, "calligraphy", "/kəˈlɪɡ.rə.fi/", "noun", "（优美的）书法：elegant handwriting", "the art of beautiful, skillfully formed handwriting", "书法；优美的手写字",
    "毛笔写出的字长出翅膀，在纸上排成优雅舞步。",
    [["practice calligraphy", "练习书法", "She practices calligraphy every morning.", "她每天早晨练习书法。"], ["Chinese calligraphy", "中国书法", "The exhibition explores the history of Chinese calligraphy.", "展览探索中国书法史。"], ["a calligraphy brush", "书法毛笔", "He cleaned the calligraphy brush after class.", "课后他清洗了书法毛笔。"]],
    [["elegant handwriting", "优美的手写字", "原表注解 · 核心", "elegant handwriting 可是写得好看；calligraphy 是把优美书写当成有规则、有审美的艺术实践。", "Her elegant handwriting impressed the clerk.", "她优美的字迹给职员留下深刻印象。"], ["penmanship", "书写技巧；字迹", "近义词", "penmanship 关注书写技能和可读性；calligraphy 更强调艺术性和风格传统。", "Good penmanship made the notes easy to read.", "良好书写使笔记易读。"], ["typography", "字体排印设计", "易混词", "typography 设计印刷或数字字体版面；calligraphy 通常由手工书写完成。", "The magazine won an award for typography.", "该杂志因字体排印获奖。"]],
    M("声音联想（非词源）：calligraphy 像‘看了给个赞’，漂亮书法让人看后称赞。", "可靠词根：Greek kallos（beauty）+ graphein（to write），字面为 beautiful writing。", "熟词桥：-graphy 表书写或记录，如 biography；calli- 表美。", "毛笔写出一只孔雀，每一笔都展开羽毛向观众鞠躬。", "美 + 书写 → 以优美字形为核心的书写艺术。", "易混刹车：calligraphy 不是所有 handwriting；潦草便条属于 handwriting，不属于书法艺术。", "The calligraphy bowed gracefully after finishing its own signature.", "书法写完自己的签名后优雅鞠躬。"),
    ["What makes handwriting calligraphy?", "什么让 handwriting 成为 calligraphy？", "Deliberate artistic formation of letters according to an aesthetic tradition.", "按照审美传统有意识地艺术化塑造字形。"],
    ["The invitation was written by hand in elegant ________.", "邀请函以优雅书法手写而成。", "Artistic handwriting is calligraphy.", "艺术化的手写字是 calligraphy。"], ["stenography", "typing", "printing"]),

  vocab(292, "callous", "/ˈkæl.əs/", "adjective", " 无同情心的，冷漠的：unfeeling", "showing cruel disregard for other people's feelings or suffering", "冷漠无情的；麻木不仁的",
    "一颗心穿上厚厚石甲，对旁边的眼泪完全没有感觉。",
    [["a callous remark", "冷漠无情的话", "His callous remark deepened her grief.", "他冷漠的话加深了她的悲伤。"], ["callous indifference", "冷酷的漠不关心", "The report exposed callous indifference to patients.", "报告揭露了对患者冷酷的漠不关心。"], ["seem callous", "显得无情", "Refusing all assistance would seem callous.", "拒绝一切援助会显得无情。"]],
    [["unfeeling", "无同情心的；冷漠的", "原表注解 · 强近义", "unfeeling 是直接近义词；callous 暗示同情心像皮肤老茧一样变厚、对痛苦麻木。", "The decision appeared unfeeling.", "这个决定显得无情。"], ["insensitive", "不体谅的；不敏感的", "近义词", "insensitive 可因没意识到而冒犯；callous 通常更严重，带残酷漠视。", "The joke was insensitive but not malicious.", "这个笑话不体谅人，但并非恶意。"], ["indifferent", "漠不关心的", "近义词", "indifferent 只是缺乏兴趣；callous 表示面对真实痛苦仍冷硬无情。", "He seemed indifferent to the result.", "他似乎对结果漠不关心。"]],
    M("声音联想（非词源）：callous 像‘壳牢死’，心外壳太厚，对痛苦没感觉。", "可靠词源：来自 Latin callum（硬皮、老茧）；由身体感觉迟钝发展为情感麻木。", "熟词桥：callus 是皮肤老茧；callous 是心像长了老茧一样不敏感。", "石头心穿七层盔甲，眼泪敲门时它还把门铃静音。", "皮肤硬茧失去感觉 → 对他人痛苦情感麻木。", "易混刹车：callous 是形容词；callus 是名词‘老茧’，拼写结尾不同。", "The callous heart wore armor and ignored every tear at the gate.", "冷漠的心穿着盔甲，无视门口每一滴眼泪。"),
    ["Why is callous stronger than merely uninterested?", "callous 为什么比‘不感兴趣’更严重？", "It implies cruel lack of sympathy in the face of another person's suffering.", "它暗示面对他人痛苦时仍残酷缺乏同情。"],
    ["The executive's ________ response to the injured workers caused outrage.", "高管对受伤工人的冷漠回应引发愤怒。", "Cruel disregard for suffering is callous.", "残酷漠视痛苦就是 callous。"], ["compassionate", "tender", "considerate"]),

  vocab(293, "callow", "/ˈkæl.əʊ/", "adjective", "不老练的，不成熟的：lacking, experience", "young, inexperienced, and immature", "年轻无经验的；不成熟的",
    "刚破壳的小鸟戴着经理领带，却把会议纪要当午餐。",
    [["a callow youth", "不谙世事的年轻人", "The memoir describes him as a callow youth.", "回忆录把他描述为一个不谙世事的年轻人。"], ["a callow recruit", "缺乏经验的新手", "The callow recruit underestimated the task.", "缺乏经验的新手低估了任务。"], ["callow confidence", "幼稚的自信", "Her callow confidence vanished during the first crisis.", "她幼稚的自信在第一次危机中消失了。"]],
    [["lacking", "缺乏的", "原表注解 · 缺少", "lacking 必须说明缺什么；callow 固定指缺少成熟度和经验。", "The proposal is lacking in detail.", "提案缺乏细节。"], ["experience", "经验", "原表注解 · 缺少对象", "experience 是积累的知识；callow 描写尚未获得这些经验的人。", "Years of experience improved her judgment.", "多年经验提高了她的判断力。"], ["immature", "不成熟的", "近义词", "immature 可指任何年龄行为幼稚；callow 常把年轻与无经验联系起来，较书面。", "His immature response surprised the team.", "他不成熟的回应让团队惊讶。"], ["naive", "天真的；缺乏世故的", "近义词", "naive 强调轻信或不懂世故；callow 更广泛指年轻新手的不成熟。", "It was naive to trust the anonymous message.", "相信匿名信息很天真。"]],
    M("声音联想（非词源）：callow 像‘壳儿’，刚出壳的小鸟没经验。", "可靠词源：Old English calu 原意 bald（秃的、无羽毛的）；由羽毛未丰的小鸟引申为年轻不成熟。", "熟词桥：fledgling 是刚学飞的新手；callow 也保留‘羽毛未丰’的成长画面。", "小鸟刚出壳就戴领带主持会议，却把报告叼去筑巢。", "尚未长羽 → 年轻、缺经验、判断不成熟。", "易混刹车：callow 不是 cowardly；它说经验不足，不必胆小。", "The callow bird chaired the meeting before learning how to fly.", "羽毛未丰的小鸟还没学会飞就主持会议。"),
    ["What original image helps explain callow?", "哪个原始图像帮助理解 callow？", "A young bird not yet fully feathered, hence an inexperienced young person.", "一只尚未羽翼丰满的小鸟，因此引申为缺乏经验的年轻人。"],
    ["The ________ intern made confident promises before reading the file.", "不成熟的实习生尚未读文件就自信承诺。", "A young and inexperienced person may be callow.", "年轻且缺乏经验的人可形容为 callow。"], ["seasoned", "mature", "veteran"]),

  vocab(294, "calumniate", "/kəˈlʌm.ni.eɪt/", "verb", "诽谤，造谣，中伤：false statements", "to damage someone's reputation by making knowingly false statements", "诽谤；造谣中伤",
    "造谣者用黑墨写假话，假话长成乌鸦追着无辜者叫。",
    [["calumniate a rival", "诽谤对手", "The pamphlet calumniated the candidate's rival.", "小册子诽谤了候选人的对手。"], ["publicly calumniate someone", "公开中伤某人", "He was sued for publicly calumniating the physician.", "他因公开中伤医生而被起诉。"], ["attempt to calumniate", "企图诽谤", "Forged letters were used to calumniate the reformers.", "伪造信件被用来诽谤改革者。"]],
    [["false statements", "虚假陈述", "原表注解 · 手段", "false statements 不一定针对名誉；calumniate 专指用明知虚假的话损害某人声誉。", "The report contained several false statements.", "报告包含数项虚假陈述。"], ["slander", "口头诽谤", "近义词", "slander 常特指口头诽谤的法律或一般用法；calumniate 更正式，不限定传播媒介。", "The actor sued the host for slander.", "演员起诉主持人口头诽谤。"], ["defame", "诽谤；损害名誉", "近义词", "defame 是常见正式上位词；calumniate 特别突出指控内容虚假且恶意。", "The article was intended to defame her.", "文章意在损害她的名誉。"]],
    M("声音联想（非词源）：calumniate 像‘开炉密捏’，在密室捏造谣言再放出去。", "可靠词源：Latin calumniari（诬告、恶意指控），来自 calumnia（虚假指控）。", "熟词桥：calumny 是名词‘诽谤’，calumniate 是实施这一动作。", "造谣者把黑墨捏成乌鸦，每只乌鸦都叼着一张假证词。", "恶意虚假指控 → 通过假话损害名誉。", "易混刹车：criticize 可以基于事实；calumniate 必须涉及虚假且伤害名誉的陈述。", "The liar calumniated the moon by claiming it had stolen every lamp.", "骗子诽谤月亮，说它偷走了所有灯。"),
    ["Which two elements are necessary for calumniate?", "calumniate 必须包含哪两个要素？", "False statements and an intention or effect of damaging reputation.", "虚假陈述，以及损害名誉的意图或效果。"],
    ["The forged diary was designed to ________ the innocent minister.", "伪造日记旨在诽谤无辜部长。", "Using fabricated claims to ruin reputation is to calumniate.", "用捏造指控毁坏名誉就是 calumniate。"], ["commend", "vindicate", "praise"]),

  vocab(295, "camaraderie", "/ˌkæm.əˈrɑː.dər.i/", "noun", "友情：friendly", "mutual trust and warm friendship among people who spend time together", "同志情谊；伙伴间的友情与信任",
    "队友围着篝火分享最后一块饼，连背包都互相碰肩。",
    [["a sense of camaraderie", "伙伴情谊感", "The expedition created a strong sense of camaraderie.", "这次探险形成了强烈的伙伴情谊。"], ["team camaraderie", "团队情谊", "Shared meals strengthened team camaraderie.", "共同用餐加强了团队情谊。"], ["build camaraderie", "建立友好情谊", "The workshop helped build camaraderie among new staff.", "工作坊帮助新员工建立友好情谊。"]],
    [["friendly", "友好的", "原表注解 · 基础性质", "friendly 可描述一次态度；camaraderie 是群体成员长期相处形成的互信与亲密。", "The receptionist was friendly and helpful.", "接待员友好且乐于助人。"], ["fellowship", "伙伴关系；共同体情谊", "近义词", "fellowship 可基于共同信念或身份；camaraderie 常来自共同经历、工作和并肩行动。", "The retreat fostered fellowship among students.", "静修活动促进了学生间的伙伴关系。"], ["rapport", "融洽关系", "近义词", "rapport 可存在于两个人间且形成迅速；camaraderie 多指群体伙伴的友谊。", "The doctor established rapport with the patient.", "医生与患者建立了融洽关系。"]],
    M("声音联想（非词源）：camaraderie 像‘扛吗？来搭你’，伙伴主动搭把手一起扛。", "可靠词源：French camaraderie 来自 camarade（伙伴、战友），最终关联表示房间同伴的拉丁语形式。", "熟词桥：comrade 与 camaraderie 都指并肩伙伴形成的关系。", "队友把最后一块饼切成十份，背包们也围着篝火握手。", "同住、并肩的伙伴 → 共同经历产生的温暖信任。", "易混刹车：camaraderie 通常不可数；它不是单个 friend，而是群体间的关系氛围。", "Camaraderie persuaded ten hikers to share one heroic biscuit.", "伙伴情谊让十名徒步者分享一块英勇饼干。"),
    ["What normally creates camaraderie?", "camaraderie 通常由什么形成？", "Shared experience, cooperation, and mutual trust among companions.", "伙伴之间的共同经历、合作和互信。"],
    ["Months at sea created deep ________ among the crew.", "数月海上生活让船员形成深厚情谊。", "Warm trust among companions is camaraderie.", "伙伴间温暖的信任关系就是 camaraderie。"], ["hostility", "isolation", "rivalry"]),

  vocab(296, "cameo", "/ˈkæm.i.əʊ/", "noun", "栩栩如生的描绘，简洁生动的描述或刻画：brief, vivid portrayal; 客串：brief but dramatic appearance", "a brief vivid portrayal or a short, striking appearance by a notable performer", "简洁生动的刻画；客串亮相",
    "一枚小浮雕从电影幕布里探头三秒，却抢走全场掌声。",
    [["a cameo appearance", "客串亮相", "The director made a cameo appearance as a waiter.", "导演客串出演一名服务员。"], ["a brief cameo", "短暂客串", "Her brief cameo became the film's funniest scene.", "她的短暂客串成为影片最有趣的一幕。"], ["a vivid cameo of village life", "对乡村生活的生动小品式刻画", "The essay offers a vivid cameo of village life.", "文章对乡村生活作了生动简洁的刻画。"]],
    [["brief, vivid portrayal", "简洁生动的刻画", "原表注解 · 描写", "该短语强调篇幅小而鲜明；cameo 像微型浮雕，只截取一个清晰人物或场景。", "The chapter contains a brief, vivid portrayal of the judge.", "本章对法官作了简洁生动的刻画。"], ["brief but dramatic appearance", "短暂但醒目的露面", "原表注解 · 客串", "cameo appearance 通常由知名人物短暂出演，戏份少但容易被注意。", "The singer made a brief but dramatic appearance.", "歌手作了短暂却醒目的露面。"], ["vignette", "小品文；短场景", "近义词", "vignette 是简短描写或场景；cameo 更容易聚焦某个人物或名人客串。", "The memoir opens with a childhood vignette.", "回忆录以童年小片段开篇。"]],
    M("声音联想（非词源）：cameo 像‘come 一秒’，名人来一小会儿就退场。", "可靠词源：来自 Italian cammeo，原指有浮雕图案的宝石；词源更深处不确定。小而鲜明的浮雕引出简短刻画和客串。", "熟词桥：Stan Lee cameo 是熟悉的电影客串概念：短暂但醒目。", "宝石浮雕从银幕探头三秒，鞠一躬后带走全部掌声。", "小型鲜明浮雕 → 简短生动刻画 → 知名人物短暂出演。", "易混刹车：cameo 不是主要角色；若戏份贯穿全片，就不再是 cameo。", "The cameo lasted three seconds and demanded a forty-minute applause.", "这次客串持续三秒，却要求四十分钟掌声。"),
    ["What two qualities define a cameo appearance?", "cameo appearance 由哪两个特点定义？", "It is brief yet noticeable or memorable, often involving a known person.", "它短暂却醒目难忘，常由知名人物出演。"],
    ["The novelist makes a witty ________ in the film adaptation.", "小说家在电影改编中作了一次机智客串。", "A short, striking appearance is a cameo.", "短暂而醒目的露面是 cameo。"], ["lead", "monologue", "finale"]),

  vocab(297, "camouflage", "/ˈkæm.ə.flɑːʒ/", "noun · verb", "伪装，伪装手段：deceive, hide", "a disguise that conceals; to hide identity or true nature by deception", "伪装；掩饰；隐蔽手段",
    "变色龙穿上森林花纹外套，把写着秘密的箱子藏在自己背后。",
    [["wear camouflage", "穿迷彩服", "The scouts wore camouflage in the forest.", "侦察员在森林里穿着迷彩服。"], ["camouflage an intention", "掩饰意图", "Polite language camouflaged the threat.", "礼貌措辞掩饰了威胁。"], ["natural camouflage", "天然保护色", "The insect's natural camouflage hides it among leaves.", "昆虫的天然保护色使它隐于叶间。"]],
    [["deceive", "欺骗", "原表注解 · 手段", "deceive 让人相信错误信息；camouflage 主要通过改变外观或表面来隐藏真相。", "The forged seal deceived the inspector.", "伪造印章欺骗了检查员。"], ["hide", "隐藏", "原表注解 · 结果", "hide 是宽泛遮住；camouflage 让对象与背景融合或用表象掩盖本质。", "She hid the key under a stone.", "她把钥匙藏在石头下。"], ["disguise", "伪装；乔装", "近义词", "disguise 常改变身份外观；camouflage 更强调避免被发现，可用于物体、意图和缺陷。", "The actor disguised himself as a guard.", "演员乔装成守卫。"], ["conceal", "隐瞒；遮蔽", "近义词", "conceal 是正式的隐藏；camouflage 还交代了欺骗性的掩护方式。", "The cabinet concealed a narrow door.", "柜子遮住了一扇窄门。"]],
    M("声音联想（非词源）：camouflage 像‘看不见服’，穿上就融进背景。", "可靠词源：French camouflage 来自 camoufler（伪装、乔装）；更深来源可能与意大利方言有关，但并不确定。", "熟词桥：迷彩服最直观；把颜色融入背景延伸到 words camouflage motives。", "变色龙穿迷彩站在镜子前，连镜子都问它去哪儿了。", "视觉上融入背景 → 隐藏身份、意图或缺陷。", "易混刹车：camouflage 不保证完全 invisible；它是降低被发现概率的伪装。", "The chameleon wore camouflage and vanished from its own portrait.", "变色龙穿上伪装，从自己的画像里消失了。"),
    ["How does camouflage differ from simply placing something out of sight?", "camouflage 与单纯把东西放到看不见处有何不同？", "It conceals by blending with surroundings or presenting a misleading appearance.", "它通过融入环境或制造误导外观来隐藏。"],
    ["The generous wording could not ________ the contract's harsh penalty.", "慷慨措辞无法掩饰合同的严厉惩罚。", "Camouflage can mean disguise the true nature of something.", "camouflage 可表示掩饰事物真实本质。"], ["reveal", "display", "expose"]),

  vocab(298, "canard", "/kəˈnɑːd/", "noun", "谣传，误传：misleading ", "a false, fabricated, or misleading report circulated as fact", "谣言；误传；虚假报道",
    "一只鸭子拿着扩音器广播‘月亮是奶酪’，整座城立刻排队买饼干。",
    [["a baseless canard", "毫无根据的谣言", "The article repeated a baseless canard about the vaccine.", "文章重复了关于疫苗的无根据谣言。"], ["spread a canard", "散布谣言", "Anonymous accounts spread a canard about the mayor.", "匿名账号散布关于市长的谣言。"], ["debunk a canard", "揭穿谣言", "Researchers quickly debunked the old canard.", "研究人员迅速揭穿了这个陈年谣言。"]],
    [["misleading", "误导性的", "原表注解 · 性质", "misleading 可形容任何造成误解的信息；canard 是被当成事实传播的具体虚假说法。", "The graph is technically accurate but misleading.", "图表技术上准确，却具有误导性。"], ["rumor", "传闻", "近义词", "rumor 可能真也可能假；canard 通常明确是虚构、荒谬或恶意的假消息。", "A rumor about the merger reached staff.", "关于合并的传闻传到员工耳中。"], ["fabrication", "捏造；虚构品", "近义词", "fabrication 强调制造假内容；canard 强调这个假说法被公开传播。", "The confession was a complete fabrication.", "这份供词完全是捏造。"]],
    M("声音联想（非词源）：canard 像‘看那鸭’，鸭子拿扩音器传播假消息。", "可靠词源：French canard 字面是 duck；为何发展出‘假新闻’义有多种故事，具体路径不确定，不应把某个传说当定论。", "熟词桥：法语 duck + 新闻谣言的历史联想，记住 canard 是一只会散播假消息的鸭。", "鸭子宣布月亮是奶酪，市民带着饼干排队登月。", "无根据的新闻说法 → 被当作事实传播的虚假报道。", "易混刹车：rumor 未必已证伪；canard 通常由说话者判定为假。", "The canard claimed that the moon was cheese and sold ten thousand crackers.", "谣言声称月亮是奶酪，因此卖出一万块饼干。"),
    ["What truth status does canard normally imply?", "canard 通常暗示怎样的真实性？", "The report is false or fabricated, not merely unconfirmed.", "该说法是虚假或捏造的，而不只是未经证实。"],
    ["Fact-checkers traced the political ________ to a fabricated letter.", "事实核查者追踪到这则政治谣言源自伪造信件。", "A fabricated report circulated as fact is a canard.", "被当作事实传播的虚假报道是 canard。"], ["evidence", "disclosure", "confirmation"]),

  vocab(299, "candor", "/ˈkæn.dər/", "noun", "坦率，直率，诚挚：honest, sincere", "honest, open, and straightforward expression", "坦率；直言；诚挚",
    "透明心脏站在麦克风前，不绕弯地说出真话。",
    [["speak with candor", "坦率地说", "She spoke with candor about the project's failures.", "她坦率谈论项目失败。"], ["appreciate someone's candor", "欣赏某人的坦率", "I appreciate your candor about the risks.", "我欣赏你对风险的坦率。"], ["refreshing candor", "令人耳目一新的坦诚", "His refreshing candor changed the tone of the meeting.", "他令人耳目一新的坦诚改变了会议气氛。"]],
    [["honest", "诚实的", "原表注解 · 真实性", "honest 表示不欺骗；candor 更具体指愿意公开、直接说出真实看法。", "She gave an honest account of the accident.", "她如实讲述事故。"], ["sincere", "真诚的", "原表注解 · 态度", "sincere 强调感情不虚假；candor 强调表达不遮掩、不绕弯。", "His apology sounded sincere.", "他的道歉听起来真诚。"], ["frankness", "坦率", "近义词", "frankness 几乎同义；candor 更正式，常用于重事实、可讨论缺点的开放态度。", "Her frankness surprised the interviewers.", "她的坦率令面试官惊讶。"], ["candid", "坦率的", "词族", "candid 是形容词；candor 是名词。a candid answer shows candor。", "He gave a candid answer.", "他给出了坦率回答。"]],
    M("声音联想（非词源）：candor 像‘看得透’，坦率让人看透真实想法。", "可靠词源：Latin candor 原指 whiteness, brightness，来自 candēre（发白、发亮）；由清澈明亮发展为纯真坦率。", "熟词桥：candid camera 原义联想自然不做作；candid 与 candor 是形容词和名词关系。", "透明心脏拿着扩音器说真话，所有弯弯绕绕的句子都被熨直。", "明亮清澈 → 没有遮掩 → 诚实直接表达。", "易混刹车：candor 不等于 rudeness；坦率仍可有礼貌和分寸。", "Her candor straightened every crooked sentence in the room.", "她的坦率把房间里每句绕弯的话都拉直了。"),
    ["How can candor coexist with tact?", "candor 如何与 tact 并存？", "One can state the truth openly while choosing respectful words and timing.", "人可以公开说真话，同时选择尊重的措辞和时机。"],
    ["The auditors praised the director's ________ about the accounting error.", "审计人员赞扬主管对会计错误的坦率。", "Open, honest disclosure shows candor.", "公开诚实披露体现 candor。"], ["evasion", "deceit", "secrecy"]),

  vocab(300, "canon", "/ˈkæn.ən/", "noun", " 准则，标准：standard, criterion; 真经，正典：authentic", "an authoritative rule or standard; an accepted body of authentic works", "准则；规范；正典；公认作品全集",
    "图书馆法官用金尺挑选真经，合格的书进入发光书架。",
    [["the literary canon", "文学经典体系", "The course questions the boundaries of the literary canon.", "这门课质疑文学经典体系的边界。"], ["a canon of conduct", "行为准则", "The profession follows a strict canon of conduct.", "该行业遵循严格行为准则。"], ["part of the official canon", "官方正典的一部分", "The later story is not part of the official canon.", "后来的故事不属于官方正典。"]],
    [["standard", "标准", "原表注解 · 规范", "standard 是任何衡量尺度；canon 常是被权威或传统接受的一整套原则。", "The product meets the safety standard.", "产品符合安全标准。"], ["criterion", "判准；标准", "原表注解 · 判断", "criterion 是一项判断条件；canon 可由多条准则组成，也可指公认作品集合。", "Cost is only one criterion for selection.", "成本只是选择的一项标准。"], ["authentic", "真实权威的；真本的", "原表注解 · 正典", "authentic 描写作品真伪；canon 是被认定为真实且有权威的一组文本。", "Experts confirmed that the letter was authentic.", "专家确认该信为真迹。"], ["doctrine", "教义；学说", "近义词", "doctrine 是一套信念教导；canon 更侧重权威规则或正式承认的作品范围。", "The movement rejected the old doctrine.", "该运动拒绝旧教义。"]],
    M("声音联想（非词源）：canon 像‘看准’，权威看准哪些标准和文本可以进入正典。", "可靠词源：Greek kanōn（直杆、量尺、规则）经 Latin canon 进入英语；从丈量标准发展为权威规则和正典目录。", "熟词桥：canonical 在数学和计算机中表示规范形式；fiction canon 指官方承认的故事世界。", "图书馆法官拿金色量尺审书，合格文本获得光环进入正典书架。", "量尺 → 判断规则 → 权威认可的原则或文本集合。", "易混刹车：canon 一 n 中间加一个 n 是准则/正典；cannon 双 n 是大炮。", "The canon admitted one book after measuring every sentence with a golden ruler.", "正典用金尺量过每句话后才接纳一本书。"),
    ["What authority is built into the idea of a canon?", "canon 的概念内含哪种权威性？", "A community, institution, or tradition accepts its rules or works as normative and authentic.", "某个共同体、机构或传统把其规则或作品认定为规范且权威真实。"],
    ["Scholars debated whether the newly found poem belongs in the ________.", "学者争论新发现的诗是否应进入正典。", "An accepted body of authoritative works is a canon.", "公认的权威作品集合是 canon。"], ["cannon", "rumor", "footnote"]),
];

const registerByWord = new Map([
  ["cacophony", "GRE 高频 · 正式 / 文学"], ["cadge", "GRE 词汇 · 非正式 / 英式"], ["cajole", "GRE 高频 · 正式常用"],
  ["calcify", "GRE 词汇 · 医学 / 正式比喻"], ["calibrate", "GRE 高频 · 技术 / 正式"], ["calligraphy", "GRE 词汇 · 艺术"],
  ["callous", "GRE 高频 · 正式贬义"], ["callow", "GRE 高频 · 书面贬义"], ["calumniate", "GRE 词汇 · 高度正式"],
  ["camaraderie", "GRE 高频 · 常用 / 群体关系"], ["cameo", "GRE 词汇 · 艺术 / 常用"], ["camouflage", "GRE 高频 · 常用 / 比喻"],
  ["canard", "GRE 高频 · 正式 / 新闻政治"], ["candor", "GRE 高频 · 正式褒义"], ["canon", "GRE 高频 · 学术 / 宗教 / 文学"],
]);

const ipa = new Map([
  ["inharmonious sound", "/ˌɪn.hɑːˈməʊ.ni.əs ˈsaʊnd/"], ["discord", "/ˈdɪs.kɔːd/"], ["din", "/dɪn/"],
  ["beg", "/beɡ/"], ["scrounge", "/skraʊndʒ/"], ["borrow", "/ˈbɒr.əʊ/"],
  ["wheedle", "/ˈwiː.dəl/"], ["coax", "/kəʊks/"], ["flatter", "/ˈflæt.ər/"],
  ["inflexible", "/ɪnˈflek.sə.bəl/"], ["unchangeable", "/ʌnˈtʃeɪn.dʒə.bəl/"], ["ossify", "/ˈɒs.ɪ.faɪ/"],
  ["standardize", "/ˈstæn.də.daɪz/"], ["measure precisely", "/ˌmeʒ.ər prɪˈsaɪs.li/"], ["adjust", "/əˈdʒʌst/"],
  ["elegant handwriting", "/ˌel.ɪ.ɡənt ˈhændˌraɪ.tɪŋ/"], ["penmanship", "/ˈpen.mən.ʃɪp/"], ["typography", "/taɪˈpɒɡ.rə.fi/"],
  ["unfeeling", "/ʌnˈfiː.lɪŋ/"], ["insensitive", "/ɪnˈsen.sɪ.tɪv/"], ["indifferent", "/ɪnˈdɪf.ər.ənt/"],
  ["lacking", "/ˈlæk.ɪŋ/"], ["experience", "/ɪkˈspɪə.ri.əns/"], ["immature", "/ˌɪm.əˈtʃʊər/"], ["naive", "/naɪˈiːv/"],
  ["false statements", "/ˌfɔːls ˈsteɪt.mənts/"], ["slander", "/ˈslɑːn.dər/"], ["defame", "/dɪˈfeɪm/"],
  ["friendly", "/ˈfrend.li/"], ["fellowship", "/ˈfel.əʊ.ʃɪp/"], ["rapport", "/ræˈpɔːr/"],
  ["brief, vivid portrayal", "/ˌbriːf ˌvɪv.ɪd pɔːˈtreɪ.əl/"], ["brief but dramatic appearance", "/ˌbriːf bət drəˌmæt.ɪk əˈpɪə.rəns/"], ["vignette", "/vɪnˈjet/"],
  ["deceive", "/dɪˈsiːv/"], ["hide", "/haɪd/"], ["disguise", "/dɪsˈɡaɪz/"], ["conceal", "/kənˈsiːl/"],
  ["misleading", "/ˌmɪsˈliː.dɪŋ/"], ["rumor", "/ˈruː.mər/"], ["fabrication", "/ˌfæb.rɪˈkeɪ.ʃən/"],
  ["honest", "/ˈɒn.ɪst/"], ["sincere", "/sɪnˈsɪər/"], ["frankness", "/ˈfræŋk.nəs/"], ["candid", "/ˈkæn.dɪd/"],
  ["standard", "/ˈstæn.dəd/"], ["criterion", "/kraɪˈtɪə.ri.ən/"], ["authentic", "/ɔːˈθen.tɪk/"], ["doctrine", "/ˈdɒk.trɪn/"],
]);

for (const config of all) {
  config.register = registerByWord.get(config.word);
  for (const item of config.comparisons) item[6] = ipa.get(item[0]);
}

const group = (start) => all.slice(start - 286, start - 281);

export const set58 = compactSet(58, "The Moon Tuner", group(286), {
  title: "The Moon Tuner",
  targetForms: ["cacophony", "cadge", "cajole", "calcify", "calibrate"],
  plain: "A cacophony tried to cadge a bell, cajole a clock, calcify a song, and calibrate the moon.",
  translation: "一团刺耳杂音试图讨来一口钟、哄动一座钟表、把一首歌僵化，并校准月亮。",
});

export const set59 = compactSet(59, "The Ink Trial", group(291), {
  title: "The Ink Trial",
  targetForms: ["callow", "calligraphy", "calumniate", "callous", "camaraderie"],
  plain: "A callow scribe used calligraphy to calumniate a callous king, but camaraderie erased the ink.",
  translation: "一名不成熟的抄写员用书法诽谤一位冷酷国王，但伙伴情谊擦除了墨迹。",
});

export const set60 = compactSet(60, "The Honest Guest", group(296), {
  title: "The Honest Guest",
  targetForms: ["cameo", "camouflage", "canard", "candor", "canon"],
  plain: "A cameo wore camouflage, confessed a canard with candor, and entered the canon.",
  translation: "一个客串角色穿着伪装，坦率承认一则谣言，随后进入正典。",
});
