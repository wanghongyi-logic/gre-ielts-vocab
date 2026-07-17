import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });

const all = [
  vocab(236, "blunder", "/ˈblʌn.dər/", "noun · verb", "过失：error, mistake; 在···方面犯了很愚蠢且通常很严重的错误，糟蹋：make a stupid, error; 蹒跚：unsteadily", "a careless, often serious mistake; to move or act clumsily", "愚蠢而严重的错误；笨拙行事；蹒跚而行",
    "一头蒙眼大象跌进会议室，踩碎方案后还把墨水泼在结论上。",
    [["a costly blunder", "代价惨重的错误", "Publishing the private data was a costly blunder.", "公布私人数据是一个代价惨重的错误。"], ["blunder into trouble", "稀里糊涂陷入麻烦", "He blundered into trouble by answering before he understood the question.", "他没听懂问题就作答，稀里糊涂惹上了麻烦。"], ["blunder through the dark", "在黑暗中跌跌撞撞地走", "We blundered through the dark until we found the door.", "我们在黑暗中跌跌撞撞，直到找到门。"]],
    [["error", "错误", "原表注解 · 上位词", "error 是中性上位词；blunder 通常暗示粗心、笨拙且后果明显。", "The calculation contains a minor error.", "这项计算有一个小错误。", "/ˈer.ər/"], ["mistake", "错误；失误", "原表注解 · 常用词", "mistake 范围很广；blunder 是显得愚蠢、原本可避免的大错。", "I made a mistake in the address.", "我把地址写错了。", "/mɪˈsteɪk/"], ["make a stupid error", "犯愚蠢的错误", "原表注解 · 动词义", "该短语直说评价；blunder 用一个词同时呈现愚蠢、笨拙和失误。", "The clerk made a stupid error and deleted the only copy.", "职员犯了愚蠢的错误，删掉了唯一副本。", "/ˌmeɪk ə ˌstjuː.pɪd ˈer.ər/"], ["stumble", "绊倒；踉跄", "近义词", "stumble 常因脚下障碍踉跄；blunder 强调看不清方向般笨拙乱闯，也可指犯错。", "She stumbled on the loose stone.", "她被松动的石头绊了一下。", "/ˈstʌm.bəl/"]],
    M("声音联想（非词源）：blunder 像‘不拦着’。没人拦住蒙眼大象，它就闯出大错。", "可靠词源线索：来自 Middle English blunderen，可能与表示搅乱、闭眼摸索的北欧词有关；更深来源并不完全确定。", "熟词桥：a blundering fool 是‘笨手笨脚、总闯祸的人’，把动作和错误连成一幅图。", "蒙眼大象拿着印章乱走，每一步都盖错文件，最后把会议桌当成门撞开。", "看不清而乱闯 → 动作笨拙 → 做出愚蠢且严重的错误。", "易混刹车：blunder 比 error 负面更强；不是所有拼写小错都值得叫 blunder。", "The mayor's blunder turned a short speech into a three-day apology.", "市长的大错把一次短演讲变成了三天的道歉。"),
    ["What makes a blunder stronger than an ordinary error?", "blunder 为什么比普通 error 更强？", "It suggests a careless or foolish mistake, often with serious consequences.", "它暗示粗心或愚蠢造成的错误，而且往往后果严重。"],
    ["Sending the contract to the rival company was a costly ________.", "把合同发给竞争公司是一个代价惨重的大错。", "A foolish, consequential mistake is a blunder.", "愚蠢且后果明显的错误是 blunder。"], ["triumph", "solution", "precision"]),

  vocab(237, "blunt", "/blʌnt/", "adjective · verb", "使变钝：less sharp; 减弱（力度等）：weaken in strength or feeling; 直率的：direct, brief", "not sharp; direct in speech; to weaken force, pain, or feeling", "钝的；直率的；使变钝或减弱",
    "一把钝刀戴着领带，直截了当地说出坏消息，同时把冲击削成软垫。",
    [["a blunt knife", "一把钝刀", "A blunt knife can be more dangerous than a sharp one.", "钝刀有时比锋利的刀更危险。"], ["be blunt about something", "直率谈论某事", "She was blunt about the plan's weaknesses.", "她直率地指出了计划的弱点。"], ["blunt the impact", "减弱冲击", "Emergency aid helped blunt the impact of the closure.", "紧急援助帮助减轻了停业的冲击。"]],
    [["less sharp", "不那么锋利的", "原表注解 · 实体义", "less sharp 是描述；blunt 是常用形容词，既可说刀刃不利，也可说言辞不绕弯。", "The old blade is less sharp than the new one.", "旧刀片不如新刀片锋利。", "/ˌles ˈʃɑːp/"], ["weaken", "减弱", "原表注解 · 动词义", "weaken 泛指变弱；blunt 常强调削去冲击、感受或效果的锋芒。", "The delay weakened public confidence.", "延误削弱了公众信心。", "/ˈwiː.kən/"], ["direct", "直接的；直率的", "原表注解 · 说话方式", "direct 可以中性；blunt 常暗示过分直白，可能忽略他人感受。", "He gave a direct answer to the question.", "他直接回答了问题。", "/dəˈrekt/"], ["tactless", "不圆通的；不得体的", "近义词", "tactless 重点是缺乏分寸；blunt 重点是言辞直截了当，未必存心冒犯。", "Her tactless joke embarrassed the host.", "她不得体的玩笑让主人很尴尬。", "/ˈtækt.ləs/"]],
    M("声音联想（非词源）：blunt 像‘不论它’。不论别人是否尴尬，他都把话直说到底。", "可靠词源：来自 Middle English blunt，早期已有 dull、not sharp 之义；其更早来源不确定，不能可靠硬拆。", "熟词桥：钝器 blunt instrument 没有尖锋；blunt words 也没有委婉的‘软边’。", "钝刀登上讲台，一刀切掉所有客套话，再把猛烈冲击削成一块海绵。", "刀刃不锋利 → 言辞没有修饰 → 力度或感受的锋芒被削弱。", "易混刹车：blunt honesty 是直白诚实；brief 只是简短，不必显得生硬。", "The blunt spoon told the soup that it needed more salt.", "那把直率的钝勺告诉汤：你需要更多盐。"),
    ["How can blunt describe both a knife and a comment?", "blunt 怎样同时形容刀和评论？", "Both lack a fine edge: the knife is dull, while the comment lacks softening tact.", "二者都没有细致锋芒：刀不利，评论则缺少委婉修饰。"],
    ["The report uses ________ language and does not soften its criticism.", "报告使用直率语言，没有淡化批评。", "Language that is direct and tactless can be blunt.", "直接、可能不够圆通的语言可用 blunt。"], ["subtle", "sharp", "gentle"]),

  vocab(238, "blur", "/blɜːr/", "noun · verb", "（使）变得朦胧，（使）变得不清楚：vague; 使不易理解：unclear to the understanding", "to make sight, sound, memory, or distinctions indistinct", "使模糊；使难以看清或理解；模糊影像",
    "一团雾拿着橡皮擦，把照片边缘、记忆和两条规则之间的界线一起擦花。",
    [["blur the image", "使图像模糊", "Movement blurred the image on the screen.", "移动使屏幕上的图像变模糊了。"], ["blur the distinction", "模糊区别", "The new role blurs the distinction between editor and writer.", "这个新角色模糊了编辑与作者之间的区别。"], ["become a blur", "变成模糊一片", "After hours of reading, the lines became a blur.", "读了数小时后，一行行文字变得模糊不清。"]],
    [["vague", "模糊的；不明确的", "原表注解 · 状态", "vague 常指想法或语言不具体；blur 是使边缘、记忆或区别失去清晰度的过程或结果。", "The instructions were vague about timing.", "说明在时间安排上很含糊。", "/veɪɡ/"], ["unclear to the understanding", "难以理解的", "原表注解 · 认知义", "该短语强调理解结果；blur 常说明原本清楚的概念或界线被搅混。", "The final paragraph is unclear to the average reader.", "最后一段对普通读者而言难以理解。", "/ʌnˌklɪər tə ði ˌʌn.dəˈstæn.dɪŋ/"], ["obscure", "使晦涩；遮蔽", "近义词", "obscure 可把事物完全遮住或使意义晦涩；blur 通常仍可感知，只是轮廓或界限不清。", "Smoke obscured the exit sign.", "烟雾遮住了出口标志。", "/əbˈskjʊər/"]],
    M("声音联想（非词源）：blur 像‘不乐儿’。眼镜起雾看不清，孩子当然不乐。", "词源结论：blur 在十六世纪进入英语，早期来源不明；没有可靠证据支持中文谐音拆解。", "熟词桥：photo blur 是照片模糊；把镜头失焦延伸到 blurred memory 与 blurred boundaries。", "雾妖拿橡皮擦来回擦城市，先擦掉窗框，再擦掉法律与建议之间的线。", "视觉轮廓不清 → 记忆不清 → 概念与界限难以分辨。", "易混刹车：blur 强调清晰度下降；vague 强调本来就不具体，二者并非总可互换。", "The fog blurred the map until every road looked like a noodle.", "雾把地图弄模糊，直到每条路都像面条。"),
    ["What abstract objects commonly follow blur?", "blur 后常接哪些抽象宾语？", "Distinctions, boundaries, memories, and responsibilities can all be blurred.", "distinctions、boundaries、memories 和 responsibilities 都可以被模糊。"],
    ["The arrangement may ________ the line between public duty and private interest.", "这项安排可能模糊公职与私人利益之间的界线。", "To make a distinction less clear is to blur it.", "使区别不再清楚就是 blur。"], ["clarify", "define", "sharpen"]),

  vocab(239, "blurt", "/blɜːt/", "transitive verb", "突然说出，冲动地说：abruptly", "to say something suddenly and without thinking", "脱口而出；冲动地突然说出",
    "一句秘密像爆米花一样从嘴里突然弹出，说话人伸手却已经抓不回来。",
    [["blurt out a secret", "脱口说出秘密", "He blurted out the secret before anyone could stop him.", "没人来得及阻止，他就脱口说出了秘密。"], ["blurt out an answer", "抢着脱口回答", "A student blurted out the answer without raising her hand.", "一名学生没举手就脱口说出了答案。"], ["blurt something out", "突然把某事说出口", "I nearly blurted the news out at dinner.", "我差点在晚餐时把消息脱口说出来。"]],
    [["abruptly", "突然地；唐突地", "原表注解 · 方式", "abruptly 可修饰任何突然动作；blurt 专指未经思考突然说出口，常用 blurt out。", "The meeting ended abruptly.", "会议突然结束了。", "/əˈbrʌpt.li/"], ["exclaim", "惊叫；呼喊", "近义词", "exclaim 强调情绪强烈地喊出；blurt 强调没有控制住、说得太快或不合时宜。", "She exclaimed in delight at the result.", "她看到结果时高兴地惊呼。", "/ɪkˈskleɪm/"], ["divulge", "泄露；透露", "易混词", "divulge 强调把秘密透露出去，可经过考虑；blurt 强调冲动突然，内容不一定是秘密。", "The agency refused to divulge the source.", "该机构拒绝透露消息来源。", "/daɪˈvʌldʒ/"]],
    M("声音联想（非词源）：blurt 像‘不拦它’。没拦住那句话，它就从嘴里冲了出去。", "词源线索：可能由 blow 或 blur 一类表示猛冲、喷出的声音词影响形成，但确切来源不确定。", "熟词桥：固定短语 blurt out；把 out 想成一句话突然冲出门。", "秘密变成一粒爆米花，从嘴里啪地弹到宴会中央，所有人同时转头。", "声音突然冲出 → 未经思考脱口说出，突出失控与唐突。", "易混刹车：常说 blurt out the answer 或 blurt the answer out；不要误写成 blur。", "The child blurted out the ending before the film began.", "电影还没开始，孩子就脱口说出了结局。"),
    ["Which particle most commonly follows blurt?", "blurt 最常与哪个小品词搭配？", "Out: blurt out a name, an answer, or a secret.", "与 out 搭配：blurt out a name、an answer 或 a secret。"],
    ["Nervous and excited, she ________ out the winner's name too soon.", "她又紧张又兴奋，过早脱口说出了获胜者的名字。", "A sudden, unplanned utterance is something one blurts out.", "未经计划突然说出口就是 blurt out。"], ["concealed", "pondered", "whispered"]),

  vocab(240, "bluster", "/ˈblʌs.tər/", "noun · verb", "狂妄自大地大声说：loudly arrogant; 大声吹嘘，恐吓：loudly; 喧闹的状态：noisy", "to speak loudly, boastfully, or threateningly; noisy swagger", "咆哮吹嘘；虚张声势地威吓；喧闹",
    "一阵穿西装的狂风拍桌叫嚷，帽子却被自己吹走，暴露出虚张声势。",
    [["bluster about success", "大声吹嘘成功", "The candidate blustered about victories that never happened.", "候选人大声吹嘘从未发生的胜利。"], ["bluster and threaten", "咆哮威吓", "The manager blustered and threatened but offered no evidence.", "经理咆哮威吓，却拿不出证据。"], ["empty bluster", "空洞的虚张声势", "Investors soon recognized the speech as empty bluster.", "投资者很快认出这番讲话只是空洞的虚张声势。"]],
    [["loudly arrogant", "狂妄地大声说话", "原表注解 · 语气", "该短语描述态度；bluster 还暗示这种大声自信往往在掩盖软弱。", "He sounded loudly arrogant during the debate.", "他在辩论中显得狂妄而吵闹。", "/ˌlaʊd.li ˈær.ə.ɡənt/"], ["loudly", "大声地", "原表注解 · 音量", "loudly 只说明音量；bluster 同时包含夸口、威吓或狂妄姿态。", "They argued loudly in the hall.", "他们在大厅里大声争论。", "/ˈlaʊd.li/"], ["noisy", "喧闹的", "原表注解 · 状态", "noisy 可指任何噪声；bluster 作名词指带威吓或吹嘘意味的喧闹言行。", "The market was noisy at noon.", "中午的市场很喧闹。", "/ˈnɔɪ.zi/"], ["swagger", "大摇大摆；虚张声势", "近义词", "swagger 侧重动作与自负姿态；bluster 侧重大声夸口或恐吓。", "He swaggered into the room as if he owned it.", "他大摇大摆地走进房间，仿佛那里属于他。", "/ˈswæɡ.ər/"]],
    M("声音联想（非词源）：bluster 像‘不落声’。嗓门一直不落，却没有实质内容。", "可靠词源：与表示强风猛烈吹袭的中古英语、低地德语词有关；从暴风的喧响转为人的咆哮吹嘘。", "熟词桥：a blustering wind 会呼啸；a blustering speaker 也用声音制造压迫感。", "西装狂风拍桌吹嘘，领带和假发却被自己的气流卷走，只剩一张空讲稿。", "风暴喧响 → 人大声咆哮 → 用夸口或威吓制造声势。", "易混刹车：boast 可以平静炫耀；bluster 必有吵闹、强硬或虚张声势的感觉。", "The tiny cloud blustered so loudly that its own thunder asked for earplugs.", "小云朵咆哮得太响，连它自己的雷声都要耳塞。"),
    ["What weakness is often implied by bluster?", "bluster 常暗示说话者有什么弱点？", "The loud confidence may be empty, masking insecurity or lack of evidence.", "高声自信可能是空的，用来掩盖不安或缺乏证据。"],
    ["The official tried to ________ his critics into silence with threats.", "官员试图用威吓咆哮让批评者闭嘴。", "Loud, boastful intimidation is bluster.", "大声吹嘘式的威吓就是 bluster。"], ["reassure", "murmur", "reason"]),

  vocab(241, "boggle", "/ˈbɒɡ.əl/", "verb", "（因为怀疑、恐惧）犹豫：hesitate; 笨拙地做：unskillful way", "to hesitate in doubt or fear; to be overwhelmed or astonished", "因怀疑或恐惧而犹豫；惊呆；笨拙处理",
    "大脑站在巨大账单前急刹车，齿轮因难以置信而一起弹飞。",
    [["boggle at the cost", "因费用而犹豫或震惊", "The committee boggled at the cost of the repair.", "委员会对维修费用感到震惊并犹豫。"], ["the mind boggles", "令人难以置信", "The mind boggles at the number of missing records.", "遗失记录的数量令人难以置信。"], ["boggle over a decision", "面对决定踌躇", "She boggled over the decision until the deadline passed.", "她对这个决定踌躇不定，直到错过截止时间。"]],
    [["hesitate", "犹豫", "原表注解 · 核心动作", "hesitate 是中性停顿；boggle 强调因恐惧、怀疑或规模惊人而退缩停住。", "He hesitated before signing the form.", "他签表前犹豫了一下。", "/ˈhez.ɪ.teɪt/"], ["unskillful way", "笨拙的方式", "原表注解 · 较旧用法", "该短语对应较少见的笨拙处理义；现代 boggle 最常见于 the mind boggles 或 boggle at。", "The repair was done in an unskillful way.", "这次维修做得很笨拙。", "/ʌnˌskɪl.fəl ˈweɪ/"], ["flinch", "畏缩", "近义词", "flinch 常是对疼痛或威胁的瞬间反应；boggle 更常是面对难题或惊人事实时心智停摆。", "She did not flinch at the loud crash.", "巨响传来时她没有畏缩。", "/flɪntʃ/"]],
    M("声音联想（非词源）：boggle 像‘爆个脑壳’。数字夸张到脑壳像齿轮一样爆开，令人惊呆。", "词源线索：可能与 bogle（妖怪、吓人之物）相关；早期有因惊恐而退缩之义，但更深来源不确定。", "熟词桥：固定句 The mind boggles 把大脑想成遇到惊人事实便卡死的机器。", "大脑看到千页账单，四个齿轮同时举白旗，拒绝再计算。", "受惊而退缩 → 因怀疑或恐惧犹豫 → 面对惊人规模时难以想象。", "易混刹车：不要与 goggle（瞪眼；护目镜）混淆；常用 boggle at 与 mind-boggling。", "The mind boggles when one sandwich receives a thousand-page menu.", "一个三明治收到一千页菜单，实在令人难以置信。"),
    ["What does the fixed phrase the mind boggles express?", "固定短语 the mind boggles 表达什么？", "It expresses astonishment so great that something is hard to imagine or comprehend.", "它表示惊讶到了难以想象或理解的程度。"],
    ["The mind ________ at the scale of the hidden debt.", "隐性债务的规模令人难以置信。", "The idiom is the mind boggles at something.", "固定表达是 the mind boggles at something。"], ["calculates", "settles", "shrinks"]),

  vocab(242, "boisterous", "/ˈbɔɪ.stər.əs/", "adjective", "喧嚷的，吵闹的：noisily", "noisy, energetic, and cheerful or rough", "喧闹活跃的；吵嚷而精力旺盛的",
    "一群穿弹簧鞋的孩子在图书馆庆祝，笑声把书从架上震下来。",
    [["a boisterous crowd", "喧闹的人群", "A boisterous crowd filled the square after the victory.", "胜利后，喧闹的人群挤满广场。"], ["boisterous laughter", "响亮奔放的笑声", "Boisterous laughter erupted from the next room.", "隔壁房间爆发出响亮奔放的笑声。"], ["boisterous play", "吵闹激烈的玩耍", "The puppies became too boisterous for the small room.", "小狗们玩得太闹腾，小房间容不下了。"]],
    [["noisily", "喧闹地", "原表注解 · 方式", "noisily 只说明声音大；boisterous 还带精力旺盛、粗放或欢乐失控的感觉。", "The chairs scraped noisily across the floor.", "椅子在地板上刮得很响。", "/ˈnɔɪ.zɪ.li/"], ["rowdy", "吵闹粗暴的", "近义词", "rowdy 往往暗示扰乱秩序；boisterous 可以只是活泼欢乐，不必有恶意。", "Rowdy fans damaged several seats.", "闹事的球迷损坏了几把座椅。", "/ˈraʊ.di/"], ["exuberant", "兴高采烈的；充满活力的", "近义词", "exuberant 强调旺盛热情，未必吵；boisterous 把能量表现为明显的喧闹动作或声音。", "She gave an exuberant welcome.", "她给予了热情洋溢的欢迎。", "/ɪɡˈzjuː.bər.ənt/"]],
    M("声音联想（非词源）：boisterous 像‘boys 吵死 us’。男孩们精力过剩，吵得大家捂耳朵。", "词源线索：Middle English boistous 曾表示粗糙、笨重或猛烈；确切的更早来源不确定。", "熟词桥：boisterous children = noisy + energetic children，不只是一般 loud。", "弹簧鞋孩子在图书馆蹦跳庆祝，每次大笑都把一本词典震醒。", "粗猛有力 → 动作旺盛 → 声音大、欢乐或粗野的喧闹。", "易混刹车：boisterous 可含善意欢乐；rowdy 更容易暗示失序和麻烦。", "The boisterous puppies held a parade through the sleeping library.", "吵闹的小狗在沉睡的图书馆里举行游行。"),
    ["What does boisterous add to the simple idea of noisy?", "boisterous 比单纯 noisy 多什么？", "It adds vigorous, exuberant, and sometimes rough physical energy.", "它还带旺盛、兴奋、有时粗放的身体能量。"],
    ["The referee struggled to calm the ________ fans after the final whistle.", "终场哨响后，裁判难以让喧闹激动的球迷平静下来。", "Noisy, highly energetic people are boisterous.", "既吵闹又精力旺盛的人可用 boisterous。"], ["subdued", "silent", "listless"]),

  vocab(243, "bolster", "/ˈbəʊl.stər/", "noun · transitive verb", "支撑（物）：provide support；鼓励、使有精力：boost", "to support, strengthen, or improve; a long supporting cushion", "支撑；加强；鼓舞；长枕",
    "一只巨型长枕钻到摇晃的论点下面，把证据和士气一起托高。",
    [["bolster an argument", "加强论点", "New evidence bolstered the argument for reform.", "新证据增强了支持改革的论点。"], ["bolster confidence", "增强信心", "The early success bolstered the team's confidence.", "早期成功增强了团队信心。"], ["a firm bolster", "一个结实的长枕", "A firm bolster supported his back.", "一个结实的长枕托住了他的背。"]],
    [["provide support", "提供支撑", "原表注解 · 基础关系", "provide support 是宽泛短语；bolster 常指主动加固原本偏弱的论点、信心或结构。", "The beams provide support for the roof.", "这些横梁支撑屋顶。", "/prəˌvaɪd səˈpɔːt/"], ["boost", "促进；提高", "原表注解 · 抽象义", "boost 常指快速提高数量或表现；bolster 强调通过支撑使某物更稳、更可信或更有力量。", "The discount boosted sales.", "折扣促进了销售。", "/buːst/"], ["reinforce", "加固；加强", "近义词", "reinforce 常增加材料或重复信息来强化；bolster 更强调托住弱点、防止下滑。", "Steel bars reinforce the concrete.", "钢筋加固混凝土。", "/ˌriː.ɪnˈfɔːs/"]],
    M("声音联想（非词源）：bolster 像‘抱着它’。摇晃时抱住它、托住它，就是给予支撑。", "可靠词源：来自 Old English bolster（垫子、长枕），实体支撑物后来发展出‘支持、加强’的动词义。", "熟词桥：床上的 bolster 托住身体；evidence bolsters a claim 则托住论点。", "巨型长枕从床上跳进会议室，把快倒的图表、信心和证据全部垫稳。", "长枕提供实体支撑 → 给论点、信心或机构增加力量与稳定性。", "易混刹车：bolster 不是单纯 make bigger；它通常回答‘什么需要被支撑或加强’。", "A heroic pillow bolstered the argument before supporting everyone's back.", "一只英雄长枕先加强论点，再托住每个人的背。"),
    ["What physical object lies behind the figurative verb bolster?", "bolster 的比喻动词义背后是什么实体？", "A long supporting cushion or pillow.", "一个用于支撑的长枕或垫子。"],
    ["The independent data should ________ public confidence in the result.", "独立数据应当增强公众对结果的信心。", "Evidence can support and strengthen confidence, so it bolsters it.", "证据能够支撑并增强信心，因此用 bolster。"], ["undermine", "weaken", "drain"]),

  vocab(244, "bombast", "/ˈbɒm.bæst/", "noun", "夸大的言辞：pompous", "pompous, inflated language with little substance", "夸夸其谈；浮夸空洞的言辞",
    "演讲气球被华丽词藻吹得比宫殿还大，针一扎却只掉出一张空白纸。",
    [["political bombast", "政治上的浮夸言辞", "Voters had grown tired of political bombast.", "选民已经厌倦了政治上的浮夸言辞。"], ["empty bombast", "空洞的夸夸其谈", "The announcement was dismissed as empty bombast.", "这份声明被斥为空洞的夸夸其谈。"], ["cut through the bombast", "识破浮夸言辞", "The interviewer cut through the bombast with one precise question.", "采访者用一个精准问题戳破了浮夸言辞。"]],
    [["pompous", "浮夸自负的", "原表注解 · 风格", "pompous 可形容人、仪式或语言；bombast 专指浮夸膨胀而内容贫乏的语言。", "The speaker adopted a pompous tone.", "演讲者摆出浮夸自负的腔调。", "/ˈpɒm.pəs/"], ["grandiloquence", "华而不实的豪言壮语", "近义词 · 正式", "grandiloquence 强调宏大词汇风格；bombast 更直接批评其夸大且空洞。", "The essay's grandiloquence obscured a simple point.", "文章的华丽大话掩盖了一个简单观点。", "/ɡrænˈdɪl.ə.kwəns/"], ["rhetoric", "修辞；言辞", "易混词", "rhetoric 可中性指说服性语言；bombast 必带贬义，认为语言虚胖无实质。", "Her rhetoric persuaded the audience.", "她的言辞说服了听众。", "/ˈret.ər.ɪk/"]],
    M("声音联想（非词源）：bombast 像‘bomb 爆词’。词语像炸弹一样声势巨大，炸完却没有内容。", "可靠词源：经 French bombace 来自 Medieval Latin bombax（棉花）；早期 bombast 指棉絮填充物，后比喻填得鼓胀的语言。", "熟词桥：把演讲看成塞满棉花的外套：外形巨大，里面轻飘，就是 bombast。", "华丽句子被棉花塞成巨型气球，针尖问题一碰，整场演讲只剩一撮绒毛。", "棉絮填充使衣物鼓起 → 言辞被空洞华词填胖 → 浮夸而无实质。", "易混刹车：bombast 是不可数名词；bombastic 才是形容词。不要因 bomb 拼写就伪称来自炸弹。", "The minister's bombast filled the hall but answered nothing.", "部长的浮夸言辞充满大厅，却什么也没回答。"),
    ["Why is the old 'stuffing' image useful for bombast?", "为什么‘填充物’的旧图像有助于记 bombast？", "It suggests language puffed up in size but lacking solid content.", "它让人想到语言被撑得很大，却缺乏扎实内容。"],
    ["The speech offered plenty of patriotic ________ but no workable policy.", "演讲充满爱国式浮夸言辞，却没有可行政策。", "Pompous, inflated language without substance is bombast.", "浮夸膨胀却无实质的语言是 bombast。"], ["evidence", "clarity", "restraint"]),

  vocab(245, "bonhomie", "/ˌbɒn.əˈmiː/", "noun", "温和，和蔼：geniality", "cheerful friendliness and easy good nature", "温和友善；和蔼愉快的气氛",
    "一位圆脸主人端着热汤微笑迎客，房间里的陌生人立刻像老朋友一样聊天。",
    [["an air of bonhomie", "和睦友好的气氛", "The dinner began with an air of bonhomie.", "晚宴在和睦友好的气氛中开始。"], ["public bonhomie", "公开表现的和气", "Their public bonhomie concealed a serious dispute.", "他们公开表现的和气掩盖了一场严重争端。"], ["easy bonhomie", "轻松随和的友善", "Her easy bonhomie put nervous guests at ease.", "她轻松随和的友善让紧张的客人放松下来。"]],
    [["geniality", "和蔼；亲切", "原表注解 · 核心义", "geniality 指愉快友善的品质；bonhomie 更常呈现一群人轻松融洽的社交气氛。", "His geniality made him a popular host.", "他的和蔼使他成为受欢迎的主人。", "/ˌdʒiː.niˈæl.ə.ti/"], ["affability", "和蔼可亲", "近义词 · 正式", "affability 强调一个人容易交谈、待人亲切；bonhomie 可指个人气质，也可指场面上的欢快友好。", "Her affability encouraged honest discussion.", "她的和蔼可亲促进了坦诚讨论。", "/ˌæf.əˈbɪl.ə.ti/"], ["camaraderie", "同志情谊；伙伴情谊", "近义词", "camaraderie 多来自共同经历或团队身份；bonhomie 可以在刚见面的社交场合迅速出现。", "Years at sea created strong camaraderie among the crew.", "多年的海上生活在船员间形成了深厚情谊。", "/ˌkæm.əˈrɑː.dər.i/"]],
    M("声音联想（非词源）：bonhomie 可联想‘帮好密友’。大家热情互帮，很快成了亲密朋友。", "可靠词源：直接借自 French bonhomie，源于 bonhomme（good man，厚道人）；bon ‘好’ + homme ‘人’。", "熟词桥：French bon = good；看到 bonhomie 就想 good-natured friendliness。", "圆脸主人把热汤分给每位陌生人，汤碗一碰，整个车站立刻变成朋友聚会。", "‘好人’的温厚气质 → 和蔼随和 → 群体中轻松愉快的友善气氛。", "易混刹车：bonhomie 不是 intimacy；它可以是公开、表面的热络，并不保证深交。", "The host's bonhomie persuaded even the chairs to join the conversation.", "主人的和蔼气氛让椅子都加入了谈话。"),
    ["Does bonhomie require a deep, long-standing friendship?", "bonhomie 是否必须建立在长期深厚友谊上？", "No. It can describe immediate, easy, good-humored friendliness in a social setting.", "不需要；它可以指社交场合即时形成的轻松友善。"],
    ["Despite the negotiations, both leaders maintained an appearance of ________.", "尽管正在谈判，两位领导人仍保持表面上的和气。", "Easy, cheerful friendliness is bonhomie.", "轻松愉快的友善气氛是 bonhomie。"], ["hostility", "reserve", "gloom"]),

  vocab(246, "boo", "/buː/", "noun · verb · interjection", "嘘（以表示不满或嘲笑）：contempt, scorn, disapproval", "to express contempt, scorn, or disapproval by shouting 'boo'", "发嘘声；以嘘声表示不满或嘲笑",
    "剧院里一千个嘴巴吹出黑色气泡，每个气泡都写着‘不赞成’。",
    [["boo the speaker", "向演讲者喝倒彩", "Some spectators booed the speaker off the stage.", "一些观众用嘘声把演讲者轰下了台。"], ["a chorus of boos", "一片嘘声", "The decision was met with a chorus of boos.", "这个决定遭到一片嘘声。"], ["boo in disapproval", "以嘘声表示不满", "Fans booed in disapproval when the goal was canceled.", "进球被取消时，球迷发出嘘声表示不满。"]],
    [["contempt", "蔑视", "原表注解 · 情感", "contempt 是内在轻蔑；boo 是把不满或轻蔑用特定叫声公开表达。", "She felt contempt for the dishonest scheme.", "她鄙视这个不诚实的计划。", "/kənˈtempt/"], ["scorn", "鄙视；嘲弄", "原表注解 · 态度", "scorn 可用言语或态度表现；boo 专指群体常见的‘嘘’声。", "He rejected the warning with scorn.", "他轻蔑地拒绝了警告。", "/skɔːn/"], ["disapproval", "不赞成", "原表注解 · 目的", "disapproval 可安静表达；boo 是响亮、公开且常带群体压力的表达方式。", "The board expressed its disapproval in writing.", "董事会以书面形式表示不赞成。", "/ˌdɪs.əˈpruː.vəl/"], ["jeer", "嘲笑；讥讽", "近义词", "jeer 常包含具体的嘲讽话语；boo 可以只是一个延长的声音。", "The crowd jeered at the defeated player.", "人群讥笑那名落败的选手。", "/dʒɪər/"]],
    M("声音联想（拟声而非词源拆解）：boo 本身模仿低沉嘘声，张嘴拖长 /uː/ 就能听见不满。", "词源线索：boo 属于拟声叫喊，英语记录可追溯到近代早期；不能再拆出可靠词根。", "熟词桥：万圣节的 Boo! 用来吓人；剧场的 Booo! 拉长后常表示不满，语境决定功能。", "观众吹出黑色‘BOO’气泡，气泡撞上舞台后变成一排向下的大拇指。", "突发叫喊 → 用延长嘘声公开表达嘲笑、轻蔑或不赞成。", "易混刹车：boo /buː/ 与 book 无关；名词复数常写 boos，动词过去式 booed。", "The audience booed until the curtain apologized.", "观众一直喝倒彩，直到幕布开口道歉。"),
    ["How does boo turn an attitude into an action?", "boo 如何把态度变成行动？", "It voices contempt or disapproval through a recognizable shouted sound.", "它用一种可辨识的喊声把轻蔑或不满公开表达出来。"],
    ["The crowd began to ________ when the unfair result was announced.", "不公平的结果公布后，人群开始发嘘声。", "To shout disapproval is to boo.", "以喊声表达不满就是 boo。"], ["applaud", "praise", "welcome"]),

  vocab(247, "boon", "/buːn/", "noun · adjective", "恩惠，福利：benefit; 喜欢集体活动的：enjoy the company of others", "a timely benefit or blessing; sociable and convivial in the phrase boon companion", "恩惠；福祉；有益之物；爱社交的",
    "一份及时礼物从天而降，给旱地送水，还邀请全村围桌庆祝。",
    [["a boon to farmers", "给农民带来益处的事物", "The new irrigation system is a boon to local farmers.", "新灌溉系统给当地农民带来了福音。"], ["a great boon", "一大恩惠", "Remote access proved a great boon during the storm.", "暴风雨期间，远程访问证明是一大便利。"], ["a boon companion", "爱社交的亲密伙伴", "He was remembered as a cheerful boon companion.", "人们记得他是个开朗而爱社交的伙伴。"]],
    [["benefit", "益处；福利", "原表注解 · 核心名词", "benefit 是一般好处；boon 常指在需要时出现、格外有帮助的恩惠或便利。", "Regular exercise has many health benefits.", "规律运动有许多健康益处。", "/ˈben.ɪ.fɪt/"], ["enjoy the company of others", "喜欢与他人相处", "原表注解 · 形容词旧义", "该释义主要保留在 boon companion；现代不能普遍用 boon 单独形容所有外向的人。", "She enjoys the company of others at community events.", "她喜欢在社区活动中与他人相处。", "/ɪnˌdʒɔɪ ðə ˌkʌm.pə.ni əv ˈʌð.əz/"], ["blessing", "幸事；恩赐", "近义词", "blessing 常带幸运或感恩意味；boon 更强调实际、及时的帮助。", "The cool rain was a blessing after weeks of heat.", "数周炎热后，这场凉雨是一件幸事。", "/ˈbles.ɪŋ/"]],
    M("声音联想（非词源）：boon 像‘补恩’。在最需要时补上一份恩惠，就是一大 boon。", "词源需分流：名词‘恩惠’来自 Old Norse bón（request, prayer）；boon companion 中的形容词经 French bon（good）。两义不宜伪装成同一条词根。", "熟词桥：a boon to 是高频框架；把它替换成 a great benefit to 即可理解。", "云朵把灌溉系统当礼物投给旱地，收据上只写‘及时恩惠’。", "祈求得到的好处 → 及时而显著的恩惠；社交义主要冻结在 boon companion。", "易混刹车：boon 是好处，bane 是祸根，二者常构成 boon or bane 对照。", "The talking umbrella was a boon to a town where rain fell upward.", "在雨水向上落的小镇，会说话的伞是一大福音。"),
    ["What common preposition introduces the beneficiary of a boon?", "表示 boon 的受益者常用哪个介词？", "To: something is a boon to a person, group, or industry.", "用 to：某物 is a boon to 某人、群体或行业。"],
    ["Affordable childcare would be a major ________ to working families.", "可负担的托儿服务将给工薪家庭带来重大福祉。", "A timely and substantial benefit is a boon.", "及时而显著的益处是 boon。"], ["bane", "burden", "setback"]),

  vocab(248, "boor", "/bʊər/", "noun", "粗鲁的人，不敏感的人：rude", "a rude, insensitive, or ill-mannered person", "粗鲁无礼、麻木不敏感的人",
    "一个穿泥靴的客人把餐巾当旗子挥舞，打断所有人，却看不见旁人的皱眉。",
    [["an insensitive boor", "一个麻木粗鲁的人", "Only an insensitive boor would mock her grief.", "只有麻木粗鲁的人才会嘲笑她的悲伤。"], ["behave like a boor", "举止像个粗人", "He behaved like a boor throughout the formal dinner.", "整个正式晚宴期间，他举止粗鲁。"], ["a loud boor", "一个吵闹无礼的人", "The loud boor interrupted every speaker.", "那个吵闹无礼的人打断了每位发言者。"]],
    [["rude", "粗鲁的", "原表注解 · 核心性质", "rude 是形容词；boor 是名词，专指缺乏礼貌或社会敏感度的人。", "The customer was rude to the waiter.", "顾客对服务员很粗鲁。", "/ruːd/"], ["lout", "粗鲁笨拙的人", "近义词", "lout 常暗示笨拙、粗野的年轻男子；boor 更突出没有教养和不顾他人感受。", "A drunken lout kicked the gate.", "一个醉醺醺的粗人踢了大门。", "/laʊt/"], ["vulgarian", "俗人；粗鄙者", "近义词 · 正式", "vulgarian 强调品味低俗；boor 强调行为粗鲁和不敏感。", "The critic portrayed him as a wealthy vulgarian.", "评论家把他描绘成一个富有却粗鄙的人。", "/vʌlˈɡeə.ri.ən/"]],
    M("声音联想（非词源）：boor 像‘不如’。他连基本礼貌都不如别人，是个粗鲁的人。", "可靠词源：借自 Dutch boer（farmer）；英语后来以带阶层偏见的方式发展出‘粗野无教养者’义。现代使用应只评价行为，不影射职业。", "熟词桥：boorish 是形容词，a boor 是人；rude behavior → boorish behavior。", "泥靴客人把汤倒进花瓶，还高声解释礼仪不重要，桌上的叉子集体转身。", "历史上的乡民刻板印象 → 没教养的人 → 现代指行为粗鲁、不顾他人感受者。", "易混刹车：boor /bʊər/ 是粗人；bore /bɔːr/ 是使人厌烦的人或钻孔，拼写与元音不同。", "The boor thanked the violin by using it as a dinner tray.", "那个粗人把小提琴当餐盘，以此向它致谢。"),
    ["Is boor an adjective or a noun?", "boor 是形容词还是名词？", "It is a noun for a rude, insensitive person; boorish is the adjective.", "它是指粗鲁不敏感之人的名词；形容词是 boorish。"],
    ["He acted like a ________, interrupting the host and insulting every guest.", "他表现得像个粗人，打断主人并侮辱每位客人。", "A rude, insensitive person is a boor.", "粗鲁而不敏感的人是 boor。"], ["diplomat", "gentleman", "mediator"]),

  vocab(249, "bootless", "/ˈbuːt.ləs/", "adjective · literary", "无用的：useless", "useless, unprofitable, or unable to produce a result", "无用的；徒劳的；无益的",
    "一只没有脚的靴子在跑步机上拼命奔跑，计步器永远显示零。",
    [["a bootless effort", "徒劳的努力", "Their bootless effort changed none of the rules.", "他们徒劳的努力没有改变任何规则。"], ["a bootless search", "无结果的搜寻", "After a bootless search, the team returned before dawn.", "一番无结果的搜寻后，队伍在黎明前返回。"], ["prove bootless", "证明毫无用处", "Further argument proved bootless.", "继续争辩证明毫无用处。"]],
    [["useless", "无用的", "原表注解 · 核心义", "useless 是日常常用词；bootless 是文学或古雅用词，常形容努力徒劳无果。", "This broken key is useless.", "这把坏钥匙毫无用处。", "/ˈjuːs.ləs/"], ["futile", "徒劳的", "近义词", "futile 是现代正式常用词，强调不会成功；bootless 语气更古雅，也含无益、无利可得。", "Resistance seemed futile at that point.", "当时抵抗似乎是徒劳的。", "/ˈfjuː.taɪl/"], ["fruitless", "无成果的", "近义词", "fruitless 用‘不结果实’突出没有成果；bootless 源自旧义 boot ‘益处’，突出没有用处或收益。", "The inquiry ended after a fruitless search.", "调查在一次无果搜寻后结束。", "/ˈfruːt.ləs/"]],
    M("声音联想（非词源）：bootless 看似‘没有靴子’，可借图记徒步追赶注定徒劳；但这不是本词真实构词。", "可靠词源：这里的 boot 是古英语 bōt（benefit, remedy, advantage），加 -less，字面为‘没有益处’，与现代靴子 boot 来源不同。", "熟词桥：把 bootless 暂换成 futile 或 of no avail；尤其常见 bootless effort。", "没有脚的靴子在跑步机上冲刺一夜，奖牌却写着‘零收益’。", "无 benefit → 无实际用处 → 努力无法带来结果，因而徒劳。", "易混刹车：绝不能按现代 boot（靴子）解释真实词源；它是文学词，日常优先 futile/useless。", "The bootless expedition found only a sign saying 'try again yesterday.'", "这次徒劳的探险只发现一块写着‘请昨天再来’的牌子。"),
    ["What old meaning of boot explains bootless?", "boot 的哪个古义解释了 bootless？", "Boot once meant benefit, remedy, or advantage; bootless therefore means without benefit.", "boot 曾表示益处、补救或好处，因此 bootless 是没有益处。"],
    ["Another appeal would be ________; the ruling is final.", "再次上诉也会徒劳，因为裁决已是最终决定。", "An effort certain to bring no benefit is bootless.", "注定不能带来益处的努力是 bootless。"], ["effective", "fruitful", "useful"]),

  vocab(250, "bound", "/baʊnd/", "noun · verb · adjective", "界限：beyond which a person or thing cannot go; 给···设置界限：set limits; 投入的，坚定的：fully committed", "a limit; to restrict within limits; firmly committed or certain to do something", "界限；限制；坚定投入的；必然的",
    "一圈发光边界围住城市，一名系着誓言绳结的人坚定地守在门口。",
    [["beyond the bounds of reason", "超出合理界限", "The claim lies beyond the bounds of reason.", "这项主张超出了合理范围。"], ["bound the inquiry", "限定调查范围", "The court bounded the inquiry to events from that year.", "法院把调查限定在当年事件内。"], ["be bound to succeed", "必然成功", "A careful plan is bound to improve the result.", "周密计划必然会改善结果。"], ["be bound by duty", "受职责约束", "Officials are bound by duty to report the risk.", "官员受职责约束，必须报告风险。"]],
    [["beyond which a person or thing cannot go", "人或物无法越过的界限", "原表注解 · 名词义", "该解释定义名词 bound；常用复数 bounds，表示允许活动或思考的范围。", "The fence marks a line beyond which visitors cannot go.", "围栏标出游客不能越过的界线。", "/bɪˌjɒnd wɪtʃ ə ˌpɜː.sən ɔː ˌθɪŋ ˌkæn.ɒt ˈɡəʊ/"], ["set limits", "设置界限", "原表注解 · 动词义", "set limits 是普通短语；bound 作动词更书面，表示构成边界或限定范围。", "The policy sets limits on campaign spending.", "政策对竞选支出设置限制。", "/ˌset ˈlɪm.ɪts/"], ["fully committed", "全心投入的；坚定的", "原表注解 · 形容词义", "fully committed 强调投入；bound by an oath/duty 强调被承诺约束，bound to do 还可表示必然。", "She is fully committed to the project.", "她全心投入这个项目。", "/ˌfʊl.i kəˈmɪt.ɪd/"], ["limit", "界限；限制", "近义词", "limit 是最宽泛的边界；bound 常见于固定搭配 within/beyond bounds，并带正式色彩。", "There is a strict limit on attendance.", "出席人数有严格限制。", "/ˈlɪm.ɪt/"]],
    M("声音联想（非词源）：bound 像‘绑的’。被绳结绑在边界内，也被承诺牢牢约束。", "词源有多支：边界义来自 Anglo-French bounde；‘捆绑/受约束’是 bind 的过去分词；‘跳跃’又来自另一法语来源。此处不能强行合并为单一词根。", "熟词桥：boundary 与 bound 都指界；be bound by rules 是被规则绑住，be bound to 是‘必然会’。", "发光边界像绳圈围住城堡，守门人把职责打成结，宣布自己绝不会离岗。", "空间边界 → 给范围设限；被义务绑住 → 坚定承担；条件充分 → 必然发生。", "易混刹车：homeward-bound 的 bound 表示‘前往’；本条重点的 bounds、bound by、bound to 需按结构辨义。", "The promise bound the guard more firmly than the glowing wall.", "那份承诺比发光的墙更牢地约束着守卫。"),
    ["How do bound by and bound to differ?", "bound by 与 bound to 有何区别？", "Bound by names a rule or duty that constrains; bound to usually means certain or obligated to act.", "bound by 指约束人的规则或职责；bound to 通常表示必然或有义务做某事。"],
    ["The review must remain within the legal ________ of the committee's authority.", "审查必须保持在委员会权限的法律界限内。", "Bounds are the limits within which something may operate.", "bounds 是事物可以活动的界限。"], ["freedom", "center", "permission"]),
];

