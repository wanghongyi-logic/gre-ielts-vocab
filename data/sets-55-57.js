import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(271, "buck", "/bʌk/", "verb", "阻止，反对：refuse assent; 转移，交接：shift possession", "to resist or oppose; to pass responsibility to another", "反对，抵制；推卸、转交责任",
    "一头公鹿用角顶回命令，又把责任文件挑到别人桌上。",
    [["buck the trend", "逆势而行", "The small publisher bucked the trend and increased print sales.", "这家小出版社逆势而行，提高了纸质书销量。"], ["buck against authority", "反抗权威", "The committee bucked against authority when the order seemed unjust.", "命令显得不公时，委员会反抗了权威。"], ["pass the buck", "推卸责任", "No one should pass the buck when safety is at risk.", "安全受到威胁时，任何人都不应推卸责任。"]],
    [["refuse assent", "拒绝同意", "原表注解 · 反对", "refuse assent 直说不批准；buck 更有顶撞压力、逆势反抗的动态感。", "Two directors refused assent to the merger.", "两名董事拒绝同意合并。"], ["shift possession", "转移占有或责任", "原表注解 · 交接", "shift possession 强调物品转手；pass the buck 固定表示把责任推给别人。", "The receipt records when the dealer shifted possession of the painting.", "收据记录了经销商转移画作所有权的时间。"], ["resist", "抵制；抗拒", "近义词", "resist 是宽泛抗拒；buck 常暗示像动物顶撞一样反抗既定趋势或控制。", "Residents resisted the sudden closure.", "居民抵制突然关闭设施的决定。"]],
    M("声音联想（非词源）：buck 像‘不克’服命令，反而用角顶回去。", "可靠词源：buck 的‘公鹿’义来自 Old English bucca；‘猛然顶撞、反抗’由动物动作发展而来。pass the buck 的责任义另有纸牌游戏历史。", "熟词桥：a bucking horse 会猛跳反抗；buck the trend 就是对趋势反向用力。", "公鹿把命令顶回墙上，又把写着 RESPONSIBILITY 的圆牌踢给下一张桌子。", "动物猛顶 → 抗拒控制；责任筹码被传走 → 推卸责任。", "易混刹车：buck the trend 是逆势；pass the buck 是推责。buck 还可口语指美元，语境完全不同。", "The buck bucked the rule and passed the paperwork downhill.", "公鹿反抗规则，又把文件推给了下游。"),
    ["What does buck add to the neutral verb oppose?", "buck 比中性的 oppose 多什么画面？", "It suggests forceful resistance against pressure, control, or a prevailing trend.", "它带有顶住压力、控制或主流趋势而反抗的画面。"],
    ["The startup managed to ________ the industry trend and keep growing.", "这家初创企业成功逆行业趋势而继续增长。", "Buck the trend means resist or move against a prevailing pattern.", "buck the trend 表示抵抗主流模式、逆势而行。"], ["follow", "endorse", "obey"]),

  vocab(272, "budge", "/bʌdʒ/", "verb", "（使）改变立场或态度：alter a position; 停止抵抗，屈服：cease resistance", "to move slightly or make someone change a firm position", "挪动一点；使改变立场；让步",
    "一块巨石抱着自己的观点，十头牛也不能让它挪动一厘米。",
    [["refuse to budge", "拒绝让步或移动", "The union refused to budge on basic safety standards.", "工会拒绝在基本安全标准上让步。"], ["budge from a position", "改变立场", "Neither side would budge from its original position.", "双方都不肯改变原有立场。"], ["budge an inch", "挪动一点；作丝毫让步", "The stuck window would not budge an inch.", "卡住的窗户一动也不动。"]],
    [["alter a position", "改变立场", "原表注解 · 态度", "alter a position 是中性说明；budge 常用于原本坚决的人在压力下作一点改变。", "The senator altered her position after reviewing the evidence.", "参议员审阅证据后改变了立场。"], ["cease resistance", "停止抵抗", "原表注解 · 屈服", "cease resistance 表示完全停止；budge 可能只是一点点移动或让步。", "The defenders ceased resistance at dawn.", "守军在黎明停止抵抗。"], ["yield", "让步；屈服", "近义词", "yield 可指完全屈服或让路；budge 常强调此前纹丝不动，终于有微小变化。", "Management yielded to public pressure.", "管理层向公众压力让步。"]],
    M("声音联想（非词源）：budge 像‘不挪这’，巨石说‘我就不挪这儿’。", "可靠词源：经 Middle French bougier，源头与 Late Latin bullicare（搅动、移动）有关；不是中文谐音。", "熟词桥：常见否定搭配 won't budge，把‘一毫米也不动’延伸到立场不变。", "巨石穿着西装参加谈判，十头牛拉它，它仍举牌写着 NOT ONE INCH。", "空间上稍微移动 → 态度上作出一点让步。", "易混刹车：budge 通常是不及物或使役用法；在立场语境中常见 budge on/from，不是普通 change 的完全替代。", "The stone would not budge, even after the hill politely moved away.", "即使山丘礼貌地移开了，那块石头仍不肯动。"),
    ["Why does won't budge sound stronger than won't move?", "为什么 won't budge 比 won't move 更有态度？", "It often implies stubborn resistance to pressure, not just lack of physical motion.", "它往往暗示顽固抵抗压力，而不只是没有移动。"],
    ["After six hours of negotiation, neither company would ________ on price.", "谈判六小时后，两家公司都不肯在价格上让步。", "Budge on a point means modify a firm position.", "budge on 某点表示改变坚定立场。"], ["expand", "approve", "advance"]),

  vocab(273, "bulge", "/bʌldʒ/", "noun · verb", "凸起：protuberant; 比赛中的优势地位：more favorable condition; 暴涨，突增，在数目或数量上突然而且是临时性的增加：sudden, usually temporary increase; 充满：copiously supplied", "to swell outward; a protrusion, temporary surge, or advantage", "凸起；鼓胀；暂时激增；优势",
    "行李箱侧面鼓出一个大包，里面的数字也突然暴涨。",
    [["a bulge in the wall", "墙上的凸起", "Engineers inspected a suspicious bulge in the wall.", "工程师检查了墙上可疑的凸起。"], ["a bulge in demand", "需求的暂时激增", "The holiday caused a brief bulge in demand for trains.", "假期造成火车需求短暂激增。"], ["hold the bulge", "占据优势", "The home team held a narrow bulge in the final quarter.", "主队在最后一节保持微弱优势。"], ["a bag bulging with books", "塞满书而鼓起的包", "He carried a bag bulging with library books.", "他提着一个塞满图书馆书籍而鼓起的包。"]],
    [["protuberant", "突出的；凸起的", "原表注解 · 形状", "protuberant 是正式形容词；bulge 可作名词或动词，描写表面向外鼓起。", "The statue has a protuberant brow.", "雕像有突出的眉骨。"], ["more favorable condition", "更有利的地位", "原表注解 · 优势", "该短语解释比赛中的领先；bulge 在此是口语化的小幅优势，而 advantage 更通用。", "The early goal put the team in a more favorable condition.", "早早进球让球队处于更有利地位。"], ["sudden, usually temporary increase", "突然且通常短暂的增加", "原表注解 · 数量", "这是 bulge 的典型比喻：数量像表面一样暂时鼓出；surge 更强调猛烈上冲。", "A sudden, usually temporary increase in births strained the schools.", "出生人数的突然短期增长给学校带来压力。"], ["copiously supplied", "大量装有的", "原表注解 · 充满", "copiously supplied 强调供应丰富；bulging with 强调容器被塞到外形鼓起。", "The pantry was copiously supplied with grain.", "食品储藏室备有大量谷物。"], ["swell", "膨胀；增大", "近义词", "swell 范围较广；bulge 特指局部向外凸或数量形成突出峰值。", "Her ankle began to swell.", "她的脚踝开始肿胀。"]],
    M("声音联想（非词源）：bulge 像‘包儿挤’，包里东西挤得侧面鼓出来。", "词源较可靠但深层不确定：Middle English bulge 与古法语 bouge（皮袋）相关；不要用中文谐音解释真实来源。", "熟词桥：bulging muscles 与 a bulging bag 都有‘向外鼓’的轮廓。", "行李箱吞下三百本书，肚皮鼓起，价格标签也跟着突然暴涨。", "局部向外凸起 → 容器塞满 → 数量形成短暂峰值 → 比赛领先一点。", "易混刹车：balloon 强调持续迅速膨胀；bulge 常是局部或暂时的突出。", "The suitcase bulged until its socks requested a larger apartment.", "行李箱鼓到连袜子都要求换大公寓。"),
    ["What common image unites a wall bulge and a bulge in demand?", "墙面凸起与需求激增共享什么图像？", "Both form a noticeable outward bump or temporary peak above the usual level.", "二者都形成高出正常水平的明显鼓包或临时峰值。"],
    ["Hospitals prepared for a temporary ________ in winter admissions.", "医院为冬季入院人数的暂时激增做准备。", "A temporary upward bump in numbers is a bulge.", "数量形成暂时向上鼓包可用 bulge。"], ["decline", "vacancy", "balance"]),

  vocab(274, "bully", "/ˈbʊl.i/", "noun · verb · adjective", "欺凌弱小者：intimidating manner; 最好的，最棒的：best", "a person who intimidates weaker people; to intimidate; excellent (dated)", "欺凌者；欺负；极好的（旧式）",
    "大个子用阴影吓唬小动物，旁边旧时代的海报却写着 BULLY! 表示太棒了。",
    [["a school bully", "校园恶霸", "The school bully targeted children who ate alone.", "校园恶霸专门欺负独自吃饭的孩子。"], ["bully someone into doing something", "胁迫某人做某事", "They tried to bully the clerk into changing the record.", "他们试图胁迫职员篡改记录。"], ["a bully idea", "一个绝妙的主意（旧式）", "The captain called it a bully idea, using the word's dated sense.", "船长称这是个绝妙主意，用的是该词的旧义。"]],
    [["intimidating manner", "威吓的方式", "原表注解 · 欺凌", "intimidating manner 描述方式；bully 指反复利用力量差距威吓弱者的人或行为。", "He spoke in an intimidating manner.", "他说话方式咄咄逼人。"], ["best", "最好的", "原表注解 · 旧义", "best 是现代中性最高级；bully 表示 excellent 的形容词义已过时，常见于历史文本或 bully for you。", "This is the best route through the valley.", "这是穿过山谷的最佳路线。"], ["intimidate", "威吓", "近义词", "intimidate 可发生一次且对象不一定弱；bully 常含持续滥用优势、欺负弱小。", "The threat was designed to intimidate witnesses.", "威胁旨在恐吓证人。"]],
    M("声音联想（非词源）：bully 像‘不理’，恶霸不理规则，只会吓人。", "词义史可靠：bull(y) 经 Dutch boel，早期曾指爱人、好伙伴，后来经历‘好汉’到‘恃强凌弱者’的转变；细节复杂，不宜凭现代 bull 硬猜。", "熟词桥：anti-bullying 指反欺凌；bully for you 是保留旧式赞叹义的表达。", "恶霸吹大自己的影子吓小鼠，古老海报却冲他喊‘Bully!’表示‘太棒了’。", "亲昵称呼的历史变化最终落到现代核心：用力量差距威吓；旧式形容词保留‘极好’。", "易混刹车：现代使用几乎总是负面的欺凌；把 bully 当‘最棒的’会显得古旧或讽刺。", "The bully frightened the mice, but his enormous shadow was only cardboard.", "恶霸吓唬老鼠，但他的巨大影子只是纸板。"),
    ["Which sense of bully is safe in ordinary modern prose?", "现代普通写作中 bully 的哪个义最稳妥？", "The negative noun or verb meaning an intimidator or to intimidate weaker people.", "最稳妥的是负面名词或动词：欺凌者，或欺负弱者。"],
    ["The manager tried to ________ staff into working without pay.", "经理试图胁迫员工无偿工作。", "Bully someone into something means use intimidation to force compliance.", "bully someone into 表示用威吓迫使服从。"], ["comfort", "invite", "reward"]),

  vocab(275, "bumptious", "/ˈbʌmp.ʃəs/", "adjective", "专横傲慢的，自以为是的：superiority", "offensively self-important, pushy, and overconfident", "傲慢自负的；盛气凌人的",
    "一只小茶杯踩着高跷，把鼻子顶到云里，命令整套餐具鼓掌。",
    [["a bumptious official", "傲慢专横的官员", "A bumptious official dismissed every local concern.", "一名傲慢官员无视所有当地关切。"], ["a bumptious manner", "自以为是的态度", "His bumptious manner alienated potential allies.", "他自以为是的态度疏远了潜在盟友。"], ["sound bumptious", "听起来傲慢自负", "The proposal sounded bumptious rather than confident.", "这项提议听起来不是自信，而是傲慢自负。"]],
    [["superiority", "优越感；高人一等", "原表注解 · 态度", "superiority 可是客观更优，也可指优越感；bumptious 专门批评把自我优越感粗鲁地表现出来。", "Her technical superiority was obvious.", "她在技术上的优势很明显。"], ["arrogant", "傲慢的", "近义词", "arrogant 强调自认高人一等；bumptious 还常带吵闹、强推自己、令人讨厌的活跃感。", "The arrogant speaker ignored all questions.", "傲慢的演讲者无视所有问题。"], ["pushy", "爱出风头强求的", "近义词", "pushy 强调强迫推进；bumptious 同时带自负和不顾他人的专横。", "The pushy salesperson would not leave.", "强势的销售员不肯离开。"]],
    M("声音联想（非词源）：bumptious 像 bump（撞）+ 自负气势，走到哪儿都把别人撞开。", "可靠构词线索：19 世纪英语由 bump 加带贬义色彩的扩展形式形成，具体造词路径并不完全确定。", "熟词桥：bump into people 的身体冲撞，帮助记住 bumptious 在社交上横冲直撞。", "小茶杯踩高跷冲进宴会，撞开盘子，并宣布自己是餐桌皇帝。", "横冲直撞的外在动作 → 强推自己、傲慢自负的社交态度。", "易混刹车：confident 可褒义；bumptious 必然带冒犯性自负，不可用作中性称赞。", "The bumptious teacup declared itself emperor of the entire kitchen.", "傲慢的茶杯宣布自己是整个厨房的皇帝。"),
    ["What makes bumptious more negative than confident?", "bumptious 为什么比 confident 更负面？", "It combines self-importance with pushy disregard for other people.", "它把自以为重要与强势无视他人结合在一起。"],
    ["The candidate's ________ tone made even supporters uncomfortable.", "候选人傲慢自负的语气连支持者都感到不适。", "A pushy display of self-importance is bumptious.", "强势展示自我优越感就是 bumptious。"], ["modest", "courteous", "diffident"]),

  vocab(276, "bungle", "/ˈbʌŋ.ɡəl/", "verb · noun", "办遭，失败：work clumsily", "to perform a task clumsily and spoil it", "笨手笨脚地搞砸；失误",
    "笨拙厨师把修钟的扳手放进汤里，又用面条修钟，两个任务全搞砸。",
    [["bungle the job", "把工作搞砸", "The contractor bungled the job by ignoring the plans.", "承包商无视图纸，把工作搞砸了。"], ["bungle an investigation", "办砸调查", "Officials bungled the investigation and lost crucial evidence.", "官员们办砸了调查，丢失关键证据。"], ["a costly bungle", "代价高昂的失误", "A costly bungle delayed the launch for months.", "一次代价高昂的失误使发布推迟数月。"]],
    [["work clumsily", "笨拙地工作", "原表注解 · 核心方式", "work clumsily 只描写方式；bungle 通常还包含因笨拙而把结果搞坏。", "He worked clumsily with the unfamiliar tool.", "他使用不熟悉的工具时动作笨拙。"], ["botch", "拙劣地弄坏", "近义词", "botch 与 bungle 很近；botch 更直接聚焦成品糟糕，bungle 常突出执行过程混乱笨拙。", "The repair shop botched the paintwork.", "修理厂把喷漆做坏了。"], ["mismanage", "管理不善", "近义词", "mismanage 多指组织、资金或项目管理失当；bungle 可用于任何具体任务。", "The board mismanaged the pension fund.", "董事会管理养老基金不善。"]],
    M("声音联想（非词源）：bungle 像‘笨哥’，笨哥越帮忙越把事情搞砸。", "词源结论：bungle 约 16 世纪出现，来源不明；有北欧语言联系的猜测，但不足以当作确定词源。", "熟词桥：bungler 是笨手笨脚把事办坏的人；-le 结尾不要误当可拆后缀。", "厨师用扳手搅汤、用面条修钟，厨房和钟表店同时宣布失败。", "笨拙执行 → 造成可见失败或损坏。", "易混刹车：make a mistake 可是偶发小错；bungle 暗示无能或笨拙导致整体办砸。", "The mechanic bungled the soup while the chef repaired the engine.", "机械师搞砸了汤，而厨师正在修发动机。"),
    ["What result is normally implied when someone bungles a task?", "某人 bungle 一项任务时通常暗示什么结果？", "The clumsy performance spoils the task or produces a poor outcome.", "笨拙执行把任务搞坏，或造成糟糕结果。"],
    ["A missing label caused the laboratory to ________ the entire shipment.", "缺少标签使实验室把整批货处理砸了。", "Bungle describes spoiling work through clumsy handling.", "bungle 表示因笨拙处理而把工作搞砸。"], ["perfect", "coordinate", "repair"]),

  vocab(277, "buoy", "/ˈbuː.i/", "verb", "使充满勇气和力量，使振作：courage or strength", "to keep afloat or raise someone's courage and spirits", "使漂浮；鼓舞，使振作",
    "海上浮标托住一颗泄气的心，把它顶回阳光里。",
    [["buoy someone's spirits", "振奋某人的精神", "The encouraging letter buoyed her spirits.", "鼓励信使她振作起来。"], ["be buoyed by support", "因支持而受到鼓舞", "The volunteers were buoyed by community support.", "志愿者因社区支持而受到鼓舞。"], ["buoy up confidence", "增强信心", "Early success buoyed up the team's confidence.", "早期成功增强了团队信心。"]],
    [["courage", "勇气", "原表注解 · 心理力量", "courage 是内在品质；buoy 是外部因素像浮力一样把勇气和情绪托高。", "It took courage to report the fraud.", "举报欺诈需要勇气。"], ["strength", "力量", "原表注解 · 支撑", "strength 可指身体或精神力量；buoy 强调提供支撑，使人不下沉。", "Her quiet strength reassured the group.", "她沉静的力量让团队安心。"], ["encourage", "鼓励", "近义词", "encourage 是一般性给予信心；buoy 更形象地表示把低落情绪托起来。", "Teachers encouraged the hesitant student.", "老师们鼓励犹豫的学生。"]],
    M("声音联想（非词源）：buoy 的美音像‘布衣’，布衣浮标把落水的信心托起来。", "可靠词源：名词经 Middle Dutch boeye、Old French boie 等进入英语，最终与表示锁链或标记的拉丁词有关；动词义由浮标托浮发展。", "熟词桥：a life buoy 救生圈能托住身体；good news buoys spirits 托住心情。", "浮标长出双手，把一颗灰色的心从海底托到太阳旁边。", "物理上保持漂浮 → 比喻上防止情绪下沉、使人振作。", "易混刹车：buoy 拼写不直接提示发音；作动词常见 be buoyed by 与 buoy someone's spirits。", "The tiny buoy lifted a gloomy whale's spirits above the clouds.", "小浮标把忧郁鲸鱼的精神托到了云上。"),
    ["Why is buoy a vivid synonym of encourage?", "为什么 buoy 是 encourage 的形象近义词？", "It pictures confidence or spirits being kept afloat instead of sinking.", "它把信心或精神描绘成不再下沉、被托浮起来。"],
    ["Investors were ________ by the unexpectedly strong results.", "投资者因意外强劲的业绩而受到鼓舞。", "Be buoyed by good news means have one's confidence lifted.", "be buoyed by 好消息表示信心被提振。"], ["discouraged", "burdened", "deflated"]),

  vocab(278, "buoyant", "/ˈbɔɪ.ənt/", "adjective", "有浮力的：floating; 心情好的：good mood or disposition", "able to float; cheerful, resilient, or economically lively", "有浮力的；轻快乐观的；活跃的",
    "一只橡皮鸭浮在水面，头顶还飘着一张笑脸气球。",
    [["a buoyant material", "有浮力的材料", "Cork is sufficiently buoyant to support the marker.", "软木浮力足以支撑标记物。"], ["a buoyant mood", "轻快乐观的心情", "A buoyant mood filled the studio after the award.", "获奖后，工作室洋溢着轻快乐观的气氛。"], ["remain buoyant", "保持活跃或乐观", "Consumer demand remained buoyant despite the uncertainty.", "尽管存在不确定性，消费需求仍保持活跃。"]],
    [["floating", "漂浮的", "原表注解 · 物理义", "floating 说明处于水面；buoyant 强调材料本身有向上的浮力、容易漂浮。", "Leaves were floating on the pond.", "树叶漂浮在池塘上。"], ["good mood or disposition", "好心情或开朗性情", "原表注解 · 情绪义", "该短语直说情绪良好；buoyant 还暗示轻快、有弹性、不易被挫折压沉。", "She remained in a good mood throughout the delay.", "整个延误期间她都保持好心情。"], ["cheerful", "愉快的", "近义词", "cheerful 表示快乐；buoyant 多一层精神有上浮力、充满信心的感觉。", "His cheerful greeting relaxed everyone.", "他愉快的问候让大家放松。"]],
    M("声音联想（非词源）：buoyant 与 buoy 同家族，看到浮标就想到‘有浮力、情绪向上’。", "可靠构词：buoy + -ant，来自法语/英语发展，表示具有像 buoy 那样托浮的性质。", "熟词桥：buoyant economy 像浮在水面的球，保持活跃而不下沉。", "橡皮鸭背着笑脸气球，即使雨云坐在头上也继续向上漂。", "有物理浮力 → 情绪不下沉 → 市场或需求保持活跃。", "易混刹车：buoyant 不只是 happy；还可形容材料、市场和需求。拼写中 uoy 对应 /bɔɪ/。", "The buoyant duck floated through Monday with a smile tied to its hat.", "那只乐观的鸭子把笑脸系在帽子上，漂过了星期一。"),
    ["What quality links buoyant cork and a buoyant personality?", "有浮力的软木与乐观性格由什么品质相连？", "Both resist sinking—physically in water or emotionally under pressure.", "二者都不易下沉：一个在水中，一个在压力下的情绪中。"],
    ["The market stayed surprisingly ________ after the weak forecast.", "在疲弱预测后，市场仍出人意料地活跃。", "A lively, resilient market can be described as buoyant.", "活跃且有韧性的市场可形容为 buoyant。"], ["morose", "submerged", "sluggish"]),

  vocab(279, "burgeon", "/ˈbɜː.dʒən/", "verb", "迅速成长扩大，蓬勃发展：grow, rapidly, flourish", "to grow, expand, or develop rapidly", "迅速成长；蓬勃发展",
    "一颗小芽在秒表旁飞快长成覆盖城市的花树。",
    [["a burgeoning industry", "蓬勃发展的行业", "The city supports a burgeoning design industry.", "这座城市支持一个蓬勃发展的设计行业。"], ["burgeon into a movement", "迅速发展成运动", "The neighborhood project burgeoned into a national movement.", "社区项目迅速发展成全国性运动。"], ["burgeon rapidly", "迅速蓬勃发展", "Online demand burgeoned rapidly during the spring.", "春季线上需求迅速增长。"]],
    [["grow", "成长；增长", "原表注解 · 上位词", "grow 可慢可快；burgeon 明确带迅速、旺盛展开的感觉。", "The tree grows a little each year.", "这棵树每年长高一点。"], ["rapidly", "迅速地", "原表注解 · 速度", "rapidly 只是副词；burgeon 把快速与像新芽繁茂生长的图像合并。", "The infection spread rapidly.", "感染迅速扩散。"], ["flourish", "繁荣；茁壮成长", "原表注解 · 结果", "flourish 强调发展良好；burgeon 更强调从较小规模快速扩大，两者可重叠。", "Independent theaters flourished in the district.", "独立剧院在该区蓬勃发展。"], ["proliferate", "激增；大量繁殖", "近义词", "proliferate 强调数量大量增加；burgeon 可指规模、影响或复杂度快速成长。", "Small cafés proliferated near the station.", "车站附近的小咖啡馆激增。"]],
    M("声音联想（非词源）：burgeon 像‘蹦着长’，嫩芽蹦一下就长一层楼。", "可靠词源：Middle English burgeonen 来自 Anglo-French burgeoner，与 burgeon（芽、嫩枝）有关；核心意象确实是发芽。", "熟词桥：a burgeoning market 就像一颗新芽突然枝叶繁茂。", "嫩芽戴着秒表，每响一秒就长出十层树冠，最后把云当成花盆。", "植物发芽抽枝 → 事物迅速发展壮大。", "易混刹车：burgeon 不等于任何 increase；它偏向有生命力、展开式的快速成长。", "The tiny seed burgeoned until the clouds asked it to trim the branches.", "小种子迅速长大，连云都请它修剪枝条。"),
    ["What growth pattern does burgeon imply?", "burgeon 暗示怎样的增长模式？", "Rapid, vigorous development, often from a small beginning.", "从较小起点迅速而旺盛地发展。"],
    ["A local workshop ________ into an international festival.", "一个本地工作坊迅速发展成国际节庆。", "Burgeon into describes vigorous expansion into a larger form.", "burgeon into 表示蓬勃扩展为更大的形态。"], ["shrivelled", "stagnated", "contracted"]),

  vocab(280, "burlesque", "/bɜːˈlesk/", "noun · verb", "夸张滑稽地模仿以嘲弄他人的文学艺术作品，恶搞：make fun of", "an exaggerated comic imitation that mocks its subject", "滑稽模仿；讽刺性恶搞",
    "演员戴着三米高王冠，夸张模仿国王连打喷嚏都要颁法令。",
    [["a political burlesque", "政治讽刺滑稽剧", "The troupe staged a political burlesque of the election.", "剧团上演了一出恶搞选举的政治滑稽剧。"], ["burlesque a ceremony", "夸张模仿并嘲弄仪式", "The sketch burlesqued the solemn ceremony.", "小品夸张模仿并嘲弄了庄严仪式。"], ["a burlesque imitation", "滑稽夸张的模仿", "Her burlesque imitation exposed the speech's empty grandeur.", "她滑稽夸张的模仿揭露了演讲空洞的宏大。"]],
    [["make fun of", "取笑；嘲弄", "原表注解 · 功能", "make fun of 是日常宽泛表达；burlesque 特指通过夸张模仿来制造滑稽讽刺。", "The cartoon made fun of bureaucratic delays.", "漫画嘲笑官僚拖延。"], ["parody", "戏仿；仿作", "近义词", "parody 模仿特定作品或风格以搞笑或评论；burlesque 往往更粗放夸张，把庄严题材降格处理。", "The film is a parody of spy thrillers.", "这部电影是对间谍惊悚片的戏仿。"], ["satire", "讽刺作品", "近义词", "satire 以批评社会弊端为核心，不一定模仿；burlesque 主要靠夸张表演和模仿。", "The novel uses satire to attack corruption.", "小说用讽刺抨击腐败。"]],
    M("声音联想（非词源）：burlesque 像‘不真实’，演员故意演得离谱不真实来嘲弄。", "可靠词源：来自 French burlesque，再追溯到 Italian burlesco，源于 burla（玩笑、嘲弄）。", "熟词桥：parody + exaggeration = burlesque 的核心课堂义。", "演员戴三米王冠，用扩音器宣布自己的一声喷嚏是国家史诗。", "玩笑与嘲弄 → 用夸张模仿把严肃对象变得滑稽。", "易混刹车：现代娱乐语境中 burlesque 也可指歌舞杂耍表演；GRE 注解重点是夸张讽刺模仿。", "The burlesque king issued a royal decree every time he sneezed.", "滑稽剧里的国王每打一次喷嚏就颁一道王令。"),
    ["What technique distinguishes burlesque from a general joke?", "burlesque 与一般笑话相比，有何典型手法？", "It uses exaggerated comic imitation to ridicule a subject or style.", "它用夸张的滑稽模仿来嘲弄对象或风格。"],
    ["The sketch was a brilliant ________ of the pompous awards ceremony.", "这段小品是对浮夸颁奖礼的精彩恶搞。", "An exaggerated comic imitation is a burlesque.", "夸张的滑稽模仿就是 burlesque。"], ["tribute", "documentary", "endorsement"]),

  vocab(281, "burnish", "/ˈbɜː.nɪʃ/", "verb", "擦亮，磨光：make smooth or glossy", "to polish until smooth and glossy; to enhance a reputation", "擦亮，磨光；提升形象",
    "工匠把铜盾擦到像太阳，盾里连声誉星级也亮了起来。",
    [["burnish the metal", "把金属擦亮", "The artisan burnished the metal with a soft cloth.", "工匠用软布把金属擦亮。"], ["burnish a reputation", "提升声誉", "The successful rescue burnished the agency's reputation.", "成功救援提升了该机构的声誉。"], ["a burnished surface", "磨得光亮的表面", "Light moved across the burnished surface.", "光线掠过磨得光亮的表面。"]],
    [["make smooth or glossy", "使光滑或有光泽", "原表注解 · 实体义", "该短语解释结果；burnish 特别指通过摩擦、打磨获得光滑亮泽。", "Wax made the wood smooth and glossy.", "蜡使木头光滑有光泽。"], ["polish", "擦亮；润色", "近义词", "polish 更通用，也可改进技能或文本；burnish 更书面，常见金属光泽和声誉提升。", "She polished the silver before dinner.", "晚餐前她擦亮了银器。"], ["enhance", "增强；提升", "近义词 · 比喻", "enhance 可提升任何品质；burnish a reputation 借擦亮表面的图像强调改善公众形象。", "The new evidence enhanced his credibility.", "新证据增强了他的可信度。"]],
    M("声音联想（非词源）：burnish 像‘把亮儿弄上’，越擦越亮。", "可靠词源：Middle English burnishen 经 Anglo-French burniss-，与 brun（棕色、发亮）相关；具体更深层有争议。", "熟词桥：polish silver 与 burnish a reputation 都是在去暗斑、增光。", "工匠擦盾牌，盾牌亮到把太阳戴上墨镜，同时机构评分升到五颗星。", "磨去暗淡、产生光泽 → 去除形象污点、提升声誉。", "易混刹车：burnish 不等于 burn；两词拼写相近但意义无关。", "The knight burnished his shield until the sun complained about the glare.", "骑士把盾擦得锃亮，太阳都抱怨刺眼。"),
    ["How does burnish develop its figurative reputation sense?", "burnish 如何发展出提升声誉的比喻义？", "Polishing a dull surface becomes improving a public image until it shines.", "把暗淡表面擦亮，引申为改善公众形象使其发光。"],
    ["The award helped ________ the scientist's international reputation.", "该奖项帮助提升了科学家的国际声誉。", "Burnish a reputation means make it appear more impressive.", "burnish a reputation 表示让声誉更加光彩。"], ["tarnish", "damage", "obscure"]),

  vocab(282, "buttress", "/ˈbʌt.rəs/", "noun · verb", "扶墙：supporting, wall building; 为···提供支撑的证据或者信息：provide evidence or information for", "a projecting support for a wall; to strengthen an argument with evidence", "扶壁；支撑；用证据加强",
    "石头扶壁一手撑住城墙，一手把证据文件顶在论点下面。",
    [["a stone buttress", "石扶壁", "A stone buttress supports the cathedral wall.", "一座石扶壁支撑着大教堂的墙。"], ["buttress an argument", "加强论点", "Recent data buttress the argument for early treatment.", "最新数据为早期治疗的论点提供支持。"], ["be buttressed by evidence", "得到证据支撑", "The claim is buttressed by independent evidence.", "该主张得到独立证据支撑。"]],
    [["supporting, wall building", "支撑墙体的建筑结构", "原表注解 · 实体义", "该短语描述建筑功能；buttress 是从墙面伸出、抵抗侧向压力的具体扶壁。", "The supporting wall structure was repaired.", "支撑墙体的结构得到修复。"], ["provide evidence or information for", "提供证据或信息以支持", "原表注解 · 比喻义", "这是 buttress 作动词的核心比喻：证据像扶壁一样防止论点倒塌。", "The survey provides evidence for the policy change.", "调查为政策调整提供证据。"], ["bolster", "加强；支撑", "近义词", "bolster 可支持信心、价格或观点；buttress 更正式，常强调结构性证据支撑。", "The grant bolstered local research.", "资助加强了当地研究。"]],
    M("声音联想（非词源）：buttress 像‘把它支’，把墙和论点都支住。", "可靠词源：来自 Anglo-French buter（顶住、支撑）相关形式；建筑名词先出现，随后产生动词和比喻义。", "熟词桥：看大教堂 flying buttress；把 evidence 想成论点外侧的石扶壁。", "一座石扶壁戴眼镜，给城墙递砖，也给演讲者递统计报告。", "物理支撑墙体 → 用证据和信息支撑主张。", "易混刹车：buttress 不是简单同意；它要求实际支撑材料，尤其 evidence/data。", "The argument stood upright only because three statistics acted as buttresses.", "这个论点能站直，只因三项统计数据充当扶壁。"),
    ["What does evidence do when it buttresses a claim?", "证据 buttress 一项主张时做了什么？", "It gives structural support that makes the claim stronger and harder to overturn.", "它提供结构性支撑，使主张更强、更难被推翻。"],
    ["The newly discovered letters ________ the historian's interpretation.", "新发现的信件支撑了历史学家的解释。", "Documents can buttress an interpretation by supplying evidence.", "文献可通过提供证据来 buttress 一种解释。"], ["undermine", "contradict", "weaken"]),

  vocab(283, "byzantine", "/bɪˈzæn.tiːn/", "adjective", "错综复杂的：complicated, secretive, interrelated", "excessively complicated, intricate, and often secretive", "错综复杂的；隐秘迂回的",
    "官僚迷宫里每扇门后还有七张表格和一条秘密通道。",
    [["a byzantine bureaucracy", "错综复杂的官僚体系", "Applicants struggled with a byzantine bureaucracy.", "申请者苦于应付错综复杂的官僚体系。"], ["byzantine rules", "繁复难懂的规则", "The contract contains byzantine rules about refunds.", "合同包含繁复难懂的退款规则。"], ["a byzantine plot", "盘根错节的阴谋", "The novel follows a byzantine plot of secret alliances.", "小说讲述一个由秘密联盟织成的盘根错节阴谋。"]],
    [["complicated", "复杂的", "原表注解 · 核心", "complicated 可是中性难懂；byzantine 更强烈，暗示层层缠绕、过度复杂。", "The installation process is complicated.", "安装过程很复杂。"], ["secretive", "隐秘的；守口如瓶的", "原表注解 · 氛围", "secretive 强调不愿公开；byzantine 只有在政治、阴谋等语境中才常附带隐秘感。", "The committee was secretive about its funding.", "委员会对资金情况秘而不宣。"], ["interrelated", "相互关联的", "原表注解 · 结构", "interrelated 可清晰有序；byzantine 表示关系多到形成难以追踪的迷宫。", "The three problems are closely interrelated.", "这三个问题密切相关。"], ["labyrinthine", "迷宫般复杂的", "近义词", "labyrinthine 强调像迷宫；byzantine 还常带官僚、政治手腕和秘密程序色彩。", "We wandered through labyrinthine corridors.", "我们在迷宫般的走廊中徘徊。"]],
    M("声音联想（非词源）：Byzantine 想成‘拜占庭迷宫’，路和规则都绕得人头晕。", "历史来源：本为 Byzantine Empire（拜占庭帝国）的形容词；现代贬义基于后世对其宫廷政治复杂隐秘的刻板印象，不是对历史的中性全貌。", "熟词桥：a byzantine tax code = 像宫殿迷宫一样层层相套的税法。", "办一张许可证要穿过七座迷宫、盖九十九个章，还得对着秘密门说暗号。", "历史名称 → 对复杂宫廷程序的联想 → 过度繁复、隐秘纠缠。", "易混刹车：首字母大写 Byzantine 可中性指拜占庭的；小写 byzantine 常是贬义‘错综复杂’。", "The byzantine form required a map, a password, and another form.", "那张复杂表格需要地图、口令和另一张表格。"),
    ["What extra judgment does byzantine add to complicated?", "byzantine 比 complicated 多什么判断？", "It suggests excessive, maze-like complexity, often with secrecy or bureaucracy.", "它暗示过度、迷宫般的复杂，常伴隐秘或官僚色彩。"],
    ["Small firms cannot navigate the ________ licensing system.", "小企业无法应付错综复杂的许可制度。", "An excessively intricate bureaucracy is byzantine.", "过度繁复的官僚制度可用 byzantine。"], ["simple", "transparent", "linear"]),

  vocab(284, "cache", "/kæʃ/", "noun · verb", "囤货，藏货：supply; 隐藏：hiding", "a hidden supply; to store something secretly for later use", "隐藏的储备；藏匿，储存",
    "松鼠把一箱数据和坚果藏进树洞，门牌写着‘稍后取用’。",
    [["a cache of weapons", "一批秘密藏匿的武器", "Police discovered a cache of weapons beneath the floor.", "警方在地板下发现一批藏匿武器。"], ["cache supplies", "藏起补给", "The climbers cached supplies along the route.", "登山者沿途藏好补给。"], ["clear the browser cache", "清除浏览器缓存", "Clear the browser cache if the old page persists.", "如果旧页面仍显示，请清除浏览器缓存。"]],
    [["supply", "储备；供应品", "原表注解 · 内容", "supply 可公开存放；cache 是为以后使用而隐藏或专门存储的一批东西。", "The shelter keeps an emergency supply of water.", "避难所储备应急用水。"], ["hiding", "隐藏；藏匿", "原表注解 · 方式", "hiding 是动作或状态；cache 兼有藏匿地点、藏品和动词用法。", "The documents remained in hiding for years.", "这些文件被隐藏多年。"], ["stash", "藏匿物；藏起", "近义词", "stash 较口语；cache 更常用于秘密储备、野外补给和计算机临时存储。", "She kept a stash of coins in the drawer.", "她在抽屉里藏了一些硬币。"]],
    M("声音联想（非词源）：cache 发音像 cash，把现金藏进秘密储备点。", "可靠词源：来自 French cacher（隐藏），名词由‘隐藏处’发展为‘藏起来的储备’。", "熟词桥：browser cache 暂存网页数据，和松鼠的食物储藏都为以后快速取用。", "松鼠在树洞里同时缓存网页、坚果和雪地靴，入口还设了密码。", "隐藏动作 → 隐藏地点与储备 → 计算机临时存储。", "易混刹车：cache /kæʃ/ 与 cash 同音；cachet /ˈkæʃ.eɪ/ 多一个音节，表示声望。", "The squirrel cached three websites and a winter's supply of acorns.", "松鼠缓存了三个网站和一冬天的橡果。"),
    ["What two ideas combine in a cache?", "cache 结合了哪两个概念？", "A supply is stored or hidden so it can be used later.", "一批储备被存放或隐藏，以便日后使用。"],
    ["The expedition ________ food near the base camp for the return journey.", "探险队在大本营附近藏好食物供返程使用。", "To cache supplies is to store them for later retrieval.", "cache supplies 表示储存起来以后取用。"], ["displayed", "discarded", "consumed"]),

  vocab(285, "cachet", "/ˈkæʃ.eɪ/", "noun", "同意：approval; 声望：prestige", "prestige or distinction that commands approval and respect", "声望；威望；认可印记",
    "名牌邀请函盖上金色印章，立刻获得全场羡慕和认可。",
    [["social cachet", "社会声望", "The address carries considerable social cachet.", "这个地址具有相当高的社会声望。"], ["add cachet to", "给……增添声望", "The architect's name added cachet to the project.", "这位建筑师的名字为项目增添了声望。"], ["the cachet of exclusivity", "专属感带来的威望", "The club depends on the cachet of exclusivity.", "该俱乐部依靠专属感带来的威望。"]],
    [["approval", "赞同；认可", "原表注解 · 社会认可", "approval 是直接赞同；cachet 是因身份、品味或稀缺性获得的社会认可与光环。", "The plan received official approval.", "该计划获得正式批准。"], ["prestige", "声望；威信", "原表注解 · 核心近义", "prestige 是广义声望；cachet 常指某个名字、品牌或专属属性附带的高雅光环。", "The award increased the university's prestige.", "该奖项提高了大学声望。"], ["status", "地位；身份", "近义词", "status 是社会位置；cachet 是使人显得有品位、受羡慕的附加魅力。", "The role gave him high status in the community.", "该职位让他在社区中地位很高。"]],
    M("声音联想（非词源）：cachet 像‘cash-A’，花钱也想买到 A 级声望光环。", "可靠词源：French cachet 原指印章或封印，来自 cacher（压、藏）相关形式；由正式印记发展为认可和声望。", "熟词桥：名牌 logo 像社会印章，给物品 added cachet。", "普通邀请函盖上金色印章后，立刻戴起皇冠，排队的人自动铺红毯。", "权威印章 → 正式认可 → 身份、品牌附带的声望光环。", "易混刹车：cachet /ˈkæʃ.eɪ/ 不是 cache /kæʃ/；前者声望，后者隐藏储备。", "One golden seal gave the plain teapot enough cachet to enter the palace.", "一枚金印让普通茶壶获得足够声望进入宫殿。"),
    ["How does cachet differ from simple approval?", "cachet 与简单 approval 有何区别？", "Cachet is an aura of prestige or distinction, not merely a yes to a proposal.", "cachet 是声望或卓越光环，不只是对提案说同意。"],
    ["The designer label gives the otherwise simple bag considerable ________.", "设计师品牌给这个原本简单的包增添了相当声望。", "A prestigious association adds cachet.", "有声望的关联会增添 cachet。"], ["obscurity", "disgrace", "anonymity"]),
];

