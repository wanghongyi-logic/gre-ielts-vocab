import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(181, "awkward", "/ˈɔːk.wɚd/", "adjective", "缺乏灵活性和技巧的：lacking dexterity; （处理问题）缺乏手段和智谋的：a lack of skill and tact; 臃肿笨拙的，不优雅的：lacking ease; 令人尴尬的：embarrassment; （因过大或过重设计问题）难以操作的：difficult to use",
    "lacking physical dexterity, social tact, graceful ease, or practical usability", "笨拙的；不圆熟的；令人尴尬的；难操作的",
    "一只长颈鹿戴着厚手套搬巨型茶壶：动作不灵、场面尴尬，茶壶本身也难以操作。",
    [["an awkward movement", "笨拙的动作", "One awkward movement knocked three cups off the tray.", "一个笨拙动作把三个杯子碰下托盘。"], ["an awkward silence", "令人尴尬的沉默", "An awkward silence followed his accidental proposal to the lamp.", "他意外向台灯求婚后，现场陷入尴尬沉默。"], ["an awkward question", "棘手而尴尬的问题", "The reporter asked an awkward question about the missing budget.", "记者就失踪的预算问了一个棘手而尴尬的问题。"], ["awkward to handle", "难以操作", "The oversized package was awkward to handle on the stairs.", "这个超大包裹在楼梯上很难搬动。"]],
    [["lacking dexterity", "缺乏灵活性和技巧", "原表注解 · 动作义", "dexterity 是手脚的灵巧；awkward 表示动作缺少这种灵巧，但还可延伸到社交或器物设计。", "The heavy gloves left the surgeon lacking dexterity.", "厚手套使外科医生的手指不够灵活。"], ["a lack of skill and tact", "缺乏手段、技巧与圆融", "原表注解 · 处事义", "这里的 awkward 不是手脚笨，而是处理敏感问题时既无技巧又欠圆融。", "His public accusation showed a lack of skill and tact.", "他的公开指责显示出处理问题时既无技巧又欠圆融。"], ["lacking ease", "不自然；不优雅", "原表注解 · 姿态义", "ease 强调自然流畅；awkward 可描述姿态、措辞或设计显得生硬臃肿。", "The actor's first bow was stiff and lacking ease.", "演员第一次鞠躬僵硬而不自然。"], ["embarrassment", "尴尬；窘迫", "原表注解 · 社交效果", "embarrassment 是产生的窘迫感；awkward 可形容引发这种感觉的沉默、问题或场面。", "The mistaken name caused visible embarrassment.", "叫错名字造成了明显的尴尬。"], ["difficult to use", "难以使用或操作", "原表注解 · 设计义", "器物 awkward 时往往因尺寸、重量或结构而不好操控，不等于已经损坏。", "The old control panel was difficult to use with gloves.", "戴手套时，旧控制面板很难操作。"], ["clumsy", "笨拙的", "近义词", "clumsy 主要突出动作或构造笨拙；awkward 的范围更广，还能表示社交尴尬、问题棘手。", "The clumsy waiter dropped a spoon but recovered gracefully.", "笨手笨脚的服务员掉了一把勺子，但从容补救。"]],
    M("声音联想：awkward 像“哦，磕着了”。长颈鹿一转身就磕到门框，动作和场面都很尴尬；这只是中文近音记忆桥，绝不是真实词源。", "较可靠的词源线索：中古英语 awk 表示“方向不对、倒着”，再加 -ward；核心画面是朝错误方向、不顺手。不要把它拆成 awake 或其他现代熟词。", "熟词桥：awkward silence、awkward question、awkward to handle 分别锁定社交、处事和操作三个高频区域。", "戴烤箱手套的长颈鹿举着比门还宽的茶壶，既碰倒杯子，又问错问题，最后所有人沉默。", "方向不顺、动作不顺 → 姿态不自然 → 社交不圆融 → 器物不好用，语义都落在“不顺手、不顺场”。", "不要把 awkward 只译成 clumsy。awkward silence 是尴尬沉默，awkward issue 可指棘手问题，awkward object 才常是难操作。", "An awkward giraffe carried an awkwardly large teapot into an awkward silence.", "一只笨拙长颈鹿把大得难搬的茶壶带进一场尴尬沉默。"),
    ["What four kinds of difficulty can awkward describe?", "awkward 可以描述哪四类“不顺”？", "Physical clumsiness, lack of tact, social embarrassment, and difficult design or handling.", "动作笨拙、处事欠圆融、社交尴尬，以及设计或操作不便。"],
    ["The machine works, but its oversized controls are ________ to handle.", "机器能运行，但过大的控制器很难操作。", "Awkward to handle describes something usable but physically inconvenient.", "awkward to handle 表示东西能用，却因构造或尺寸而操作不便。"], ["graceful", "tactful", "convenient"]),

  vocab(182, "awning", "/ˈɔː.nɪŋ/", "countable noun", "雨篷，遮阳篷：shelter",
    "a fixed or retractable rooflike cover that shelters a window, door, or outdoor area from sun or rain", "雨篷；遮阳篷",
    "商店窗外伸出一块会开合的小屋顶，把暴雨和烈日都挡在顾客头顶之外。",
    [["a retractable awning", "可伸缩遮阳篷", "We pulled out the retractable awning before lunch on the terrace.", "我们在露台午餐前拉开了可伸缩遮阳篷。"], ["a canvas awning", "帆布雨篷", "A striped canvas awning shaded the bakery window.", "条纹帆布遮阳篷为面包店橱窗挡住阳光。"], ["sit under the awning", "坐在篷下", "The musicians kept playing under the awning during the rain.", "下雨时，乐手们继续在雨篷下演奏。"]],
    [["shelter", "遮蔽；庇护", "原表注解 · 功能关系", "shelter 是泛称或功能；awning 是固定在建筑外侧、向外伸出的篷状实物，用来提供这种遮蔽。", "The doorway offered shelter from the sudden hail.", "门洞为人们挡住了突来的冰雹。"], ["canopy", "顶篷；华盖", "近义词", "canopy 可独立架设、悬在床或树冠般覆盖上方；awning 通常连接建筑的窗、门或墙面并向外伸。", "A white canopy covered the outdoor stage.", "白色顶篷罩住了露天舞台。"], ["eaves", "屋檐", "易混词", "eaves 是屋顶结构本身伸出的边缘；awning 是另加的布、金属等篷体，常可收起。", "Rainwater dripped from the eaves.", "雨水从屋檐滴下。"]],
    M("声音联想：awning 可借音记成“奥宁的篷”。奥宁一按按钮，窗外遮阳篷立刻伸出；这只是人造近音画面，不是词源。", "词源审慎说明：awning 的更深来源存在争议，权威词典常标为 origin uncertain。不能把它硬拆成 awn + -ing，也不能从 awe 推导；可靠做法是直接记它的实物图像。", "英文熟词桥：an awning is a small rooflike shelter attached above a window, door, or patio。抓住 attached shelter，不把它泛化成任何屋顶。", "面包店窗上方的小屋顶突然像舌头一样伸出，替三只正在喝茶的企鹅同时挡雨和遮阳。", "它首先是一个 attached cover，产生 shelter from sun or rain；从形状到功能一步落义。", "awning 通常连着建筑；canopy 覆盖范围更泛，eaves 则属于屋顶结构。三者都能遮蔽，但构造关系不同。", "The awning sheltered three penguins from rain while the sun complained outside.", "遮阳雨篷替三只企鹅挡雨，太阳只能在外面抱怨。"),
    ["How does an awning differ from a general shelter?", "awning 与泛指的 shelter 有何不同？", "It is a rooflike cover usually attached above a window, door, storefront, or patio.", "它通常是连接在窗、门、店面或露台上方的篷状覆盖物。"],
    ["The café extended its striped ________ to shade the pavement tables.", "咖啡馆展开条纹遮阳篷，为人行道上的桌子遮阴。", "An awning projects from a building to provide sun or rain shelter.", "awning 从建筑外侧伸出，用来遮阳挡雨。"], ["exposure", "foundation", "corridor"]),

  vocab(183, "awry", "/əˈraɪ/", "adjective · adverb", "弯曲的，扭曲的：turned, twisted; 走样的（地），出差错的（地）：off, course",
    "turned or twisted away from a straight position, or departing from the intended course", "歪斜的；扭曲的；偏离计划的；出差错地",
    "一根歪掉的铁路扳手把生日蛋糕列车导向市政厅，计划和轨道一起偏离正途。",
    [["go awry", "出差错；偏离计划", "The experiment went awry when the thermometer began giving advice.", "温度计开始提建议后，实验出了差错。"], ["plans go awry", "计划落空或走样", "Our picnic plans went awry when the lake moved uphill.", "湖水向山上移动后，我们的野餐计划落空了。"], ["hang awry", "歪斜地挂着", "The portrait hung awry after the wall sneezed.", "墙打了个喷嚏后，肖像画挂歪了。"]],
    [["turned / twisted", "弯曲的；扭转的", "原表注解 · 物理义", "turned 或 twisted 描写位置偏斜；awry 常作表语或副词，突出没有处在应有的直线或角度。", "The metal frame was turned and twisted by the impact.", "金属框架被撞得弯曲扭转。"], ["off course", "偏离路线或预定进程", "原表注解 · 引申义（原文 off, course）", "off course 可指航线偏离；go awry 把同一空间图像扩展到计划、程序或事件出错。", "A faulty signal sent the ship off course.", "错误信号使船偏离航线。"], ["askew", "歪斜的；不正的", "近义词", "askew 与 awry 都可形容物体歪斜；awry 更常通过 go awry 表示事情没有按计划进行。", "His hat sat askew over one eye.", "他的帽子歪戴着，遮住一只眼。"], ["amiss", "不对劲；有毛病", "易混近义词", "amiss 表示某处有问题，却不强调偏离路线；awry 保留“走偏、扭歪”的动态图像。", "The detective sensed that something was amiss.", "侦探感觉有些不对劲。"]],
    M("声音联想：awry 几乎像“哦，歪”。看见画挂歪、计划走歪，就喊“哦，歪了！”这是中文近音桥，不是英语词源。", "可靠构词线索：中古英语 awry 可理解为 a-（处于……状态）+ wry（扭曲、歪斜）；现代 wry 仍见于 a wry smile。", "英文熟词桥：wry = twisted；a picture can hang awry, and a plan can go awry。先物理歪，再抽象走偏。", "轨道扳手歪成香蕉，蛋糕列车因此偏离路线，闯进市政厅给打印机过生日。", "turned/twisted 是空间落点；off course 是事件落点。两者共同核心都是离开应有方向。", "高频结构是 go awry。wry 常形容苦涩、讽刺的表情或幽默，不能在所有语境中替换 awry。", "When the railway switch went awry, the cake train delivered dessert to a volcano.", "铁路扳手出错后，蛋糕列车把甜点送给了一座火山。"),
    ["What single image unites a crooked picture and a failed plan?", "什么共同图像连接挂歪的画与失败的计划？", "Both have moved away from the straight or intended course: they are awry.", "二者都偏离了笔直位置或预定进程，也就是 awry。"],
    ["The launch schedule went ________ after the moon misplaced Tuesday.", "月亮弄丢星期二后，发射计划出了差错。", "Go awry means depart from the intended course or plan.", "go awry 表示偏离预定进程或计划。"], ["straight", "scheduled", "stable"]),

  vocab(184, "axiomatic", "/ˌæk.si.əˈmæt.ɪk/", "adjective", "公理的：axiom; 不言自明的：self-evident",
    "accepted as an axiom or regarded as self-evidently true", "公理的；不言自明的",
    "教授在黑板上写下“会唱歌的三角形必戴帽子”，全班竟把它当作无需证明的公理。",
    [["an axiomatic truth", "不言自明的真理", "The equality of identical quantities is treated as an axiomatic truth.", "相同量彼此相等被视为不言自明的真理。"], ["an axiomatic principle", "公理性原则", "The proof begins from one axiomatic principle.", "该证明从一条公理性原则开始。"], ["it is axiomatic that", "……是不言自明的", "It is axiomatic that a promise cannot be kept before it is made.", "承诺不可能在作出之前兑现，这是不言自明的。"]],
    [["axiom", "公理；基本命题", "原表注解 · 名词基础", "axiom 是无需在当前体系内证明而接受的基本命题；axiomatic 是形容词，表示属于公理或像公理一样显然。", "The geometry course begins with five axioms.", "几何课程从五条公理开始。"], ["self-evident", "不言自明的", "原表注解 · 核心近义", "self-evident 强调其真理性看起来无需证明；axiomatic 还可表示某命题在一套形式体系中被当作基础前提。", "The contradiction was self-evident to every reader.", "每位读者都看得出这个矛盾。"], ["obvious", "明显的", "近义词", "obvious 是日常的“很明显”；axiomatic 更正式，语气更强，常涉及原则、推理或公认前提。", "The answer became obvious after the hint.", "提示之后，答案变得很明显。"], ["theorem", "定理", "易混词", "axiom 作为出发点被接受；theorem 通常必须由公理、定义和既有结果推导证明。", "The students proved the theorem from earlier results.", "学生依据先前结果证明了该定理。"]],
    M("声音联想：axiomatic 可想成“阿西说：这题自动成立”。阿西拒绝证明，只把它当公理；这是人为声音画面，不是真实词源。", "可靠词源：axiomatic 来自 axiom；axiom 经拉丁语追溯到希腊语 axiōma，指被认为有价值、可接受的命题，与希腊语 axios“值得的”相关。", "英文熟词桥：axiom + -atic → axiomatic。先认出数学里的 axiom，再把词义扩展到 self-evident principle。", "黑板上的三角形戴着王冠宣布自己会唱歌，教授敲钟说“这是公理”，全班连证明都不敢要。", "在形式体系中被接受为基础 axiom → 在普通论述中被视为 self-evident，核心都是“不再要求当前证明”。", "别和 automatic 混音。axiomatic 也不等于 theorem：公理是起点，定理通常是从起点证明出的结果。", "It was axiomatic in the kingdom that every triangle deserved a singing lesson.", "王国把每个三角形都应上声乐课视为不言自明。"),
    ["How does an axiom differ from a theorem?", "axiom 与 theorem 有何区别？", "An axiom is accepted as a starting point; a theorem is normally proved from such starting points.", "公理作为起点被接受；定理通常由这些起点推导证明。"],
    ["For the logician, it was ________ that a statement and its negation could not both hold in the same sense.", "对逻辑学家而言，一个命题与其否定不可能在同一意义上同时成立，这是不言自明的。", "Axiomatic describes a foundational or self-evident proposition.", "axiomatic 形容基础性或不言自明的命题。"], ["hypothesis", "exception", "measurement"]),

  vocab(185, "babble", "/ˈbæb.əl/", "verb · noun", "发出含糊无意义的嘟囔声，胡乱说：utter, meaningless; 闲聊：rambling conversation",
    "to utter rapid, confused, or meaningless speech; rambling and often trivial talk", "含糊而无意义地胡乱说；喋喋闲聊；胡言乱语",
    "一只婴儿河马对十二台麦克风不停说“ba-ba-ba”，话题从月亮绕到汤匙却从不落地。",
    [["babble incoherently", "语无伦次地胡说", "The witness began to babble incoherently about invisible bicycles.", "证人开始语无伦次地谈论隐形自行车。"], ["babble about trivialities", "喋喋不休地聊琐事", "They babbled about trivialities until the candles fell asleep.", "他们喋喋聊着琐事，直到蜡烛睡着。"], ["a stream of babble", "一连串含糊废话", "A stream of babble poured from the nervous announcer.", "紧张的播音员嘴里涌出一连串含糊废话。"]],
    [["utter / meaningless", "发出含糊或无意义的话语", "原表注解 · 言语动作", "utter 只是“发出、说出”；babble 特别说明说出的内容快速、混乱、幼稚或难以理解。", "The child uttered a meaningless string of syllables.", "孩子发出一串没有意义的音节。"], ["rambling conversation", "漫无边际的闲聊", "原表注解 · 名词义", "rambling conversation 缺少清晰路线；babble 往往再带语速快、内容琐碎或让人难以跟上的感觉。", "Their rambling conversation wandered from taxes to purple clouds.", "他们漫无边际的谈话从税收绕到紫色云朵。"], ["mumble", "含糊低声说", "易混词", "mumble 重点是声音太低、咬字不清；babble 重点是内容混乱、无意义或说个不停，音量未必低。", "He mumbled an apology into his scarf.", "他对着围巾含糊低声道歉。"], ["prattle", "天真或琐碎地喋喋说", "近义词", "prattle 常是轻快而琐碎的闲谈；babble 可更混乱、更难懂，也可形容婴儿或流水声。", "The guests prattled cheerfully about hats.", "客人们兴高采烈地闲扯帽子。"]],
    M("声音联想：babble 像“叭叭叭不停”。想象嘴巴像坏喇叭连续发声；这是中文拟声记忆，不等于严格词源分析。", "词源审慎说明：babble 通常被认为属于拟声、重叠音节形成的词，模仿婴儿或含混说话声；更深层的唯一来源无法可靠确定，不应硬配古典词根。", "英文熟词桥：baby babble 与 blah-blah 都提示“声音很多、信息很少”；babbling brook 则把相似连续声转用于溪流。", "婴儿河马对十二台扩音器从早餐讲到火星，所有句子都绕圈，最后连扩音器也开始打哈欠。", "连续含混声音 → 无意义言语 → 漫无边际闲聊；声音和内容都缺少清晰结构。", "babble 不等于 mumble：mumble 是低声含糊，babble 是胡乱或不停地说。常用 babble about/on，而非把它当正式演讲词。", "The nervous oracle began to babble, so the statues asked for subtitles.", "紧张的神谕者开始胡言乱语，雕像们只好要求字幕。"),
    ["What distinction separates babble from mumble?", "babble 与 mumble 的关键区别是什么？", "Babble concerns confused, meaningless, or excessive content; mumble concerns low, unclear delivery.", "babble 侧重内容混乱、无意义或过多；mumble 侧重声音低且吐字不清。"],
    ["Asked one simple question, the witness began to ________ about clocks, soup, and the weather.", "证人只被问了一个简单问题，却开始胡乱谈钟、汤和天气。", "Babble about describes confused or rambling speech.", "babble about 表示混乱或漫无边际地说。"], ["articulate", "summarize", "silence"]),

  vocab(186, "backhanded", "/ˌbækˈhæn.dɪd/", "adjective", "间接的，含沙射影的，虚情假意的：indirect",
    "indirect, insincere, or carrying a concealed insult beneath apparent praise", "间接的；含沙射影的；表面恭维实则挖苦的",
    "国王把勋章正面写成“恭喜”，背面却刻着“没想到你也能做到”，赞美翻面就露出刺。",
    [["a backhanded compliment", "明褒暗贬的话", "Calling the tiny room “surprisingly livable” was a backhanded compliment.", "称那个小房间“居然还能住”是一句明褒暗贬的话。"], ["backhanded praise", "含沙射影的赞扬", "Her backhanded praise made the winner feel smaller, not taller.", "她夹枪带棒的赞扬没有鼓舞获胜者，反而让他觉得矮了一截。"], ["a backhanded apology", "虚情假意、暗含指责的道歉", "“I'm sorry you misunderstood” was a backhanded apology.", "“很遗憾你误会了”是一种虚情假意、暗含指责的道歉。"]],
    [["indirect", "间接的；迂回的", "原表注解 · 核心关系", "indirect 是宽泛上位词；backhanded 特别暗示真实态度藏在反面，常带不真诚、挖苦或隐性敌意。", "The director made an indirect reference to the dispute.", "主任间接提到那场争端。"], ["insincere", "不真诚的；虚情假意的", "原表中文义 · 态度近义", "insincere 直说缺乏真心；backhanded 还说明表达通过表面赞美或迂回方式藏着负面评价。", "His insincere apology convinced nobody.", "他虚情假意的道歉没有说服任何人。"], ["sarcastic", "讽刺的", "近义词", "sarcastic 往往让讽刺意图较明显；backhanded 可能表面完全像赞扬，要听出暗刺才明白。", "Her sarcastic applause echoed through the empty hall.", "她带讽刺意味的掌声回荡在空厅。"], ["forthright", "直率坦白的", "反向易混", "forthright 把评价直接摆在正面；backhanded 则从侧面或反面传递真实态度。", "The editor gave a forthright account of the manuscript's flaws.", "编辑直率说明了手稿的缺点。"]],
    M("声音联想：backhanded 可想成“背着手递话”。嘴上递来赞美，背后的手却藏着一根刺；这是情景谐音桥，不是词源。", "可靠构词：back + handed。它先有用手背或反手方向完成动作的字面义，再产生“反着来、间接、动机可疑”的比喻义；无需另造神秘词根。", "英文熟词桥：a backhand stroke uses the reverse side/direction；a backhanded compliment likewise has an unpleasant reverse side。", "国王颁发双面勋章，正面写“做得好”，翻面却写“以你的水平来说”，获奖者当场缩小一半。", "反手、反面 → 表达不从正面来 → 表面称赞背后藏着贬低或敌意。", "最常见搭配是 backhanded compliment。它不只是“赞扬不够热烈”，而是赞扬结构本身暗含侮辱或否定。", "The queen's backhanded compliment praised the knight's courage for someone afraid of spoons.", "女王明褒暗贬地称赞骑士：对一个怕勺子的人来说，他可真勇敢。"),
    ["What makes a compliment backhanded rather than merely weak?", "什么使一句 compliment 成为 backhanded，而不只是赞美力度不足？", "Its apparent praise contains or implies a criticism, insult, or insincere attitude.", "它表面的赞扬中包含或暗示批评、侮辱或不真诚态度。"],
    ["Saying “You are clever for a cabbage” is a ________ compliment.", "说“作为一棵卷心菜，你可真聪明”是一句明褒暗贬的话。", "A backhanded compliment carries an insult inside apparent praise.", "backhanded compliment 把侮辱藏在表面赞扬里。"], ["frank", "literal", "sincere"]),

  vocab(187, "badger", "/ˈbædʒ.ɚ/", "transitive verb", "不断纠缠或骚扰：harass, persistently",
    "to harass or pester someone persistently with repeated demands, questions, or criticism", "不断纠缠；反复烦扰；缠着要求",
    "一只真正的獾拿着问卷追着公爵跑，每隔三秒重复同一个问题，直到公爵躲进茶壶。",
    [["badger someone for an answer", "缠着某人要答复", "Reporters badgered the minister for an answer.", "记者们缠着部长要求答复。"], ["badger someone into agreeing", "纠缠某人直至其同意", "They badgered him into agreeing to chair the committee.", "他们反复纠缠，终于让他同意主持委员会。"], ["keep badgering someone", "不停烦扰某人", "The children kept badgering their robot to tell another story.", "孩子们不停缠着机器人再讲一个故事。"]],
    [["harass", "骚扰；不断烦扰", "原表注解 · 核心动作", "harass 范围更广，可包括威胁或系统性骚扰；badger 常是用反复问题、要求或批评把人磨得不胜其烦。", "Anonymous callers continued to harass the witness.", "匿名来电者继续骚扰证人。"], ["persistently", "持续不断地；不罢休地", "原表注解 · 方式限定", "persistently 是 badger 的关键方式：一次请求不是 badger，重复到对方厌烦才是。", "The child persistently asked whether the moon needed shoes.", "孩子没完没了地问月亮是否需要鞋。"], ["pester", "纠缠；烦扰", "近义词", "pester 与 badger 很接近；badger 常更有压力感，并常接 for something 或 into doing something。", "Fans pestered the actor for photographs.", "粉丝缠着演员要求合影。"], ["bully", "欺凌；威逼", "易混词", "bully 强调权力压迫、恐吓或伤害；badger 主要靠反复纠缠施压，未必有强弱权力差。", "Older pupils bullied him until a teacher intervened.", "高年级学生欺负他，直到老师介入。"]],
    M("声音联想：badger 可借音想成“白着急”。一只獾白着急还不肯走，追着你反复提问；这只是中文声音桥，不是词源。", "词源审慎说明：动词 badger 较可靠地由动物名 badger 转成“像围攻獾那样反复纠缠”。但动物名本身的更深来源有争议，不宜编造固定词根。", "英文熟词桥：想象 a badger that badgers you。动物紧追不舍的画面，直接连接 pester repeatedly。", "戴记者帽的獾举着同一张问卷绕公爵跑一百圈，每圈都问“月亮交税了吗？”", "重复追逐、围扰 → repeated demands/questions → 对方被磨到烦躁或让步。", "badger 是及物动词：badger someone for an answer；badger someone into doing。不要说 badger to someone。", "A badger badgered the duke for an answer until both hid inside a teapot.", "一只獾缠着公爵要答案，最后两者都躲进茶壶。"),
    ["What element turns an ordinary request into badgering?", "什么因素使普通请求变成 badger？", "Persistent repetition that pressures or annoys the other person.", "持续重复并因此给对方压力或造成烦扰。"],
    ["The lobbyists continued to ________ the official for a private meeting.", "游说者不断纠缠官员，要求私下会面。", "Badger someone for something means repeatedly pressure them to provide it.", "badger someone for something 表示反复施压，要求对方提供某物。"], ["comfort", "avoid", "praise"]),

  vocab(188, "badinage", "/ˌbæd.ɪˈnɑːʒ/", "uncountable noun", "打趣，善意的玩笑：banter",
    "light, witty, and good-humored teasing or conversational banter", "善意打趣；诙谐闲谈；轻松玩笑",
    "两位外交官不用剑而用羽毛互相戳笑点，每句玩笑都轻巧，谁也不真正受伤。",
    [["light badinage", "轻松打趣", "Light badinage eased the tension before negotiations.", "谈判前的轻松打趣缓和了紧张气氛。"], ["witty badinage", "机智诙谐的闲谈", "Their witty badinage entertained the entire table.", "他们机智诙谐的闲谈逗乐了整桌人。"], ["exchange badinage", "互相打趣", "The rivals exchanged badinage while waiting for the debate.", "两位对手等候辩论时互相打趣。"]],
    [["banter", "善意打趣；诙谐逗乐", "原表注解 · 直接近义", "banter 是现代常用词；badinage 更正式、更文学，尤指机智而轻松的交谈式玩笑。", "Friendly banter continued throughout dinner.", "整顿晚餐都伴随着友善打趣。"], ["repartee", "机敏应答；妙语对答", "近义词", "repartee 强调快速而机智的来回回应；badinage 强调整体轻松、善意的玩笑氛围，不一定句句针锋相对。", "The actors' rapid repartee delighted the audience.", "演员们快速机敏的对答令观众开心。"], ["mockery", "嘲弄；讥讽", "易混词", "mockery 可带轻蔑并伤人；badinage 原则上是 good-humored，参与者共享玩笑而非单向受辱。", "His cruel mockery silenced the room.", "他残酷的嘲弄使全场沉默。"]],
    M("声音联想：badinage 可想成“buddy 拿 joke”。伙伴拿出机智玩笑彼此逗乐；这只是混合声音记忆桥，不是法语或英语的真实拆词。", "可靠词源：直接来自法语 badinage，关联法语 badiner“打趣、开玩笑”。保留法语式词尾 /ʒ/，不要按英语 bad + in + age 硬拆。", "英文熟词桥：把 badinage 直接钉在 banter 上，再用 final -age /ʒ/ 的法语音色提醒其正式、文学语体。", "两名严肃外交官用羽毛代替剑决斗，每刺一下就说一句妙语，连会议桌都笑得打嗝。", "playful French-derived talk → witty good-humored banter；核心不是 bad，而是轻松互逗。", "badinage 通常是不可数名词且语体偏正式。若玩笑带恶意或羞辱，更可能是 mockery，而不是 badinage。", "Their badinage made the treaty laugh before either diplomat signed it.", "两位外交官的妙语打趣让条约在签署前先笑了起来。"),
    ["What two qualities keep badinage from becoming mockery?", "哪两个特征使 badinage 不至于变成 mockery？", "It is light or witty and fundamentally good-humored rather than contemptuous.", "它轻松或机智，而且本质上出于善意而非轻蔑。"],
    ["The old friends exchanged witty ________ throughout the long train ride.", "老友们在漫长火车旅途中一直机智地互相打趣。", "Badinage is a formal word for light, witty banter.", "badinage 是表示轻松机智打趣的正式词。"], ["silence", "mourning", "lecture"]),

  vocab(189, "bait", "/beɪt/", "noun · transitive verb", "逗弄，激怒：persecute, exasperate; 引诱：lead away; 诱饵：something, luring",
    "something used to lure a target, or the act of teasing or provoking someone into reacting", "诱饵；引诱；故意逗弄或激怒",
    "鱼钩上不挂虫而挂一枚会发光的论点，鱼一咬就被拉进争吵，围观者还为它鼓掌。",
    [["take the bait", "上钩；受激作出反应", "The senator refused to take the bait when reporters mocked him.", "记者嘲弄参议员时，他拒绝上钩。"], ["use something as bait", "把某物用作诱饵", "The fox used a silver spoon as bait for a curious dragon.", "狐狸用银勺作诱饵，引来一条好奇的龙。"], ["bait someone into reacting", "激某人作出反应", "The troll tried to bait readers into reacting angrily.", "网络喷子试图激怒读者，让他们愤怒回应。"]],
    [["persecute", "反复迫害；折磨", "原表注解 · 逗弄义", "persecute 通常更严重、更系统，常因身份或信念而迫害；bait 在此多指逗弄、攻击或故意刺激目标。", "The regime persecuted writers for their beliefs.", "该政权因作家的信念而迫害他们。"], ["exasperate", "使极其恼怒", "原表注解 · 激怒结果", "exasperate 只说明使人极烦恼；bait 还包含有意抛出刺激物、想诱使对方反应的策略。", "The endless delay exasperated every passenger.", "无休止的延误使每位乘客都极其恼火。"], ["lead away", "诱离原处或正轨", "原表注解 · 引诱动作", "lead away 可以中性地带走；bait 通过诱人之物把目标从原位置、判断或计划引开。", "The glittering trail led the explorers away from camp.", "闪亮的痕迹把探险者引离营地。"], ["something luring", "用来吸引目标的东西", "原表注解 · 名词义", "something luring 是功能描述；bait 是作为诱饵使用的具体食物、奖励、信息或挑衅。", "The free trial was something used to lure hesitant customers.", "免费试用是用来吸引犹豫顾客的手段。"], ["lure", "诱饵；诱惑；引诱", "近义词", "lure 可强调强烈吸引力或专门拟饵；bait 更突出放在陷阱或钩上的东西，也常比喻挑衅对方上钩。", "The promise of fame lured him into the contest.", "成名的承诺诱使他参加比赛。"]],
    M("声音联想：bait 像“被它”吸走。鱼被它引向钩子，人也被一句挑衅引进争吵；这是中文近音桥，不是词源。", "可靠词源：bait 来自古诺斯语 beita“使咬、让咬上”，与 bita“咬”相关。诱饵让目标 bite，这条历史与语义连接较稳。", "英文熟词桥：bait invites a bite；take the bait 就是咬钩，也比喻接受挑衅并按对方设计作出反应。", "鱼钩挂着一枚金色感叹号，鱼咬下后没有被钓走，反而被拖进一场电视辩论。", "让动物咬钩 → 用诱饵引走 → 用话语逗弄、激怒，让人“咬”下挑衅。", "bait 与 bate 同音但拼写和意义不同。固定说 with bated breath“屏息地”，不是 baited breath。", "The moon used a diamond as bait, but the fish took the bait and demanded a receipt.", "月亮用钻石作诱饵，鱼上钩后却要求开收据。"),
    ["How does the fishing image explain the figurative phrase take the bait?", "钓鱼图像如何解释比喻 take the bait？", "A person reacts to a planted provocation just as a fish bites a deliberately placed lure.", "人按预设挑衅作出反应，就像鱼咬住故意放下的诱饵。"],
    ["The interviewer tried to ________ the actor into criticizing her co-star.", "采访者试图激演员批评她的搭档。", "Bait someone into reacting means deliberately provoke the desired response.", "bait someone into reacting 表示故意挑衅以诱出预期反应。"], ["console", "release", "protect"]),

  vocab(190, "bale", "/beɪl/", "archaic or literary noun", "痛苦，悲哀：sorrow",
    "evil, suffering, or deep sorrow, especially in archaic or literary language", "痛苦；灾祸；悲哀（古语或文学用语）",
    "黑色钟上写着 BALE，每响一次，王国的云、树和茶杯就一起落泪；旁边的草捆却完全无辜。",
    [["bliss and bale", "幸福与悲苦", "The old ballad moves from bliss to bale in a single verse.", "那首古老歌谣在一节诗中便从幸福转入悲苦。"], ["bring bale upon", "给……带来灾祸与悲痛", "The wizard feared that the crown would bring bale upon the village.", "巫师担心王冠会给村庄带来灾祸与悲痛。"], ["a world of bale", "悲苦世界", "The exile described the frozen island as a world of bale.", "流亡者把冰封岛屿描述成一个悲苦世界。"]],
    [["sorrow", "悲哀；悲痛", "原表注解 · 直接近义", "sorrow 是现代通用词；bale 的这一义古老而文学化，还可兼含 evil、harm 或 misery。", "Sorrow filled the house after the farewell.", "告别后，悲伤充满整座房子。"], ["woe", "悲痛；灾难", "近义词", "woe 也偏文学但现代读者更熟悉；bale 更古奥，常在历史文本、诗歌或仿古表达中出现。", "The poem tells a tale of love and woe.", "这首诗讲述爱与悲苦的故事。"], ["bale (bundle)", "大捆；打成捆", "异源同形易混词", "现代常见 bale 是压紧的一大捆干草、棉花等；它与表示 sorrow 的古词异源同形，不能用“草捆”推导“悲哀”。", "A bale of hay blocked the barn door.", "一捆干草堵住谷仓门。"], ["baleful", "有害的；凶兆的", "同源词桥", "baleful 由表示 evil/harm 的 bale 加 -ful 形成，保存了古老负面义；但它是形容词，不等同名词 sorrow。", "A baleful light shone from the empty tower.", "空塔中透出凶兆般的光。"]],
    M("声音联想：bale /beɪl/ 可暂记成“悲了”。黑钟一响，全城都悲了；这只是中文近音桥，绝不是真实词源。", "可靠词源：表示“灾祸、痛苦、悲哀”的 bale 来自古英语 bealu“evil, harm, grief”。表示“一大捆”的现代常用 bale 来自另一条历史来源，两者是异源同形词。", "英文熟词桥：baleful 仍保存 bale 的 harm/evil 色彩；再用 bliss and bale 把“幸福—悲苦”做强对照。", "写着 BALE 的黑钟悬在王国上空，钟声让云和茶杯哭泣；一捆干草举牌声明自己只是同形词。", "evil / harm 带来 suffering，最终落到 sorrow；因此古义比单纯悲伤更有灾祸和痛苦色彩。", "现代日常见到 a bale，通常是“捆”。sorrow 义明确标为 archaic/literary，不要在普通会话中随意代替 sadness。", "The black bell brought bale to the kingdom while a bale of hay protested its innocence.", "黑钟给王国带来悲苦，一捆干草则抗议自己是无辜的。"),
    ["Why must the two nouns spelled bale be kept separate?", "为什么必须把两个拼作 bale 的名词分开？", "The literary word for sorrow and the everyday word for a compressed bundle have different historical origins and meanings.", "表示悲哀的文学古词与表示压紧大捆的日常词，历史来源和意义都不同。"],
    ["The ancient poem contrasts royal bliss with endless ________.", "古诗把王室幸福与无尽悲苦相对照。", "In archaic literary language, bale means sorrow, misery, or evil.", "在古语或文学语体中，bale 表示悲哀、痛苦或灾祸。"], ["joy", "bundle", "shelter"]),
];

