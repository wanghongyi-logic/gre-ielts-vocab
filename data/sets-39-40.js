import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(191, "baleful", "/ˈbeɪl.fəl/", "adjective", "有害的：harmful; 凶兆的，凶恶的：evil; 致命的：causing death", "threatening or causing serious harm; ominously evil or deadly", "有害的；凶恶不祥的；致命的",
    "一只绿眼睛从乌云里投下凶光，所照之处的花木立刻枯萎。",
    [["a baleful glare", "凶恶的目光", "The guard gave the intruder a baleful glare.", "守卫凶恶地瞪着闯入者。"], ["a baleful influence", "有害的影响", "The cult exerted a baleful influence on the isolated town.", "该邪教对这座与世隔绝的小镇产生了有害影响。"], ["baleful consequences", "灾难性的后果", "The policy had baleful consequences for the wetlands.", "这项政策给湿地带来了灾难性后果。"]],
    [["harmful", "有害的", "原表注解 · 核心结果", "harmful 是宽泛的‘造成伤害’；baleful 更书面，并常带凶兆、恶意或毁灭感。", "Excessive noise is harmful to hearing.", "过度噪声有害听力。"], ["evil", "邪恶的；凶恶的", "原表注解 · 威胁色彩", "evil 可直接判断人或行为邪恶；baleful 常形容目光、影响或征兆在威胁灾祸。", "The tyrant ordered an evil act.", "暴君下令实施邪恶行为。"], ["causing death", "导致死亡的", "原表注解 · 强度上限", "causing death 直说致死结果；baleful 可以达到 deadly，也可以只表示严重有害或预示邪恶。", "The gas is capable of causing death in a confined space.", "这种气体在密闭空间可能致人死亡。"], ["ominous", "不祥的；预示坏事的", "近义词", "ominous 强调预示坏事；baleful 还可强调事物本身具有恶性、有害影响。", "Ominous clouds gathered above the valley.", "不祥的乌云聚集在山谷上空。"]],
    M("声音联想（非词源）：baleful 像‘背负’。乌云背负一袋灾祸，投下凶光，提醒你它既有害又不祥。", "可靠构词：Middle English balefull 可追溯到 Old English bealu（evil，灾祸、邪恶）+ -ful。这里的 bale 不是‘成捆货物’的现代常见义。", "熟词桥：bale（古义 harm/evil）+ -ful → full of threatening harm；把 a baleful look 记成‘一眼就预告灾祸’。", "月亮长出绿色巨眼，瞪过的玫瑰瞬间枯萎，天气预报员还给这道目光贴上‘有害辐射’标签。", "从‘充满灾祸’落到两个现代重点：本身造成有害影响，或以凶恶姿态预示坏事。", "易混刹车：baleful 常偏‘凶兆、威胁邪恶’；baneful 更常偏‘实际造成毁坏’。两词有重叠，但不是 bale/bane 可随意互换。", "The baleful moon glared at the garden, and every rose applied for shelter.", "凶兆般的月亮瞪着花园，每朵玫瑰都申请了避难所。"),
    ["What extra tone does baleful add to ordinary harmful?", "baleful 比普通 harmful 多出什么语气？", "It often suggests ominous, evil, or deadly menace, not merely damage.", "它常带不祥、邪恶或致命威胁感，不只是一般伤害。"],
    ["The witness remembered the suspect's ________ stare across the courtroom.", "证人记得嫌疑人在法庭另一边投来的凶恶目光。", "A threatening, evil-looking stare is baleful.", "带威胁和凶恶感的目光可用 baleful。"], ["beneficial", "cheerful", "harmless"]),

  vocab(192, "balk", "/bɔːk/", "verb · noun", "阻碍：check, obstacle; 不愿接受，拒绝：unwillingness", "to stop short and refuse to proceed; to check or obstruct", "畏缩拒绝；突然停住；阻碍，障碍",
    "一匹马在终点前突然把四蹄钉进地面，身后所有计划都撞成一团。",
    [["balk at a proposal", "拒绝接受提议", "Several members balked at the proposal's cost.", "几名成员因提议成本过高而拒绝接受。"], ["balk at doing something", "不愿做某事", "She balked at signing a contract she had not read.", "她不愿签署一份自己尚未读过的合同。"], ["balk an attempt", "阻挠一次尝试", "A court order balked the company's attempt to demolish the theater.", "法院命令阻止了公司拆除剧院的企图。"]],
    [["check", "制止；阻挡", "原表注解 · 动词义", "check 可泛指控制、核查或阻止；balk 作及物动词时较正式，强调设置障碍使计划受挫。", "The barrier checked the advance of the fire.", "屏障遏制了火势推进。"], ["obstacle", "障碍", "原表注解 · 名词义", "obstacle 是任何阻碍物；balk 作名词表示 hindrance 的用法较少见，日常更常用 obstacle。", "Lack of funding remains a major obstacle.", "资金不足仍是主要障碍。"], ["unwillingness", "不情愿；不愿接受", "原表注解 · 心理动因", "unwillingness 是抽象态度；balk 把这种不愿表现为突然停下或明确拒绝。", "His unwillingness to compromise delayed the talks.", "他不愿妥协，拖延了谈判。"], ["flinch", "退缩；畏缩", "近义词", "flinch 常是因疼痛或恐惧本能一缩；balk 常在要求、价格或行动面前拒绝继续。", "She did not flinch when the alarm sounded.", "警报响起时她没有畏缩。"]],
    M("声音联想（非词源）：balk 近似‘罢课’。学生走到教室门口突然罢课，停住、拒绝，还堵住了后面的人。", "可靠词源线索：名词可追溯到 Old English balca，指田间未耕的土埂或横梁；‘横在路上的东西’后来引出 obstacle 与 stop/refuse。", "熟词桥：棒球里 pitcher 可因违规停顿而 commit a balk；共同画面都是动作突然卡住。", "赛马即将跨栏时坐下喝茶，骑手、观众和整条跑道都被这一拒绝动作卡住。", "实体横梁阻路 → 行动被阻止 → 人在要求前突然拒绝，核心始终是‘不能再向前’。", "易混刹车：最常用结构是 balk at a price/idea/doing；不要把 balk 当普通 dislike，它强调临门停住或拒绝推进。", "The horse balked at the tiny puddle and demanded a suspension bridge.", "马在小水坑前突然拒绝前进，还要求修一座吊桥。"),
    ["Which preposition normally follows balk when someone rejects an idea?", "表示拒绝某想法时，balk 后通常接哪个介词？", "At: balk at an idea, a price, or doing something.", "接 at：balk at an idea、a price 或 doing something。"],
    ["Consumers may ________ at paying twice as much for the same service.", "消费者可能不愿为同样服务支付双倍价格。", "Balk at paying expresses a sudden refusal or strong unwillingness.", "balk at paying 表达突然拒绝或强烈不情愿。"], ["welcome", "approve", "advance"]),

  vocab(193, "balky", "/ˈbɔː.ki/", "adjective", "不服管束的，倔强的：refusing", "inclined to stop, resist, or refuse to proceed", "不服管束的；倔强不前的；动不动就停摆的",
    "一台长着驴耳朵的发动机双臂抱胸，任凭司机恳求也拒绝启动。",
    [["a balky horse", "一匹不肯前进的马", "The rider patiently coaxed the balky horse across the stream.", "骑手耐心哄着那匹不肯前进的马过溪。"], ["a balky engine", "一台动不动就停摆的发动机", "The balky engine refused to start on cold mornings.", "这台难伺候的发动机在寒冷早晨总不肯启动。"], ["become balky", "变得不配合", "The old printer becomes balky whenever the paper is damp.", "纸张一潮，旧打印机就变得不听使唤。"]],
    [["refusing", "拒绝的；不肯的", "原表注解 · 核心动作", "refusing 描述一次拒绝；balky 描述人、动物或机器有反复停住、不配合的倾向。", "The child stood still, refusing to move.", "孩子站着不动，拒绝前进。"], ["stubborn", "固执的；顽固的", "近义词", "stubborn 可指任何不改主意；balky 特别突出在行动节点停住、抗拒操作。", "The stubborn negotiator would not revise the clause.", "固执的谈判者不肯修改条款。"], ["recalcitrant", "抗拒管束的；难驾驭的", "近义词 · 正式", "recalcitrant 正式且常指公然抗命；balky 更形象，也常用于马和故障机器。", "The agency struggled with a recalcitrant contractor.", "该机构难以应付不服管束的承包商。"]],
    M("声音联想（非词源）：balky 像‘罢课的’。那匹马每天走到校门就罢课，天生不肯配合。", "可靠构词：balk（停住、拒绝）+ 形容词后缀 -y（有……倾向的），字面就是‘动不动会 balk 的’。", "熟词桥：balk → stop and refuse；加 -y 后从一次动作变成稳定倾向：a balky horse / engine。", "打印机长出四条驴腿，看到作业就抱胸罢工，只有喂胡萝卜才肯吐出一页纸。", "一次 balk 是停住拒绝；反复容易 balk 就是 balky，可从动物延伸到难操作的机器。", "易混刹车：balky 是形容词；balked 是 balk 的过去式。a balky horse 指性情难驾驭，不只是某次已经停下。", "The balky printer demanded a carrot before printing each page.", "那台倔强的打印机每打印一页都要先吃一根胡萝卜。"),
    ["How does balky differ from the past-tense form balked?", "balky 与过去式 balked 有何区别？", "Balky describes a recurring tendency to resist; balked reports one completed refusal.", "balky 描述反复抗拒的倾向；balked 报告一次已经发生的拒绝。"],
    ["We replaced the ________ copier after it jammed for the fifth time.", "复印机第五次卡住后，我们换掉了这台难伺候的机器。", "A machine that repeatedly resists working can be called balky.", "反复不肯正常工作的机器可称 balky。"], ["compliant", "reliable", "obedient"]),

  vocab(194, "ballad", "/ˈbæl.əd/", "noun", "（由简单诗节和叠句组成的）民歌：poem", "a narrative poem or song, often arranged in simple stanzas with a refrain", "叙事歌谣；由简单诗节和叠句构成的民歌",
    "游吟诗人每唱完四行，身后的羊群便整齐重复同一句叠句。",
    [["a folk ballad", "一首民间歌谣", "The archive preserves a folk ballad about a lost sailor.", "档案馆保存着一首讲述失踪水手的民间歌谣。"], ["sing a ballad", "演唱一首歌谣", "She sang a ballad that had traveled across three centuries.", "她唱了一首流传了三个世纪的歌谣。"], ["a murder ballad", "一首凶杀叙事歌谣", "The murder ballad recounts the crime in twelve stark verses.", "这首凶杀歌谣用十二节冷峻诗句讲述案件。"]],
    [["poem", "诗；诗作", "原表注解 · 文体上位词", "poem 不必能唱也不必叙事；传统 ballad 常以简单诗节讲故事，并适合歌唱。", "The poem has no regular rhyme scheme.", "这首诗没有规则韵式。"], ["lyric", "抒情诗；歌词", "近义词", "lyric 通常表达个人情感；ballad 的传统核心是用诗节叙述事件或人物故事。", "The lyric expresses quiet grief.", "这首抒情诗表达静默的悲伤。"], ["epic", "史诗", "易混文体", "epic 篇幅宏大、英雄主题突出；ballad 往往更短、结构简单，常有叠句。", "The epic follows a hero through years of war.", "这部史诗讲述英雄多年的战争经历。"]],
    M("声音联想（非词源）：ballad 像‘爸乐得’。爸爸乐得抱起琴，把家里的荒唐往事唱成四行一节的歌谣。", "可靠词源：经 Middle French balade 回到 Old Occitan ballada，来自 ballar（to dance）；早期指配舞的歌，ballar 又追溯到 Late Latin ballare。", "熟词桥：看到 ballad singer，就锁定‘能唱的叙事诗’；story + stanzas + song 是三根支柱。", "游吟诗人唱一节，十二只羊就合唱叠句；唱到第三节，羊群竟要求修改押韵。", "从配舞的歌发展为用简单诗节讲故事的歌谣，现代也可泛指慢速抒情流行歌。", "易混刹车：ballad 是歌谣或叙事诗；ballet 是舞剧。传统词史有关联，但现代词义和拼写不能互换。", "The ballad had one refrain, and the sheep sang it forty-seven times.", "这首歌谣只有一句叠句，羊群却唱了四十七遍。"),
    ["What makes a traditional ballad more specific than a general poem?", "传统 ballad 比一般 poem 多哪些特征？", "It usually tells a story in simple stanzas and is suitable for singing, often with a refrain.", "它通常用简单诗节叙事，适合歌唱，并常有叠句。"],
    ["The singer performed an old ________ about a sailor who married the moon.", "歌手演唱了一首古老歌谣，讲水手娶月亮的故事。", "A narrative song in traditional stanzas is a ballad.", "用传统诗节叙事的歌曲是 ballad。"], ["essay", "manual", "diagram"]),

  vocab(195, "balloon", "/bəˈluːn/", "verb", "迅速增加：increase", "to swell, expand, or increase rapidly", "膨胀；迅速增加；暴涨",
    "预算表上的数字像充气气球一样越胀越大，最后顶破了会议室屋顶。",
    [["costs balloon", "成本暴涨", "Construction costs ballooned after the supply shortage.", "供应短缺后，建筑成本暴涨。"], ["balloon from ... to ...", "从……猛增到……", "The waiting list ballooned from fifty names to five hundred.", "等候名单从五十人猛增到五百人。"], ["balloon into a crisis", "膨胀成一场危机", "A minor scheduling error ballooned into a national crisis.", "一个小小的排期错误膨胀成全国性危机。"]],
    [["increase", "增加", "原表注解 · 上位词", "increase 可以缓慢、平稳或迅速；balloon 用气球膨胀作比喻，强调体量快速变大。", "Demand increased gradually over the decade.", "需求在十年间逐步增加。"], ["swell", "膨胀；增大", "近义词", "swell 可指身体肿胀、声音增强或数量增长；balloon 更突出气球般迅速扩张。", "The crowd swelled as evening approached.", "傍晚临近时人群扩大。"], ["skyrocket", "猛涨；飞涨", "近义词 · 强烈", "skyrocket 强调像火箭一样陡升，常用于价格；balloon 强调容量或规模向外膨胀。", "Fuel prices skyrocketed after the disruption.", "供应中断后燃油价格猛涨。"], ["inflate", "使充气；抬高", "易混词", "inflate 常作及物动词，某人使数字或气球变大；balloon 常作不及物动词，事物自身迅速扩大。", "The report inflated the projected savings.", "报告夸大了预计节省额。"]],
    M("声音联想（非词源）：balloon 像‘爆隆’。数字一边膨胀一边发出爆隆巨响，提醒你它在迅速增加。", "可靠词源：经 French ballon 进入英语，源自 Italian pallone（大球），由 palla（球）+ 增大后缀 -one 构成。", "熟词桥：熟悉的气球 balloon 越充越大；把形状变化直接投射到 costs/debt/list balloon。", "预算数字被打气筒充成巨球，撞破天花板后还在云层里继续增长。", "实体气球膨胀 → 数量、成本、债务或问题的规模迅速扩大；重点是快且越滚越大。", "易混刹车：increase 只说变多；balloon 强调迅速膨胀。常说 costs ballooned to a figure，不要把所有小幅增长都写成 balloon。", "The lunch budget ballooned until the spreadsheet floated out the window.", "午餐预算膨胀到整张表格飘出了窗外。"),
    ["What image makes balloon stronger than the neutral verb increase?", "哪个图像使 balloon 比中性 increase 更强？", "A container swelling outward quickly, suggesting rapid growth in size or amount.", "一个容器迅速向外膨胀，表示规模或数量快速增长。"],
    ["Without reform, pension costs could ________ over the next decade.", "若不改革，养老金成本未来十年可能迅速膨胀。", "Balloon describes costs expanding rapidly.", "balloon 可描述成本迅速扩大。"], ["stabilize", "contract", "decline"]),

  vocab(196, "balm", "/bɑːm/", "noun", "香油，止痛膏，安慰物：sweet-smelling oil, soothe; 香气：pleasant smell", "a fragrant healing preparation or anything that soothes and restores", "香油；止痛膏；安慰物；香气",
    "一罐会唱摇篮曲的香膏抹上伤口，也把悲伤哄睡，还在空气里留下花香。",
    [["apply balm to a wound", "把药膏涂在伤口上", "The nurse applied balm to the cracked skin.", "护士把药膏涂在皲裂的皮肤上。"], ["a soothing balm", "令人舒缓的安慰物；舒缓膏", "Her calm voice was a soothing balm after the argument.", "争吵之后，她平静的声音令人宽慰。"], ["balm for grief", "缓解悲伤的慰藉", "Music became a balm for his grief.", "音乐成了缓解他悲伤的慰藉。"], ["fragrant balm", "芳香的香膏；宜人香气", "Fragrant balm drifted from the herb garden.", "宜人的香气从药草园飘来。"]],
    [["sweet-smelling oil", "芳香油；香油", "原表注解 · 实体义", "sweet-smelling oil 描写气味与形态；balm 更具体，可指芳香树脂、药膏或含此类成分的制剂。", "The lamp burned a sweet-smelling oil.", "灯中燃烧着芳香油。"], ["soothe", "缓和；安抚", "原表注解 · 功能义", "soothe 是动作；balm 是实施舒缓的物质或比喻性的安慰来源。", "A cool cloth soothed the burn.", "凉布缓解了灼痛。"], ["pleasant smell", "宜人的气味", "原表注解 · 香气义", "pleasant smell 是宽泛描述；balm 的香气义较文学，常让人联想到植物、树脂和温暖芳香。", "A pleasant smell filled the bakery.", "面包店里充满宜人香气。"], ["salve", "药膏；慰藉", "近义词", "salve 与 balm 都可指药膏并比喻安慰；balm 更容易带芳香、舒缓与恢复感。", "The apology was a salve for his wounded pride.", "道歉安抚了他受伤的自尊。"]],
    M("声音联想（非词源）：balm 的 /bɑːm/ 像把‘帮’拖长。香膏来帮伤口止痛，也帮心情恢复平静。", "可靠词源：Middle English basme/baume 经 Anglo-French 来自 Latin balsamum（balsam，香脂）。现代拼写不能硬拆成 b + alm。", "熟词桥：lip balm 是最熟悉的实体；把‘舒缓嘴唇’扩大到 art is a balm for grief。", "药膏罐长出嘴巴，一边给伤口涂香油，一边唱歌安慰失恋的犀牛，整间屋子都是花香。", "芳香药膏能舒缓身体 → 任何能安慰、恢复心灵的事物都可比喻为 balm。", "易混刹车：balm 是提供舒缓的名词，不等于 cure。它可减轻疼痛或悲伤，却未必消除根因。字母 l 常不发音。", "The balm soothed the dragon's nose and persuaded its smoke to smell like roses.", "香膏舒缓了龙的鼻子，还让它喷出的烟变成玫瑰香。"),
    ["How does the figurative sense of balm grow from the physical ointment?", "balm 的比喻义如何从实体药膏发展？", "A healing preparation soothes the body; a figurative balm soothes emotional pain.", "药膏舒缓身体；比喻性的 balm 舒缓情绪痛苦。"],
    ["For the exhausted nurses, the quiet music was a welcome ________.", "对疲惫的护士而言，安静音乐是令人欣慰的慰藉。", "Something that gently soothes can be called a balm.", "能温和安抚身心的事物可称为 balm。"], ["irritant", "wound", "agitation"]),

  vocab(197, "banal", "/bəˈnɑːl/", "adjective", "非原创的，陈腐的：trite", "lacking originality, freshness, or novelty", "非原创的；平庸陈腐的；老套的",
    "演讲者从复印机里抽出第九百份同样的老生常谈，听众的哈欠排成波浪。",
    [["a banal remark", "一句陈腐的话", "He opened the interview with a banal remark about the weather.", "他以一句关于天气的陈词滥调开始采访。"], ["a banal plot", "老套的情节", "Excellent acting could not rescue the film's banal plot.", "出色表演也挽救不了电影老套的情节。"], ["sound banal", "听起来平庸陈腐", "The advice may sound banal, but it is still useful.", "这条建议听起来或许老套，但仍然有用。"]],
    [["trite", "陈腐的；老生常谈的", "原表注解 · 强近义", "trite 与 banal 都指因反复使用而失去新鲜感；banal 还常评价内容整体平庸、缺乏原创性。", "The speech ended with a trite slogan.", "演讲以一句陈腐口号结束。"], ["hackneyed", "用滥的；陈旧的", "近义词", "hackneyed 强调表达被用得太多；banal 可指想法、工作或日常场景本来就平淡无新意。", "The novel relies on a hackneyed metaphor.", "小说依赖一个用滥了的比喻。"], ["mundane", "日常平凡的", "易混词", "mundane 只是普通日常，不必糟糕；banal 带负面评价，认为普通到乏味且没有新意。", "She found beauty in mundane routines.", "她在日常琐事中发现美。"], ["original", "原创的；新颖的", "反义词", "original 带来新的表达或想法；banal 重复现成套路。", "The proposal offers an original solution.", "这项提案提供了新颖方案。"]],
    M("声音联想（非词源）：banal 像‘把那老’梗又拿来。把那个老梗反复搬上台，内容自然陈腐无新意。", "可靠词源：借自 French banal。它历史上关联 feudal ban（公共权威、管辖），从‘供辖区共同使用’发展为 common，再到 commonplace/trite；不要硬拆成现代 ban + -al 来猜义。", "熟词桥：banality 是‘平庸、陈腐之处’；看到 banal small talk 就想到没有新信息的老套寒暄。", "复印机连续吐出九百张同一句口号，演讲者仍宣布这是‘今日全新创意’。", "共同可用、普通 → 司空见惯 → 缺乏原创和新鲜感，现代语义落在负面的‘老套平庸’。", "易混刹车：mundane 可中性地表示日常；banal 明确批评缺乏新意。banal 也不等于 benign（良性的、无害的）。", "The banal wizard recycled the same spell and called it a new season.", "平庸巫师重复同一个咒语，却把它称为新一季。"),
    ["Why is banal usually more critical than mundane?", "为什么 banal 通常比 mundane 批评意味更强？", "Banal judges something as stale and unoriginal; mundane may simply mean ordinary or everyday.", "banal 评价事物陈腐无原创；mundane 可以只表示普通日常。"],
    ["The report buried one useful finding beneath pages of ________ observations.", "报告把一项有用发现埋在数页平庸陈腐的观察之下。", "Observations that repeat obvious ideas are banal.", "重复显而易见想法的观察是 banal。"], ["innovative", "fresh", "inventive"]),

  vocab(198, "bane", "/beɪn/", "noun", "祸根：ruin; 有害物质：kill or injure a living thing", "a persistent source of harm, ruin, or misery; formerly, a poison", "祸根；灾星；有害或致命之物",
    "一颗小石子戴着王冠，自称‘鞋子的终身祸根’，每天专门钻进袜子折磨巨人。",
    [["the bane of someone's existence", "某人生活中的祸根", "Spam calls are the bane of her existence.", "骚扰电话是她生活中的祸根。"], ["be a bane to", "成为……的祸害", "The invasive vine is a bane to local farmers.", "这种入侵藤蔓是当地农民的祸害。"], ["a deadly bane", "致命的毒物；致命祸害", "In the old tale, the cup contained a deadly bane.", "古老故事里，杯中装着致命毒物。"]],
    [["ruin", "毁灭；祸根", "原表注解 · 结果关系", "ruin 可指毁灭过程或废墟状态；bane 指反复带来 ruin、痛苦或伤害的来源。", "The scandal brought ruin to the company.", "丑闻使公司覆灭。"], ["kill or injure a living thing", "杀死或伤害生物", "原表注解 · 古义功能", "该短语解释 bane 较旧的‘毒物、致死之物’义；现代最常见的是 the bane of ...，指持续祸根。", "This toxin can kill or injure a living thing.", "这种毒素会杀死或伤害生物。"], ["scourge", "祸害；灾难", "近义词", "scourge 常是影响许多人的严重祸害；bane 也可非常个人化，如 the bane of my life。", "Malaria remains a scourge in the region.", "疟疾仍是该地区的严重祸害。"], ["baleful", "有害而不祥的", "易混词 · 第191词", "bane 是名词，指祸根；baleful 是形容词，来自不同的古英语词，常表示凶恶不祥或有害。", "A baleful rumor poisoned the debate.", "一则有害而不祥的谣言破坏了辩论。"]],
    M("声音联想（非词源）：bane 像‘悲因’。它是你反复悲惨的原因，也就是生活里的祸根。", "可靠词源：来自 Old English bana（killer, agent of death）；更深来源不确定。早期‘杀手、死亡、毒物’逐步发展为现代‘伤害或毁灭的来源’。", "熟词桥：固定搭配 the bane of my existence；植物名 wolfsbane 也保留‘伤害、毒杀’的古老感觉。", "一颗戴王冠的小石子每天跳进同一只鞋，巨人宣布它是‘我存在的祸根’，石子还要求加冕典礼。", "能致死的毒物或杀手 → 带来毁灭的来源 → 任何持续制造痛苦和麻烦的祸根。", "易混刹车：bane 是可数名词，最常见 the bane of ...；不要与 ban（禁止）混同。baleful 来自 bale，baneful 才由 bane 派生。", "The tiny pebble became the bane of a giant who owned only one shoe.", "小石子成了只有一只鞋的巨人的祸根。"),
    ["What is the most common modern frame for bane?", "bane 最常见的现代结构是什么？", "The bane of someone or something: a persistent source of harm or misery.", "the bane of someone/something：持续造成伤害或痛苦的祸根。"],
    ["Unstable internet is the ________ of everyone on the remote team.", "不稳定的网络是远程团队所有人的祸根。", "A persistent source of frustration is a bane.", "持续制造挫折的来源就是 bane。"], ["boon", "remedy", "blessing"]),

  vocab(199, "banish", "/ˈbæn.ɪʃ/", "transitive verb", "驱逐出境：leave, country; 赶出：force out", "to compel someone to leave a country or place; to drive away or dispel", "驱逐出境；赶出；消除",
    "国王挥动扫帚，把一个坏念头从王国一路扫到月球，并在边境贴上永久禁入令。",
    [["banish someone from a country", "把某人驱逐出境", "The regime banished the journalist from the country.", "该政权把记者驱逐出境。"], ["banish someone to a distant island", "把某人流放到遥远岛屿", "The emperor banished his rival to a distant island.", "皇帝把对手流放到遥远岛屿。"], ["banish fear", "消除恐惧", "Clear evidence helped banish fear from the community.", "清晰证据帮助社区消除恐惧。"]],
    [["leave", "离开", "原表注解 · 结果动作", "leave 可以自愿；banish 表示权威或力量迫使某人离开，施事者与被驱逐者不同。", "She chose to leave the country.", "她选择离开这个国家。"], ["country", "国家；国土", "原表注解 · 驱逐范围", "country 不是 banish 的同义词，而是原表用来限定‘驱逐出境’的地点线索；常见结构 banish someone from a country。", "The writer remained loyal to his country.", "作家始终忠于祖国。"], ["force out", "强行赶出", "原表注解 · 核心方式", "force out 是直白短语；banish 更正式，常含权威命令、长期排除或把抽象事物彻底赶走。", "The board forced the corrupt officer out.", "董事会把腐败官员赶了出去。"], ["exile", "流放；使流亡", "近义词", "exile 强调离开故土及流亡状态；banish 强调权威作出的驱逐行动，也能接 fear、doubt 等抽象宾语。", "The king exiled the rebel leader.", "国王流放了叛军首领。"]],
    M("声音联想（非词源）：banish 像‘搬一室’。命令一下，被驱逐者只好把整间屋子搬走，离开国家。", "可靠词源：Middle English banysshen 借自 Anglo-French banir，核心是由权威宣布某人离境、排除；其历史与 ban 的‘权威命令/公告’义相关。", "熟词桥：banish someone from court/country；再把‘赶出一个地方’延伸成 banish fear/doubt。", "国王用一把比城门还大的扫帚，把叛臣、恐惧和一团乌云一起扫到月球。", "权威迫使人离开国土 → 从某处彻底赶走 → 把恐惧、疑虑等抽象事物驱散。", "易混刹车：banish 是及物动词：a ruler banishes someone；leave 常由离开者自己作主语。deport 专指依法驱逐非公民，范围更窄。", "The king banished fear from the castle, but it rented a room next door.", "国王把恐惧赶出城堡，它却在隔壁租了房。"),
    ["Why is banish stronger than the neutral verb leave?", "为什么 banish 比中性 leave 更强？", "With banish, an external authority or force compels someone to leave or drives something away.", "banish 表示外部权威或力量迫使某人离开，或把某物赶走。"],
    ["The monarch threatened to ________ the disloyal adviser from the kingdom.", "君主威胁要把不忠的顾问驱逐出王国。", "Banish someone from a country or place means expel them by authority.", "banish someone from a country or place 表示由权威将其驱逐。"], ["invite", "retain", "welcome"]),

  vocab(200, "banter", "/ˈbæn.tər/", "noun · verb", "幽默、打趣的（地）谈话：humored", "playful, good-humored conversation or the exchange of teasing remarks", "幽默打趣的谈话；互相逗趣",
    "两只茶壶把笑话像乒乓球一样来回击打，最后连糖罐也加入斗嘴。",
    [["friendly banter", "友善的打趣", "Friendly banter eased the tension before the match.", "赛前友善的打趣缓解了紧张。"], ["exchange banter", "互相说笑逗趣", "The hosts exchanged banter while the audience settled in.", "观众入座时，两位主持人互相说笑。"], ["banter with someone", "与某人打趣", "She bantered with the chef about his enormous hat.", "她拿厨师的巨大帽子与他打趣。"]],
    [["humored", "带有某种情绪的", "原表注解 · 形式提醒", "原表写 humored 作为幽默气氛提示；标准英语通常说 good-humored 或 humorous。banter 是轻松逗趣的交谈，不等于单独的 humored。", "Their teasing remained good-humored.", "他们的调侃始终保持友善。"], ["badinage", "善意打趣；诙谐谈笑", "近义词 · 第188词", "badinage 更书面，专指轻松机智的谈笑；banter 更常用，可作名词或动词。", "The dinner was enlivened by witty badinage.", "机智的谈笑使晚宴活跃起来。"], ["repartee", "机敏应答；妙语连珠", "近义词", "repartee 强调迅速机智的应答；banter 可以只是朋友间轻松来回逗趣，不必句句精妙。", "Her quick repartee delighted the audience.", "她机敏的应答逗乐了观众。"], ["tease", "取笑；逗弄", "易混词", "tease 可以单方面且可能伤人；banter 通常是双方参与、语气轻松的来回交流。", "Do not tease him about a genuine fear.", "不要拿他真正害怕的事取笑他。"]],
    M("声音联想（非词源）：banter 像‘拌他’。你一句我一句，把笑话拌来拌去，就是轻松打趣。", "词源结论：banter 的来源不详（of obscure origin）。不能可靠拆成 ban + -ter，也不要把中文谐音当成真实词源。", "熟词桥：back-and-forth banter 像语言乒乓球；重点是 playful exchange，而非正式论辩。", "两只茶壶用笑话打乒乓球，糖罐每接住一句就笑得喷出方糖，裁判是一把严肃汤匙。", "轻松话语来回交换 → 双方逗趣的谈话；可以是名词，也可以说 banter with someone。", "易混刹车：banter 通常默认双方参与且总体友善，但语境也可能显示越界。名词多作不可数；动词常接 with。", "The teapots bantered until the sugar bowl laughed itself empty.", "茶壶们打趣到糖罐笑得一颗糖也不剩。"),
    ["What social feature usually separates banter from hurtful teasing?", "banter 通常凭什么区别于伤人的 teasing？", "It is generally mutual, playful, and good-humored rather than one-sided cruelty.", "它通常是双方参与、轻松友善的，而不是单方面的刻薄。"],
    ["The colleagues' playful ________ made the long shift feel shorter.", "同事间轻松的打趣让漫长班次显得短些。", "Mutual, playful conversation is banter.", "双方轻松逗趣的谈话就是 banter。"], ["silence", "hostility", "lecture"]),
];