const registerByWord = new Map([
  ["buck", "GRE 高频 · 常用 / 习语"], ["budge", "GRE 高频 · 常用"], ["bulge", "GRE 词汇 · 常用"],
  ["bully", "GRE 词汇 · 常用 / 旧义提醒"], ["bumptious", "GRE 词汇 · 正式贬义"], ["bungle", "GRE 高频 · 常用"],
  ["buoy", "GRE 高频 · 常用比喻"], ["buoyant", "GRE 高频 · 常用 / 正式"], ["burgeon", "GRE 高频 · 正式"],
  ["burlesque", "GRE 词汇 · 文学艺术"], ["burnish", "GRE 高频 · 正式"], ["buttress", "GRE 高频 · 正式 / 学术"],
  ["byzantine", "GRE 高频 · 正式贬义"], ["cache", "GRE 词汇 · 常用 / 技术"], ["cachet", "GRE 高频 · 正式"],
]);

const ipa = new Map([
  ["refuse assent", "/rɪˌfjuːz əˈsent/"], ["shift possession", "/ʃɪft pəˈzeʃ.ən/"], ["resist", "/rɪˈzɪst/"],
  ["alter a position", "/ˌɔːl.tər ə pəˈzɪʃ.ən/"], ["cease resistance", "/ˌsiːs rɪˈzɪs.təns/"], ["yield", "/jiːld/"],
  ["protuberant", "/prəˈtjuː.bər.ənt/"], ["more favorable condition", "/ˌmɔː ˈfeɪ.vər.ə.bəl kənˈdɪʃ.ən/"],
  ["sudden, usually temporary increase", "/ˌsʌd.ən ˌjuː.ʒu.ə.li ˌtem.pər.ər.i ˈɪn.kriːs/"], ["copiously supplied", "/ˈkəʊ.pi.əs.li səˈplaɪd/"], ["swell", "/swel/"],
  ["intimidating manner", "/ɪnˈtɪm.ɪ.deɪ.tɪŋ ˈmæn.ər/"], ["best", "/best/"], ["intimidate", "/ɪnˈtɪm.ɪ.deɪt/"],
  ["superiority", "/suːˌpɪə.riˈɒr.ə.ti/"], ["arrogant", "/ˈær.ə.ɡənt/"], ["pushy", "/ˈpʊʃ.i/"],
  ["work clumsily", "/ˌwɜːk ˈklʌm.zɪ.li/"], ["botch", "/bɒtʃ/"], ["mismanage", "/ˌmɪsˈmæn.ɪdʒ/"],
  ["courage", "/ˈkʌr.ɪdʒ/"], ["strength", "/streŋθ/"], ["encourage", "/ɪnˈkʌr.ɪdʒ/"],
  ["floating", "/ˈfləʊ.tɪŋ/"], ["good mood or disposition", "/ˌɡʊd ˈmuːd ɔː ˌdɪs.pəˈzɪʃ.ən/"], ["cheerful", "/ˈtʃɪə.fəl/"],
  ["grow", "/ɡrəʊ/"], ["rapidly", "/ˈræp.ɪd.li/"], ["flourish", "/ˈflʌr.ɪʃ/"], ["proliferate", "/prəˈlɪf.ə.reɪt/"],
  ["make fun of", "/ˌmeɪk ˈfʌn əv/"], ["parody", "/ˈpær.ə.di/"], ["satire", "/ˈsæt.aɪər/"],
  ["make smooth or glossy", "/ˌmeɪk ˌsmuːð ɔː ˈɡlɒs.i/"], ["polish", "/ˈpɒl.ɪʃ/"], ["enhance", "/ɪnˈhɑːns/"],
  ["supporting, wall building", "/səˌpɔː.tɪŋ ˈwɔːl ˌbɪl.dɪŋ/"], ["provide evidence or information for", "/prəˌvaɪd ˈev.ɪ.dəns ɔː ˌɪn.fəˈmeɪ.ʃən fɔː/"], ["bolster", "/ˈbəʊl.stər/"],
  ["complicated", "/ˈkɒm.plɪ.keɪ.tɪd/"], ["secretive", "/ˈsiː.krə.tɪv/"], ["interrelated", "/ˌɪn.tə.rɪˈleɪ.tɪd/"], ["labyrinthine", "/ˌlæb.əˈrɪn.θaɪn/"],
  ["supply", "/səˈplaɪ/"], ["hiding", "/ˈhaɪ.dɪŋ/"], ["stash", "/stæʃ/"],
  ["approval", "/əˈpruː.vəl/"], ["prestige", "/presˈtiːʒ/"], ["status", "/ˈsteɪ.təs/"],
]);