const lessonMeta = {
  awkward: {
    register: "常用 · 日常与正式语境均见 · 多义形容词",
    comparisonIpas: ["/ˈlæk.ɪŋ dekˈster.ə.ti/", "/ə læk əv skɪl ænd tækt/", "/ˈlæk.ɪŋ iːz/", "/ɪmˈber.əs.mənt/", "/ˈdɪf.ə.kəlt tə juːz/", "/ˈklʌm.zi/"],
  },
  awning: {
    register: "常用 · 具体名词 · 建筑与户外场景",
    comparisonIpas: ["/ˈʃel.tɚ/", "/ˈkæn.ə.pi/", "/iːvz/"],
  },
  awry: {
    register: "常用 · 较书面 · 常见于 go awry",
    comparisonIpas: ["/tɝːnd, ˈtwɪs.tɪd/", "/ˌɔːf ˈkɔːrs/", "/əˈskjuː/", "/əˈmɪs/"],
  },
  axiomatic: {
    register: "正式 · 学术与逻辑语体",
    comparisonIpas: ["/ˈæk.si.əm/", "/ˌselfˈev.ə.dənt/", "/ˈɑːb.vi.əs/", "/ˈθiːr.əm/"],
  },
  babble: {
    register: "常用 · 日常用语 · 可指言语或连续声响",
    comparisonIpas: ["/ˈʌt.ɚ, ˈmiː.nɪŋ.ləs/", "/ˈræm.blɪŋ ˌkɑːn.vɚˈseɪ.ʃən/", "/ˈmʌm.bəl/", "/ˈpræt.əl/"],
  },
  backhanded: {
    register: "常用 · 带贬义 · 常见于 backhanded compliment",
    comparisonIpas: ["/ˌɪn.dəˈrekt/", "/ˌɪn.sɪnˈsɪr/", "/sɑːrˈkæs.tɪk/", "/ˈfɔːrθ.raɪt/"],
  },
  badger: {
    register: "常用 · 日常及新闻语体 · 及物动词",
    comparisonIpas: ["/həˈræs/", "/pɚˈsɪs.tənt.li/", "/ˈpes.tɚ/", "/ˈbʊl.i/"],
  },
  badinage: {
    register: "正式 · 文学用语 · 不可数名词",
    comparisonIpas: ["/ˈbæn.tɚ/", "/ˌrep.ɑːrˈtiː/", "/ˈmɑː.kɚ.i/"],
  },
  bait: {
    register: "常用 · 日常与比喻语境 · 名词/动词",
    comparisonIpas: ["/ˈpɝː.sə.kjuːt/", "/ɪɡˈzæs.pə.reɪt/", "/liːd əˈweɪ/", "/ˈsʌm.θɪŋ ˈlʊr.ɪŋ/", "/lʊr/"],
  },
  bale: {
    register: "古语 · 文学用语 · 现代日常义通常为“大捆”",
    comparisonIpas: ["/ˈsɑːr.oʊ/", "/woʊ/", "/beɪl/", "/ˈbeɪl.fəl/"],
  },
};