const registerByWord = new Map([
  ["blunder", "GRE 高频 · 常用"], ["blunt", "GRE 高频 · 常用"], ["blur", "GRE 高频 · 常用"], ["blurt", "GRE 词汇 · 常用 / 非正式"], ["bluster", "GRE 高频 · 正式 / 贬义"],
  ["boggle", "GRE 高频 · 常用 / 惯用表达"], ["boisterous", "GRE 高频 · 常用"], ["bolster", "GRE 高频 · 正式常用"], ["bombast", "GRE 高频 · 正式 / 贬义"], ["bonhomie", "GRE 词汇 · 正式 / 文学"],
  ["boo", "GRE 词汇 · 常用"], ["boon", "GRE 高频 · 正式常用"], ["boor", "GRE 高频 · 贬义"], ["bootless", "GRE 词汇 · 文学 / 古雅"], ["bound", "GRE 高频 · 多义常用"],
]);
for (const config of all) config.register = registerByWord.get(config.word);

const group = (start) => all.slice(start - 236, start - 231);

export const set48 = compactSet(48, "The Noisy Inkpot", group(236), {
  title: "The Noisy Inkpot",
  targetForms: ["blunder", "blunt", "blurred", "blurted", "bluster"],
  plain: "A blunder made a blunt pencil sing, blurred every map, blurted the mayor's secret, and filled a silent attic with bluster.",
  translation: "一个愚蠢的大错让一支钝铅笔唱起歌，弄模糊了每张地图，脱口说出市长的秘密，还让安静的阁楼充满虚张声势的喧嚷。",
});

export const set49 = compactSet(49, "The Pillow Banquet", group(241), {
  title: "The Pillow Banquet",
  targetForms: ["boggled", "boisterous", "bolstered", "bombast", "bonhomie"],
  plain: "A spoon boggled when a boisterous pillow bolstered its tiny throne with bombast, yet the supper ended in bonhomie.",
  translation: "一把勺子惊呆了：一只喧闹的枕头用浮夸言辞加固自己的小王座；不过晚餐最终仍在和气中结束。",
});

export const set50 = compactSet(50, "The Upside-Down Umbrella", group(246), {
  title: "The Upside-Down Umbrella",
  targetForms: ["booed", "boon", "boor", "bootless", "bounds"],
  plain: "A cloud booed an umbrella, but the umbrella became a boon, while a boor made a bootless attempt to push the rain beyond its bounds.",
  translation: "一朵云向一把伞喝倒彩，但那把伞却成了福音；与此同时，一个粗人徒劳地试图把雨推出它的界限。",
});