for (const config of all) {
  config.register = registerByWord.get(config.word);
  for (const item of config.comparisons) item[6] = ipa.get(item[0]);
}

const group = (start) => all.slice(start - 271, start - 266);

export const set55 = compactSet(55, "The Stubborn Floor", group(271), {
  title: "The Stubborn Floor",
  targetForms: ["buck", "budge", "bulge", "bully", "bumptious"],
  plain: "A bumptious bully ordered a buck to budge, but a bulge in the floor refused every command.",
  translation: "一个傲慢的恶霸命令一头公鹿挪开，但地板上的凸起拒绝了每一道命令。",
});

export const set56 = compactSet(56, "The Floating Show", group(276), {
  title: "The Floating Show",
  targetForms: ["bungled", "buoy", "buoyant", "burgeoned", "burlesque"],
  plain: "A buoyant actor bungled a burlesque, so a buoy burgeoned into a stage and saved the show.",
  translation: "一位乐观演员搞砸了滑稽戏，于是一个浮标迅速长成舞台，救下了演出。",
});

export const set57 = compactSet(57, "The Golden Maze", group(281), {
  title: "The Golden Maze",
  targetForms: ["burnish", "buttress", "byzantine", "cache", "cachet"],
  plain: "To burnish its cachet, a byzantine palace used a buttress to hide a cache of golden spoons.",
  translation: "为了提升声望，一座错综复杂的宫殿用扶壁藏起了一批金勺。",
});