for (const item of all) {
  const meta = lessonMeta[item.word];
  item.register = meta.register;
  item.comparisons = item.comparisons.map((entry, index) => [...entry, meta.comparisonIpas[index]]);
}

const group = (start) => all.slice(start - 181, start - 176);

export const set37 = compactSet(37, "The Crooked Canopy", group(181), {
  title: "The Crooked Canopy",
  targetForms: ["awkward", "awning", "awry", "axiomatic", "babble"],
  plain: "An awkward giraffe opened an awning above a submarine; when the mechanism went awry, it seemed axiomatic that the captain would babble to a committee of umbrellas.",
  translation: "一只笨拙的长颈鹿在潜艇上方打开遮阳篷；装置出错后，船长向雨伞委员会胡言乱语，似乎成了不言自明的必然。",
});

export const set38 = compactSet(38, "The Moon's Wounded Pride", group(186), {
  title: "The Moon's Wounded Pride",
  targetForms: ["backhanded", "badger", "badinage", "bait", "bale"],
  plain: "A turnip made a backhanded remark, tried to badger a duke during their badinage, dangled a diamond as bait, and filled the moon with bale.",
  translation: "一根萝卜说了句含沙射影的话，又在与公爵打趣时不断纠缠他，还把钻石当作诱饵晃动，最终让月亮充满悲哀。",
});