const registerByWord = new Map([
  ["baleful", "GRE 高频 · 文学 / 正式"],
  ["balk", "GRE 高频 · 常用 / 正式"],
  ["balky", "GRE 词汇 · 偏口语（动物 / 机器）"],
  ["ballad", "GRE 词汇 · 常用 / 文学与音乐"],
  ["balloon", "GRE 高频 · 常用比喻"],
  ["balm", "GRE 高频 · 常用 / 文学"],
  ["banal", "GRE 高频 · 正式常用"],
  ["bane", "GRE 高频 · 正式常用"],
  ["banish", "GRE 高频 · 常用 / 正式"],
  ["banter", "GRE 高频 · 常用 / 非正式"],
]);

const comparisonIpa = new Map([
  ["harmful", "/ˈhɑːm.fəl/"],
  ["evil", "/ˈiː.vəl/"],
  ["causing death", "/ˌkɔː.zɪŋ ˈdeθ/"],
  ["ominous", "/ˈɒm.ɪ.nəs/"],
  ["check", "/tʃek/"],
  ["obstacle", "/ˈɒb.stə.kəl/"],
  ["unwillingness", "/ʌnˈwɪl.ɪŋ.nəs/"],
  ["flinch", "/flɪntʃ/"],
  ["refusing", "/rɪˈfjuː.zɪŋ/"],
  ["stubborn", "/ˈstʌb.ən/"],
  ["recalcitrant", "/rɪˈkæl.sɪ.trənt/"],
  ["poem", "/ˈpəʊ.ɪm/"],
  ["lyric", "/ˈlɪr.ɪk/"],
  ["epic", "/ˈep.ɪk/"],
  ["increase", "/ɪnˈkriːs/"],
  ["swell", "/swel/"],
  ["skyrocket", "/ˈskaɪˌrɒk.ɪt/"],
  ["inflate", "/ɪnˈfleɪt/"],
  ["sweet-smelling oil", "/ˌswiːtˌsmel.ɪŋ ˈɔɪl/"],
  ["soothe", "/suːð/"],
  ["pleasant smell", "/ˌplez.ənt ˈsmel/"],
  ["salve", "/sælv/"],
  ["trite", "/traɪt/"],
  ["hackneyed", "/ˈhæk.nid/"],
  ["mundane", "/mʌnˈdeɪn/"],
  ["original", "/əˈrɪdʒ.ən.əl/"],
  ["ruin", "/ˈruː.ɪn/"],
  ["kill or injure a living thing", "/ˌkɪl ɔːr ˈɪn.dʒər ə ˌlɪv.ɪŋ ˈθɪŋ/"],
  ["scourge", "/skɜːdʒ/"],
  ["baleful", "/ˈbeɪl.fəl/"],
  ["leave", "/liːv/"],
  ["country", "/ˈkʌn.tri/"],
  ["force out", "/ˌfɔːs ˈaʊt/"],
  ["exile", "/ˈek.saɪl/"],
  ["humored", "/ˈhjuː.mɚd/"],
  ["badinage", "/ˈbæd.ɪ.nɑːʒ/"],
  ["repartee", "/ˌrep.ɑːˈtiː/"],
  ["tease", "/tiːz/"],
]);

for (const config of all) {
  config.register = registerByWord.get(config.word);
  for (const item of config.comparisons) item[6] = comparisonIpa.get(item[0]);
}

const group = (start) => all.slice(start - 191, start - 186);

export const set39 = compactSet(39, "The Moon-Spoon Orchestra", group(191), {
  title: "The Moon-Spoon Orchestra",
  targetForms: ["baleful", "balked", "balky", "ballad", "ballooned"],
  plain: "A baleful moon balked at conducting a balky orchestra, so a ballad about soup ballooned into a three-hour opera performed by spoons.",
  translation: "一轮凶兆般的月亮拒绝指挥一支倔强的乐团，于是，一首关于汤的歌谣膨胀成由勺子演出的三小时歌剧。",
});

export const set40 = compactSet(40, "The Turnip Teapot", group(196), {
  title: "The Turnip Teapot",
  targetForms: ["balm", "banal", "bane", "banished", "banter"],
  plain: "After a jar of balm called the king's speech banal, a singing turnip became the bane of the pantry, banished the royal tuba, and replaced every law with banter.",
  translation: "一罐香膏说国王的演讲陈腐后，一只会唱歌的萝卜成了食品储藏室的祸根，赶走皇家大号，并用打趣取代每一条法律。",
});
