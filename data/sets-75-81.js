import { compactSet, vocab } from "./compact.js";

// Words 371–405. The source annotation is preserved verbatim in rawNote.
const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });
const U = (...x) => [x.slice(0, 4), x.slice(4, 8)];
const C = (word, ipa, meaningZh, role, contrast, en, zh) => [word, meaningZh, role, contrast, en, zh, ipa];
const E = (number, word, ipa, pos, rawNote, coreEn, coreZh, uses, comparisons, rootZh, trapZh, imageZh) => {
  const phrases = uses.flat();
  const first = phrases[0];
  const config = vocab(number, word, ipa, pos, rawNote, coreEn, coreZh, imageZh, phrases, comparisons,
    M(`声音记忆（非词源）：把 ${word} 的读音与“${coreZh}”画面绑定；这只是记忆桥，不是真实词源。`, rootZh,
      `英文桥：先记固定搭配 “${first[0]}”，再从搭配反推 ${word} 的准确语义。`, imageZh,
      `语义落点：${coreZh}；先判断句中对象和动作方向，再选择该词。`, trapZh,
      first[2], first[3]),
    [`What is the precise core of “${word}”?`, `${word} 的准确核心是什么？`, coreEn, coreZh],
    [`Choose “${word}” when the context means: ${coreEn}.`, `语境表示“${coreZh}”时，应选择哪个词？`, `The required word is “${word}”.`, `应选 ${word}。`],
    ["unrelated", "opposite", "neutral"]);
  config.register = "GRE 高频 · 正式 / 书面";
  return config;
};

const all = [
  E(371, "coax", "/kəʊks/", "transitive verb", "哄骗：pleading, flattery, cajole", "to gently persuade by patient pleading or flattery", "耐心哄劝；用恳求或奉承说服",
    [U("coax someone into agreeing", "哄某人同意", "She coaxed the witness into agreeing to speak.", "她耐心哄劝证人同意开口。", "coax an answer from someone", "哄某人说出答案", "The teacher coaxed an answer from the shy child.", "老师耐心哄那个害羞的孩子说出答案。")],
    [C("pleading", "/ˈpliː.dɪŋ/", "恳求", "原表注解 · 手段", "pleading 是恳求本身；coax 是借耐心恳求逐渐说服。", "His pleading did not change the decision.", "他的恳求没有改变决定。"), C("flattery", "/ˈflæt.ər.i/", "奉承", "原表注解 · 手段", "flattery 是赞美手段；coax 还可依靠温和坚持。", "Empty flattery made her suspicious.", "空洞的奉承使她起疑。"), C("cajole", "/kəˈdʒəʊl/", "哄骗，劝诱", "原表注解 · 近义", "cajole 常含甜言蜜语甚至操纵；coax 通常更温和耐心。", "They cajoled him into signing.", "他们用甜言蜜语哄他签字。")],
    "可靠词源：16世纪已有“爱抚、哄弄”义；更深来源不确定，不能据拼写硬拆。", "易混刹车：coax 重在温和慢劝；coerce 重在威胁或武力。", "一把害羞的钥匙被糖果和耐心话语哄着打开了门。"),

  E(372, "coda", "/ˈkəʊ.də/", "noun", "终曲：concluding passage", "a concluding passage that rounds off music, writing, or an event", "乐曲、文章或事件的收尾段；终曲",
    [U("the coda of a symphony", "交响曲的终曲", "The coda of the symphony recalled its opening theme.", "交响曲的终曲重现了开篇主题。", "serve as a coda", "作为收尾", "A quiet scene served as a coda to the film.", "一个安静场景作为影片的收尾。")],
    [C("concluding passage", "/kənˌkluː.dɪŋ ˈpæs.ɪdʒ/", "收尾段", "原表注解 · 定义", "concluding passage 是普通描述；coda 尤指有总结、回响作用的艺术性尾声。", "The concluding passage summarizes the argument.", "收尾段总结了论点。"), C("finale", "/fɪˈnɑː.li/", "终场；终乐章", "近义词", "finale 强调最后且常最盛大的部分；coda 是在主体之后收束的短段。", "The fireworks formed a brilliant finale.", "烟花构成辉煌终场。")],
    "可靠词源：直接借自 Italian coda“尾巴”，源自 Latin cauda。", "易混刹车：coda 是收束尾段；code 是代码；coma 是昏迷。", "一条会唱歌的尾巴在交响曲末尾鞠躬。"),

  E(373, "coerce", "/kəʊˈɜːs/", "transitive verb", "（以武力）强制：force, threat", "to compel by force, intimidation, or threat", "以武力、恐吓或威胁强迫",
    [U("coerce someone into silence", "强迫某人保持沉默", "Officials coerced the clerk into silence.", "官员威逼职员保持沉默。", "coerce a confession", "逼取口供", "The court rejected a confession coerced by threats.", "法院拒绝采纳以威胁逼取的口供。")],
    [C("force", "/fɔːs/", "强迫；力量", "原表注解 · 上位词", "force 很宽泛；coerce 突出以压力剥夺自愿选择。", "They forced the door open.", "他们强行把门打开。"), C("threat", "/θret/", "威胁", "原表注解 · 手段", "threat 是施压工具；coerce 是利用威胁迫使行动。", "The threat caused widespread fear.", "威胁引起广泛恐惧。"), C("compel", "/kəmˈpel/", "迫使", "近义词", "compel 可由规则或事实迫使；coerce 更暗示不正当威逼。", "The evidence compelled a new inquiry.", "证据迫使当局重新调查。")],
    "可靠词源：来自 Latin coercēre“约束、限制”，由 co-“共同”与 arcēre“关住”相关成分构成。", "易混刹车：coerce 不等于 coax；一个靠威胁，一个靠温和劝说。", "一只铁手套拿着威胁信，逼铅笔自己签名。"),

  E(374, "coeval", "/kəʊˈiː.vəl/", "adjective · noun", "同时代的，同龄的：equal age", "of the same age or historical period; a contemporary", "同龄的；同时代的；同代者",
    [U("be coeval with", "与……同时代", "The temple is coeval with the ancient bridge.", "这座神庙与那座古桥同时代。", "coeval traditions", "同时代的传统", "The archive preserves two coeval traditions.", "档案保存了两种同时代传统。")],
    [C("equal age", "/ˌiː.kwəl ˈeɪdʒ/", "年龄相同", "原表注解 · 定义", "equal age 是说明性短语；coeval 也可用于历史时期和制度。", "The two trees are of equal age.", "这两棵树树龄相同。"), C("contemporary", "/kənˈtem.pər.ər.i/", "同时代的；同代人", "近义词", "contemporary 更常用且可指现代；coeval 精确表示起源或存在于同一时期。", "The writers were contemporaries.", "这些作家是同代人。")],
    "可靠构词：co-“共同” + Latin aevum“时代、年龄”相关成分。", "易混刹车：coeval 说同龄/同时代；congenial 说合得来。", "两只同龄的钟同时过生日，却互相赠送时间。"),

  E(375, "cogent", "/ˈkəʊ.dʒənt/", "adjective", "令人信服的：convincing; 相关的：pertinent", "clear, logical, and convincing; directly pertinent", "有力而令人信服的；切题相关的",
    [U("a cogent argument", "有说服力的论证", "She presented a cogent argument for reform.", "她提出了支持改革的有力论证。", "cogent evidence", "有力证据", "The report offers cogent evidence of bias.", "报告提供了偏见存在的有力证据。"), U("cogent to the issue", "与问题切实相关", "Only facts cogent to the issue were admitted.", "只有与问题切实相关的事实获准采纳。", "a cogent response", "切题有力的回应", "His cogent response addressed the central objection.", "他切题有力的回应处理了核心异议。")],
    [C("convincing", "/kənˈvɪn.sɪŋ/", "令人信服的", "原表注解 · 结果", "convincing 描述效果；cogent 还暗示推理清晰严密。", "Her explanation was convincing.", "她的解释令人信服。"), C("pertinent", "/ˈpɜː.tɪ.nənt/", "相关的，切题的", "原表注解 · 相关性", "pertinent 只强调切题；cogent 常同时强调足以说服。", "Please provide pertinent details.", "请提供相关细节。")],
    "可靠词源：来自 Latin cogere“驱使、迫使”，历史图像是论证强到迫使人同意。", "易混刹车：cogent 不是 merely relevant；它通常既切题又有说服力。", "一个逻辑齿轮把所有理由咬合起来，推动法官点头。"),

  E(376, "cognizant", "/ˈkɒɡ.nɪ.zənt/", "adjective", "知道的，意识到的：aware", "having knowledge or awareness of something", "知道的；意识到的",
    [U("be cognizant of the risk", "意识到风险", "Managers must be cognizant of the legal risk.", "管理者必须意识到法律风险。", "remain cognizant that", "始终意识到……", "Remain cognizant that the figures are provisional.", "要始终意识到这些数字只是暂定的。")],
    [C("aware", "/əˈweər/", "意识到的", "原表注解 · 近义", "aware 最普通；cognizant 更正式，常用于责任、事实或风险。", "We are aware of the delay.", "我们知道这一延误。"), C("conscious", "/ˈkɒn.ʃəs/", "意识到的；有意识的", "近义词", "conscious 可指清醒或主观感受；cognizant 专指知道某事实。", "She was conscious of being watched.", "她意识到有人在看她。")],
    "可靠词源：经法语 cognisant，来自 Latin cognoscere“认识、得知”，与 cognition 同族。", "易混刹车：固定搭配 cognizant of；不要误写成 cognisant 之外的随意变体（英式 cognisant 可用）。", "一只大脑戴着警报灯，清楚知道每一扇门后的风险。"),

  E(377, "collapse", "/kəˈlæps/", "noun · verb", "突然倒塌或收缩：fall, shrink; 完全耗尽体力：depletion, energy, strength; 失败：unsuccessful", "to fall or shrink suddenly, lose all strength, or fail completely", "突然倒塌或收缩；体力耗尽倒下；彻底失败",
    [U("collapse suddenly", "突然倒塌", "The damaged roof collapsed suddenly.", "受损屋顶突然倒塌。", "collapse under pressure", "在压力下坍塌", "The container collapsed under pressure.", "容器在压力下瘪了。"), U("collapse from exhaustion", "累得倒下", "He collapsed from exhaustion after the race.", "赛后他筋疲力尽地倒下。", "be close to collapse", "接近体力崩溃", "The climber was close to collapse.", "登山者接近体力崩溃。"), U("talks collapse", "谈判失败", "The peace talks collapsed overnight.", "和平谈判一夜之间失败。", "economic collapse", "经济崩溃", "The policy triggered economic collapse.", "该政策引发经济崩溃。")],
    [C("fall", "/fɔːl/", "落下；倒下", "原表注解 · 物理义", "fall 是普通下落；collapse 强调结构失去支撑而突然垮下。", "Leaves fall in autumn.", "树叶在秋天落下。"), C("shrink", "/ʃrɪŋk/", "收缩", "原表注解 · 形变", "shrink 可缓慢变小；collapse 是迅速向内瘪缩。", "Wool may shrink in hot water.", "羊毛遇热水可能缩水。"), C("depletion", "/dɪˈpliː.ʃən/", "耗尽", "原表注解 · 体力", "depletion 是资源减少；collapse 是耗尽后的突然倒下。", "Sleep loss caused energy depletion.", "缺觉造成精力耗尽。"), C("unsuccessful", "/ˌʌn.səkˈses.fəl/", "不成功的", "原表注解 · 失败", "unsuccessful 只说没成功；collapse 表示系统、计划或谈判彻底瓦解。", "The first attempt was unsuccessful.", "第一次尝试没有成功。")],
    "可靠词源：来自 Latin collabi“共同滑落、坍下”，由 col- + labi“滑落”构成。", "易混刹车：collapse 强调突然失去结构或功能；decline 可是渐进下降。", "纸城先向内缩，再累倒，最后连它的经济也宣告失败。"),

  E(378, "collude", "/kəˈluːd/", "intransitive verb", "串通，共谋（做坏事）：together secretly, fraudulent, deceitful, conspire", "to cooperate secretly for a fraudulent or deceitful purpose", "为欺诈或不正当目的秘密串通",
    [U("collude with competitors", "与竞争者串通", "The firms colluded with competitors to fix prices.", "这些公司与竞争者串通操纵价格。", "collude to deceive", "串通欺骗", "The witnesses colluded to deceive the investigators.", "证人串通欺骗调查人员。")],
    [C("together secretly", "/təˌɡeð.ər ˈsiː.krət.li/", "秘密共同进行", "原表注解 · 方式", "该短语描述秘密合作；collude 进一步要求不正当目的。", "They met together secretly at night.", "他们夜里秘密会面。"), C("fraudulent", "/ˈfrɔː.djə.lənt/", "欺诈性的", "原表注解 · 目的", "fraudulent 描写行为性质；collude 描写多人共同实施。", "The claim was fraudulent.", "该索赔具有欺诈性。"), C("deceitful", "/dɪˈsiːt.fəl/", "欺骗的", "原表注解 · 品质", "deceitful 可形容个人；collude 必须有两方以上秘密配合。", "His deceitful account misled readers.", "他的欺骗性叙述误导读者。"), C("conspire", "/kənˈspaɪər/", "密谋", "原表注解 · 近义", "conspire 常指策划违法行动；collude 尤常见于商业、诉讼中的秘密合作。", "They conspired to overthrow the ruler.", "他们密谋推翻统治者。")],
    "可靠词源：来自 Latin colludere“一起玩”，由 col-“共同” + ludere“玩”构成，后转为暗中串通。", "易混刹车：collaborate 可中性或褒义；collude 必然带秘密和不正当。", "两只算盘躲在窗帘后一起玩作弊游戏。"),

  E(379, "colossal", "/kəˈlɒs.əl/", "adjective", "巨大的：size, degree, immense", "extremely large in size, degree, or effect", "规模、程度或影响极其巨大的",
    [U("a colossal statue", "巨像", "A colossal statue dominated the harbor.", "一座巨像俯瞰港口。", "a colossal amount", "极其巨大的数量", "The repair required a colossal amount of money.", "维修需要极其巨额的资金。")],
    [C("size", "/saɪz/", "尺寸，规模", "原表注解 · 维度", "size 是中性名词；colossal 表示尺寸大到惊人。", "The rooms vary in size.", "这些房间大小各异。"), C("degree", "/dɪˈɡriː/", "程度", "原表注解 · 抽象尺度", "degree 可高可低；colossal 表示程度异常高。", "The degree of damage remains unclear.", "损坏程度仍不清楚。"), C("immense", "/ɪˈmens/", "巨大的", "原表注解 · 近义", "immense 是宽泛大；colossal 带巨像般壮观或惊人的语气。", "The desert is immense.", "沙漠广阔无边。")],
    "可靠词源：来自 Greek kolossos“巨像”，经 Latin、French 进入英语。", "易混刹车：colossal 可修饰错误、浪费等抽象程度；corporeal 则表示肉体/实体。", "一只巨大的茶杯把城市当作方糖放进水里。"),

  E(380, "coltish", "/ˈkəʊl.tɪʃ/", "adjective", "不守纪律的：not subjected, discipline; 爱开玩笑的：joking, teasing", "playfully energetic, awkward, or undisciplined like a young horse", "像小马般活泼顽皮、笨拙或不守纪律的",
    [U("coltish behavior", "小马般顽皮的行为", "His coltish behavior disrupted the ceremony.", "他小马般顽皮的行为扰乱了仪式。", "a coltish youth", "活泼冒失的年轻人", "The coltish youth bounded onto the stage.", "那个活泼冒失的年轻人蹦上舞台。"), U("coltish teasing", "顽皮打趣", "Their coltish teasing remained affectionate.", "他们顽皮的打趣仍带着善意。", "a coltish joke", "顽皮玩笑", "She answered with a coltish joke.", "她用一个顽皮玩笑回应。")],
    [C("undisciplined", "/ˈʌnˌdɪs.ə.plɪnd/", "不守纪律的", "原表注解 · 行为", "undisciplined 直接批评缺管束；coltish 带年轻动物般可爱而冒失的画面。", "The undisciplined class ignored instructions.", "这个不守纪律的班级无视指示。"), C("joking", "/ˈdʒəʊ.kɪŋ/", "开玩笑", "原表注解 · 语气", "joking 只是开玩笑；coltish 还暗示精力旺盛、动作冒失。", "He was only joking.", "他只是在开玩笑。"), C("teasing", "/ˈtiː.zɪŋ/", "逗弄，取笑", "原表注解 · 互动", "teasing 可友好也可伤人；coltish teasing 通常是年轻而顽皮。", "Her teasing annoyed him.", "她的取笑惹恼了他。")],
    "可靠构词：colt“小公马；无经验的年轻人” + -ish“像……的”。", "易混刹车：coltish 常含青春活力，不等于恶意 unruly。", "一匹小马穿着西装在典礼上跳过所有椅子。"),

  E(381, "coma", "/ˈkəʊ.mə/", "noun", "昏迷，深度无知觉：profound unconsciousness; 迟钝，冷漠：sluggishness", "a state of profound unconsciousness; figurative torpor or sluggish apathy", "昏迷；比喻性的迟钝或冷漠",
    [U("fall into a coma", "陷入昏迷", "The patient fell into a coma after the accident.", "患者在事故后陷入昏迷。", "remain in a coma", "仍处于昏迷", "She remained in a coma for three days.", "她昏迷了三天。"), U("a cultural coma", "文化上的麻木状态", "The critic described the decade as a cultural coma.", "评论家把那十年描述为文化麻木期。", "emerge from a coma of apathy", "从麻木冷漠中醒来", "The town emerged from a coma of apathy.", "小镇从麻木冷漠中醒来。")],
    [C("profound unconsciousness", "/prəˌfaʊnd ʌnˈkɒn.ʃəs.nəs/", "深度无意识", "原表注解 · 医学义", "该短语是 coma 的医学核心；普通 sleep 可以自然唤醒。", "The injury caused profound unconsciousness.", "受伤造成深度无意识。"), C("sluggishness", "/ˈslʌɡ.ɪʃ.nəs/", "迟钝，行动缓慢", "原表注解 · 比喻义", "sluggishness 可只是缓慢；coma 比喻义更强，像整体失去反应。", "Economic sluggishness continued.", "经济迟滞持续。"), C("stupor", "/ˈstjuː.pər/", "昏沉，麻木", "近义词", "stupor 是反应迟钝但未必完全失去意识；coma 通常更深。", "He sat in a drunken stupor.", "他醉得昏沉地坐着。")],
    "可靠词源：来自 Greek kōma“深睡”，经 Latin 进入英语。", "易混刹车：coma 是昏迷；coda 是终曲；comma 是逗号。", "一个逗号睡得太沉，医生宣布它进入了昏迷。"),

  E(382, "combustible", "/kəmˈbʌs.tə.bəl/", "adjective · noun", "可燃的：igniting; 容易激动的：easily excited", "able to catch fire; figuratively quick to become excited or angry", "可燃的；容易激动或发怒的",
    [U("combustible material", "可燃材料", "Keep combustible material away from the heater.", "让可燃材料远离加热器。", "highly combustible", "高度易燃的", "The dry fibers are highly combustible.", "干纤维高度易燃。"), U("a combustible temper", "一点就着的脾气", "His combustible temper worried the staff.", "他一点就着的脾气令员工担忧。", "a combustible atmosphere", "容易爆发冲突的气氛", "One insult could ignite the combustible atmosphere.", "一句侮辱就可能点燃紧张易爆的气氛。")],
    [C("igniting", "/ɪɡˈnaɪ.tɪŋ/", "点燃", "原表注解 · 物理义", "igniting 是着火动作；combustible 描述材料具备着火能力。", "A spark ignited the paper.", "火星点燃了纸。"), C("easily excited", "/ˌiː.zɪ.li ɪkˈsaɪ.tɪd/", "容易激动", "原表注解 · 比喻义", "easily excited 可含快乐；combustible 多暗示情绪可能爆发。", "The children are easily excited by music.", "孩子们很容易因音乐兴奋。"), C("flammable", "/ˈflæm.ə.bəl/", "易燃的", "近义词", "flammable 是现代安全标识常用词；combustible 也可比喻脾气和局势。", "Gasoline is highly flammable.", "汽油高度易燃。")],
    "可靠词源：来自 Latin comburere“烧尽”相关的 combust- + -ible。", "易混刹车：inflammable 也表示易燃，不表示不燃；安全语境优先看 flammable 标识。", "一张脾气暴躁的纸听到批评后自己着火了。"),

  E(383, "comely", "/ˈkʌm.li/", "adjective", "漂亮的，吸引人的：pleasing, wholesome, attractive", "pleasant and wholesome in appearance; attractive", "端庄悦目的；健康漂亮的；有吸引力的",
    [U("a comely appearance", "端庄悦目的外表", "The portrait shows a comely young musician.", "肖像画中是一位端庄漂亮的年轻音乐家。", "a comely face", "清秀端庄的脸", "Her comely face brightened the room.", "她端庄清秀的脸使房间显得明亮。")],
    [C("pleasing", "/ˈpliː.zɪŋ/", "令人愉悦的", "原表注解 · 效果", "pleasing 可形容任何事物；comely 多形容人外貌端庄悦目。", "The design is pleasing to the eye.", "这个设计赏心悦目。"), C("wholesome", "/ˈhəʊl.səm/", "健康纯朴的", "原表注解 · 气质", "wholesome 强调健康正面；comely 把这种气质与外貌吸引力结合。", "They served a wholesome meal.", "他们提供了一顿健康餐。"), C("attractive", "/əˈtræk.tɪv/", "有吸引力的", "原表注解 · 上位词", "attractive 最普通；comely 较旧式、书面，常有端庄健康感。", "The town is attractive in spring.", "这座城春天很迷人。")],
    "可靠词源：来自 Old English cymlic“可爱的、光彩的”，与 come 的现代常用义不可直接硬连。", "易混刹车：comely 较旧式，主要形容人；不要误当 comfortably。", "一位端庄的小提琴手让镜子也整理好自己的领结。"),

  E(384, "comity", "/ˈkɒm.ɪ.ti/", "noun", "友好，社会和谐：friendly, harmony", "courtesy and friendly social harmony, especially between groups or states", "群体或国家之间的礼让、友好与社会和谐",
    [U("international comity", "国际礼让", "The treaty promoted international comity.", "该条约促进了国际礼让。", "preserve civic comity", "维护社会和睦", "Leaders appealed for calm to preserve civic comity.", "领导人呼吁冷静以维护社会和睦。")],
    [C("friendly", "/ˈfrend.li/", "友好的", "原表注解 · 态度", "friendly 描写一般态度；comity 是群体之间有礼合作的状态。", "The staff were friendly and helpful.", "员工友好且乐于助人。"), C("harmony", "/ˈhɑː.mə.ni/", "和谐", "原表注解 · 状态", "harmony 范围宽；comity 更正式，强调相互礼让而非法律义务。", "The communities lived in harmony.", "这些社区和谐共处。"), C("civility", "/sɪˈvɪl.ə.ti/", "礼貌，文明举止", "近义词", "civility 是个人或公共讨论的礼貌；comity 常指组织、法院或国家间礼让。", "Civility returned to the debate.", "辩论恢复了礼貌。")],
    "可靠词源：来自 Latin comitas“礼貌、亲切”，与 comis“友善的”相关。", "易混刹车：comity 是礼让和睦；committee 是委员会；commodity 是商品。", "两个争吵国家让茶壶担任外交官，终于礼貌地共享一块饼干。"),

  E(385, "commencement", "/kəˈmens.mənt/", "noun", "开始：beginning; 毕业典礼：conferring", "a beginning; a ceremony at which degrees are conferred", "开始；授予学位的毕业典礼",
    [U("at the commencement of", "在……开始时", "Payment is due at the commencement of the contract.", "款项应在合同开始时支付。", "commencement of work", "开工", "The commencement of work was delayed by rain.", "开工因雨推迟。"), U("a commencement ceremony", "毕业典礼", "Families attended the commencement ceremony.", "家属参加了毕业典礼。", "deliver a commencement address", "发表毕业演讲", "The scientist delivered a commencement address.", "科学家发表了毕业演讲。")],
    [C("beginning", "/bɪˈɡɪn.ɪŋ/", "开始", "原表注解 · 普通义", "beginning 最普通；commencement 更正式，常用于法律文本和仪式。", "The beginning of the book is vivid.", "这本书开头生动。"), C("conferring", "/kənˈfɜː.rɪŋ/", "授予", "原表注解 · 仪式义", "conferring degrees 是毕业典礼核心动作；commencement 指整场典礼。", "The university is conferring honorary degrees.", "大学正在授予荣誉学位。"), C("graduation", "/ˌɡrædʒ.uˈeɪ.ʃən/", "毕业；毕业典礼", "近义词", "graduation 强调完成学业；commencement 是美式正式典礼名，寓意新阶段开始。", "Her graduation is in June.", "她六月毕业。")],
    "可靠词源：commence + -ment；commence 经 Old French，来自 Late Latin cominitiare“开始”。", "易混刹车：commencement 在美式英语可直接指毕业典礼，不是入学典礼。", "毕业生在“开始典礼”上结束学业，一顶学位帽开始了自己的飞行。"),

  E(386, "commend", "/kəˈmend/", "transitive verb", "赞扬：approbation, praise; 委托保管：entrust; 推荐：recommend", "to praise, entrust to care, or recommend as worthy", "赞扬；委托照管；推荐",
    [U("commend someone for courage", "赞扬某人的勇气", "The judge commended her for her courage.", "法官赞扬了她的勇气。", "a highly commended essay", "受到高度赞扬的文章", "Her essay was highly commended by the panel.", "她的文章受到评审组高度赞扬。"), U("commend a child to someone's care", "把孩子托付某人照管", "He commended the child to his sister's care.", "他把孩子托付给姐姐照管。", "commend one's spirit to God", "把灵魂托付给上帝", "The old prayer commends the sailor's spirit to God.", "古老祷词把水手的灵魂托付给上帝。"), U("commend a plan to the board", "向董事会推荐方案", "I commend this plan to the board.", "我向董事会推荐这一方案。", "commend itself to", "证明自身值得接受", "The practical proposal commended itself to voters.", "这项务实提案赢得了选民认可。")],
    [C("approbation", "/ˌæp.rəˈbeɪ.ʃən/", "正式赞许", "原表注解 · 赞扬", "approbation 是赞许这一名词；commend 是明确表达赞许的动作。", "The reform received public approbation.", "改革获得公众赞许。"), C("praise", "/preɪz/", "赞扬", "原表注解 · 近义", "praise 普通；commend 较正式，常说明因何受赞扬。", "Teachers praised the careful work.", "教师赞扬了细致工作。"), C("entrust", "/ɪnˈtrʌst/", "委托保管", "原表注解 · 托付", "entrust 是现代常用语；commend to someone's care 较庄重或旧式。", "She entrusted the keys to me.", "她把钥匙托付给我。"), C("recommend", "/ˌrek.əˈmend/", "推荐", "原表注解 · 推荐", "recommend 常给实用建议；commend to 强调认为某人或某物值得认可。", "I recommend the earlier train.", "我建议坐早班火车。")],
    "可靠词源：来自 Latin commendare“托付、推荐”，由 com- + mandare“委托”相关成分构成。", "易混刹车：commend 是赞扬/推荐；comment 是评论；command 是命令。", "一枚奖章先赞扬骑士，再把一只小龙托付给他。"),

  E(387, "commensurate", "/kəˈmen.sjər.ət/", "adjective", "同样大小的：equal; 相称的，相当的：proportionate", "equal in measure or properly proportionate", "同量的；与……相称的、成比例的",
    [U("commensurate in size", "大小相同", "The two grants were commensurate in size.", "两笔补助规模相同。", "commensurate quantities", "等量", "The containers hold commensurate quantities.", "这些容器装有等量物质。"), U("pay commensurate with experience", "与经验相称的薪酬", "Applicants expect pay commensurate with experience.", "申请者期望获得与经验相称的薪酬。", "a response commensurate with the risk", "与风险相称的应对", "The threat requires a response commensurate with the risk.", "这一威胁需要与风险相称的应对。")],
    [C("equal", "/ˈiː.kwəl/", "相等的", "原表注解 · 同量", "equal 表示完全相同；commensurate 也常表示按某标准恰当匹配。", "The two shares are equal.", "两份份额相等。"), C("proportionate", "/prəˈpɔː.ʃən.ət/", "成比例的", "原表注解 · 相称", "proportionate 强调数学或逻辑比例；commensurate 常用于薪酬、责任、回应与标准匹配。", "The fee is proportionate to the service.", "费用与服务成比例。"), C("comparable", "/ˈkɒm.pər.ə.bəl/", "可比较的；相当的", "近义词", "comparable 只表示能比较或大致类似；commensurate 强调应当匹配。", "The two products are comparable in price.", "两种产品价格相当。")],
    "可靠词源：来自 Latin commensurare“共同测量”，与 measure 同属测量概念。", "易混刹车：最常见结构 commensurate with，不用 commensurate to。", "工资拿着尺子，努力长到与责任一样高。"),

  E(388, "commingle", "/kəˈmɪŋ.ɡəl/", "verb", "充分混合：blend", "to mix thoroughly together", "充分混合；掺合",
    [U("commingle funds", "混合资金", "The trustee must not commingle personal and client funds.", "受托人不得混合个人与客户资金。", "commingle with the crowd", "与人群混在一起", "Visitors commingled with local residents.", "游客与当地居民混在一起。")],
    [C("blend", "/blend/", "混合", "原表注解 · 近义", "blend 可强调融合后难以区分；commingle 只强调事物混在一起，常见于法律财务。", "Blend the fruit until smooth.", "把水果搅打至顺滑。"), C("mingle", "/ˈmɪŋ.ɡəl/", "混合；交往", "同根近义词", "commingle 与 mingle 意近，但前者更正式并强调共同混合。", "Guests mingled after dinner.", "宾客晚餐后互相交谈。")],
    "可靠构词：com-“共同” + mingle“混合”；com- 在 m 前同化为 comm-。", "易混刹车：财务语境 commingle funds 常指违规混账；combine 更宽泛。", "两种颜色跳进同一只袜子，混到谁也找不到自己的边界。"),

  E(389, "commitment", "/kəˈmɪt.mənt/", "noun", "致力，投入：obligated, impelled; 确信：belief; 承诺，表态：revealing one’s view", "an obligation or devoted investment; a firm belief; a stated pledge or position", "义务与投入；坚定信念；承诺或明确表态",
    [U("a commitment to reform", "致力于改革", "The mayor renewed her commitment to reform.", "市长重申她对改革的投入。", "make a long-term commitment", "作出长期投入", "The project requires a long-term commitment.", "该项目需要长期投入。"), U("a deep commitment to justice", "对正义的坚定信念", "His deep commitment to justice shaped his career.", "他对正义的坚定信念塑造了职业生涯。", "religious commitment", "宗教信念", "The diary records her religious commitment.", "日记记录了她坚定的宗教信念。"), U("make a public commitment", "公开承诺", "The company made a public commitment to cut emissions.", "公司公开承诺减排。", "avoid a firm commitment", "避免明确表态", "The minister avoided a firm commitment on taxes.", "部长避免就税收明确表态。")],
    [C("obligated", "/ˈɒb.lɪ.ɡeɪ.tɪd/", "负有义务的", "原表注解 · 约束", "obligated 描写受责任约束；commitment 是这种义务或投入本身。", "We are obligated to report the error.", "我们有义务报告错误。"), C("impelled", "/ɪmˈpeld/", "被推动的", "原表注解 · 动力", "impelled 强调被力量推动；commitment 可成为持续行动的内在动力。", "Concern impelled her to act.", "担忧促使她行动。"), C("belief", "/bɪˈliːf/", "信念", "原表注解 · 确信", "belief 可强可弱；commitment 表示愿意据此行动的坚定信念。", "The belief lacks evidence.", "这一信念缺乏证据。"), C("pledge", "/pledʒ/", "誓言，承诺", "原表注解 · 表态", "pledge 是明确说出的保证；commitment 也可包括时间、资源上的实际投入。", "They made a pledge to cooperate.", "他们承诺合作。")],
    "可靠构词：commit + -ment；commit 来自 Latin committere“结合、托付、实施”。", "易混刹车：commitment 可数时是具体承诺，不可数时常指投入程度。", "一个承诺把时间、钱和信念全装进背包，拒绝中途下车。"),

  E(390, "committed", "/kəˈmɪt.ɪd/", "adjective", "忠诚的，忠实的：loyal", "firmly devoted and loyal to a cause, person, or course", "坚定投入的；忠诚的",
    [U("a committed teacher", "尽心尽责的教师", "She is a committed teacher who supports every student.", "她是一位尽心支持每名学生的教师。", "committed to equality", "坚定致力于平等", "The organization remains committed to equality.", "该组织仍坚定致力于平等。")],
    [C("loyal", "/ˈlɔɪ.əl/", "忠诚的", "原表注解 · 近义", "loyal 强调不背叛关系；committed 强调长期投入行动和资源。", "The staff remained loyal to the founder.", "员工仍忠于创始人。"), C("dedicated", "/ˈded.ɪ.keɪ.tɪd/", "全心投入的", "近义词", "dedicated 与 committed 很接近；committed to 还可明确表示赞同某原则。", "A dedicated team completed the work.", "一支敬业团队完成了工作。")],
    "可靠构词：commit 的过去分词形容词；双写 t 后加 -ed。", "易混刹车：be committed to 后接名词或动名词：committed to improving，不是 to improve。", "一名忠诚的园丁把日历全部种进花园，表示长期投入。"),

  E(391, "commodious", "/kəˈməʊ.di.əs/", "adjective", "宽敞舒适的：spacious", "spacious, convenient, and comfortable", "宽敞方便而舒适的",
    [U("a commodious apartment", "宽敞舒适的公寓", "They rented a commodious apartment near the station.", "他们在车站附近租了一套宽敞舒适的公寓。", "a commodious cabin", "宽敞舒适的舱室", "The ship has a commodious cabin for guests.", "船上有一间供客人使用的宽敞舱室。")],
    [C("spacious", "/ˈspeɪ.ʃəs/", "宽敞的", "原表注解 · 近义", "spacious 只强调空间大；commodious 还暗示布局方便、住着舒服。", "The lobby is bright and spacious.", "大厅明亮宽敞。"), C("roomy", "/ˈruː.mi/", "宽敞的", "近义词 · 非正式", "roomy 更口语；commodious 较旧式、正式。", "The car is surprisingly roomy.", "这辆车出奇地宽敞。")],
    "可靠词源：来自 Latin commodus“方便、合适”，与 commodity 同族但现代义不同。", "易混刹车：commodious 是宽敞舒适；commodity 是商品。", "一只小手提箱打开后，里面竟有宽敞客厅和三扇窗。"),

  E(392, "commonsensical", "/ˌkɒm.ənˈsen.sɪ.kəl/", "adjective", "符合常识的，有依据的：common sense, sound", "showing practical common sense; sound and sensible", "符合常识的；稳妥有理的",
    [U("a commonsensical approach", "合乎常识的做法", "We need a commonsensical approach to the shortage.", "我们需要以合乎常识的方式应对短缺。", "commonsensical advice", "务实有理的建议", "Her commonsensical advice prevented waste.", "她务实有理的建议避免了浪费。")],
    [C("common sense", "/ˌkɒm.ən ˈsens/", "常识；实际判断力", "原表注解 · 来源", "common sense 是名词；commonsensical 是由它派生的形容词。", "Common sense suggests waiting.", "常识告诉我们应该等待。"), C("sound", "/saʊnd/", "稳妥的；可靠的", "原表注解 · 评价", "sound 可指逻辑、财务或健康可靠；commonsensical 特指符合日常实践判断。", "The proposal is financially sound.", "提案在财务上稳健。"), C("sensible", "/ˈsen.sə.bəl/", "明智的", "近义词", "sensible 更常用自然；commonsensical 较少见，刻意突出常识。", "Wear sensible shoes for the walk.", "步行时穿实用的鞋。")],
    "可靠构词：common sense + -ical；属于透明派生词，并非古典词根拼装。", "易混刹车：该词正确但较笨重；普通语境常用 sensible 或 common-sense。", "一把常识雨伞先看天气，再决定是否给鱼穿雨衣。"),

  E(393, "commotion", "/kəˈməʊ.ʃən/", "noun", "骚乱：disturbance", "a noisy disturbance, confusion, or sudden activity", "喧闹骚动；混乱",
    [U("cause a commotion", "引起骚动", "The falling shelf caused a commotion in the library.", "倒下的书架在图书馆引起一阵骚动。", "hear a commotion", "听见骚动", "We heard a commotion outside the gate.", "我们听见大门外一阵骚动。")],
    [C("disturbance", "/dɪˈstɜː.bəns/", "骚乱；干扰", "原表注解 · 上位词", "disturbance 范围宽；commotion 常是突然、嘈杂且多人慌乱。", "A minor disturbance interrupted the meeting.", "一个小插曲打断了会议。"), C("uproar", "/ˈʌp.rɔːr/", "喧嚣；强烈抗议", "近义词", "uproar 更响、更强烈；commotion 可只是一阵忙乱。", "The verdict caused an uproar.", "判决引起轩然大波。")],
    "可靠词源：来自 Latin commotio“剧烈运动、骚动”，与 motion 同族。", "易混刹车：commotion 是骚动；comity 是和睦；commencement 是开始。", "图书馆里一本书打喷嚏，所有书架立刻喧闹奔跑。"),

  E(394, "compendium", "/kəmˈpen.di.əm/", "noun", "摘要：summary, abstract; 目录，各种各样的列表或集合：list, collection", "a concise summary or a comprehensive collection/list of information", "摘要；资料汇编、目录或集合",
    [U("a compendium of history", "历史摘要", "The handbook is a concise compendium of local history.", "这本手册是当地历史的简明摘要。", "a useful compendium", "实用概要", "Students received a useful compendium of key theories.", "学生拿到了一份重要理论概要。"), U("a compendium of recipes", "食谱汇编", "She published a compendium of regional recipes.", "她出版了一部地方食谱汇编。", "an illustrated compendium", "插图资料集", "The museum produced an illustrated compendium of its collection.", "博物馆制作了馆藏插图资料集。")],
    [C("summary", "/ˈsʌm.ər.i/", "摘要", "原表注解 · 浓缩", "summary 可很短；compendium 往往系统覆盖一个领域。", "The report begins with a summary.", "报告以摘要开头。"), C("abstract", "/ˈæb.strækt/", "摘要", "原表注解 · 学术摘要", "abstract 常是论文前的简短概述；compendium 是独立的概要或汇编。", "Read the article's abstract first.", "先读文章摘要。"), C("list", "/lɪst/", "列表", "原表注解 · 编排", "list 只是逐项列出；compendium 通常带说明并系统汇总。", "The page contains a list of names.", "页面列有姓名。"), C("collection", "/kəˈlek.ʃən/", "集合，汇编", "原表注解 · 集成", "collection 可无系统；compendium 通常为了便利查阅而编成。", "The library owns a manuscript collection.", "图书馆拥有手稿收藏。")],
    "可靠词源：来自 Latin compendium“节省、缩写”，由共同衡量所得的“捷径”义发展。", "易混刹车：compendium 可以是摘要也可以是全面汇编，具体看 of 后对象。", "一本小书吞下整座图书馆，却只打了三页长的嗝。"),

  E(395, "complacency", "/kəmˈpleɪ.sən.si/", "noun", "自满，无忧患意识：self-satisfaction, unawareness of trouble", "smug self-satisfaction accompanied by failure to notice danger or defects", "自满；因自我满足而缺乏忧患意识",
    [U("a sense of complacency", "自满情绪", "Early success created a dangerous sense of complacency.", "早期成功造成了危险的自满情绪。", "guard against complacency", "警惕自满", "The coach warned the team to guard against complacency.", "教练警告队伍要警惕自满。")],
    [C("self-satisfaction", "/ˌself.sæt.ɪsˈfæk.ʃən/", "自我满足", "原表注解 · 心态", "self-satisfaction 可中性；complacency 通常贬义，暗示停止警惕。", "He smiled with self-satisfaction.", "他自我满足地笑了。"), C("unawareness of trouble", "/ˌʌn.əˈweə.nəs əv ˈtrʌb.əl/", "没有意识到麻烦", "原表注解 · 后果", "这是 complacency 的危险结果：因满意现状而忽视问题。", "Their unawareness of trouble delayed action.", "他们未意识到麻烦，因而延误行动。"), C("contentment", "/kənˈtent.mənt/", "满足，知足", "易混近义词", "contentment 是平静知足，可褒义；complacency 是自满松懈。", "She felt quiet contentment.", "她感到平静满足。")],
    "可靠词源：来自 Latin complacere“使非常愉快”；现代贬义集中在满意到失去警觉。", "易混刹车：complacency 不是 complaisance；前者自满，后者讨好顺从。", "警报器因连续获奖而自满，索性把自己的电池拿去度假。"),

  E(396, "complaisance", "/kəmˈpleɪ.zəns/", "noun", "愿意顺从，讨好，彬彬有礼：comply, affability", "a courteous willingness to please or comply", "愿意讨好顺从；殷勤和蔼",
    [U("excessive complaisance", "过度讨好顺从", "His excessive complaisance made honest disagreement impossible.", "他的过度顺从让坦诚分歧变得不可能。", "respond with complaisance", "殷勤顺从地回应", "The host responded with unfailing complaisance.", "主人始终殷勤顺从地回应。")],
    [C("comply", "/kəmˈplaɪ/", "遵从", "原表注解 · 行为", "comply 是按要求行动；complaisance 是愿意取悦并顺从的性情。", "The firm agreed to comply with the order.", "公司同意遵从命令。"), C("affability", "/ˌæf.əˈbɪl.ə.ti/", "和蔼可亲", "原表注解 · 态度", "affability 强调友善好相处；complaisance 还含迁就他人愿望。", "Her affability welcomed newcomers.", "她的和蔼让新人感到受欢迎。"), C("deference", "/ˈdef.ər.əns/", "敬重顺从", "近义词", "deference 源于尊重地位；complaisance 源于想让人满意。", "They treated the judge with deference.", "他们恭敬地对待法官。")],
    "可靠词源：来自 French complaisance，关联 complaire“取悦”，最终源自 Latin complacere。", "易混刹车：complaisance /-zəns/ 是讨好顺从；complacency /-sənsi/ 是自满。", "一位过分殷勤的椅子向每位客人鞠躬，最后把自己折成了桌子。"),

  E(397, "compliant", "/kəmˈplaɪ.ənt/", "adjective", "顺从的：submissive", "willing to obey; meeting rules or standards", "顺从的；符合规定的",
    [U("a compliant child", "顺从的孩子", "The unusually compliant child followed every instruction.", "这个异常顺从的孩子听从每项指示。", "remain compliant", "保持服从", "The captive remained compliant throughout the search.", "被拘者在搜查期间一直服从。"), U("compliant with regulations", "符合规定", "The equipment is compliant with safety regulations.", "设备符合安全规定。", "a compliant system", "合规系统", "Auditors confirmed that the system was compliant.", "审计人员确认该系统合规。")],
    [C("submissive", "/səbˈmɪs.ɪv/", "顺从的", "原表注解 · 人的态度", "submissive 常暗示屈从、缺乏反抗；compliant 可中性地表示配合。", "He became quiet and submissive.", "他变得安静顺从。"), C("obedient", "/əˈbiː.di.ənt/", "听话的", "近义词", "obedient 多指服从权威或命令；compliant 也用于产品符合法规。", "The dog is obedient to its handler.", "这只狗听从训导员。")],
    "可靠词源：来自 comply + -ant，最终关联 Latin complere“完成、履行”。", "易混刹车：compliant with standards；complaisant 是殷勤讨好的，拼写和重音不同。", "一台顺从机器见到每条规则都立刻盖章点头。"),

  E(398, "compliment", "/ˈkɒm.plɪ.mənt/", "noun · verb", "称赞，恭维：praise; 敬意，免费赠送的礼物：respectful", "an expression of praise or respect; a complimentary gift; to praise", "称赞或恭维；敬意；免费赠礼；称赞",
    [U("pay someone a compliment", "称赞某人", "She paid the chef a sincere compliment.", "她真诚地称赞了厨师。", "compliment someone on their work", "称赞某人的工作", "The director complimented us on our careful work.", "主任称赞我们工作细致。"), U("with the author's compliments", "谨致作者敬意", "The book arrived with the author's compliments.", "这本书随作者敬意赠到。", "compliments of the hotel", "酒店免费赠送", "Breakfast was provided with the compliments of the hotel.", "早餐由酒店免费赠送。")],
    [C("praise", "/preɪz/", "赞扬", "原表注解 · 赞美", "praise 可广泛而强烈；compliment 常是一句具体好话。", "The report praised the rescue team.", "报告赞扬救援队。"), C("respectful", "/rɪˈspekt.fəl/", "表示敬意的", "原表注解 · 敬意", "respectful 描写态度；compliments 可作为正式问候或赠礼措辞。", "He sent a respectful reply.", "他发出一封恭敬的回复。"), C("flattery", "/ˈflæt.ər.i/", "奉承", "近义词", "compliment 可真诚；flattery 常为讨好而夸大。", "The official ignored their flattery.", "官员没有理会他们的奉承。")],
    "可靠词源：来自 Italian complimento/Spanish cumplimiento，核心是礼节的履行；与 complete 历史相关。", "易混刹车：compliment 是赞美；complement 是补足、相配。", "一句称赞变成礼物盒，向厨师鞠躬后免费送出早餐。"),

  E(399, "comply", "/kəmˈplaɪ/", "intransitive verb", "遵从：conform, submit", "to act in accordance with a rule, request, or demand", "遵从规则、请求或要求",
    [U("comply with the law", "遵守法律", "All operators must comply with the law.", "所有经营者必须遵守法律。", "refuse to comply", "拒绝服从", "The company refused to comply with the order.", "公司拒绝服从命令。")],
    [C("conform", "/kənˈfɔːm/", "符合；遵从", "原表注解 · 标准", "conform 常强调与规范或模式一致；comply 强调按命令或要求行动。", "The design conforms to the standard.", "设计符合标准。"), C("submit", "/səbˈmɪt/", "屈服；提交", "原表注解 · 服从", "submit 可暗示放弃抵抗；comply 不一定不情愿。", "They submitted to the court's authority.", "他们服从法院权威。"), C("obey", "/əˈbeɪ/", "服从", "近义词", "obey 常直接接人、命令或法律；comply 通常接 with。", "Drivers must obey the signal.", "司机必须服从信号。")],
    "可靠词源：经 Italian/Spanish/French 词形，最终来自 Latin complere“完成、履行”。", "易混刹车：固定搭配 comply with，不说 comply to。", "一张规则表举起手，所有齿轮排队照做。"),

  E(400, "compose", "/kəmˈpəʊz/", "verb", "使镇定：calm; 组成，构成：form, constitute", "to calm oneself; to form or constitute a whole; also to create music or writing", "使镇定；组成、构成；创作",
    [U("compose oneself", "使自己镇定", "She paused to compose herself before speaking.", "她停下来让自己镇定后再讲话。", "a composed expression", "镇定的表情", "He maintained a composed expression.", "他保持镇定的表情。"), U("be composed of", "由……组成", "The panel is composed of five experts.", "评审组由五位专家组成。", "compose the majority", "构成多数", "Small firms compose the majority of employers.", "小企业构成雇主中的多数。")],
    [C("calm", "/kɑːm/", "使平静；平静的", "原表注解 · 镇定", "calm 可使环境或别人平静；compose oneself 特指恢复自制。", "Music calmed the nervous child.", "音乐使紧张的孩子平静。"), C("form", "/fɔːm/", "形成；构成", "原表注解 · 组成", "form 最宽泛；compose 常把多个部分组织成整体。", "Clouds formed over the hills.", "山上形成云层。"), C("constitute", "/ˈkɒn.stɪ.tjuːt/", "构成", "原表注解 · 正式近义", "constitute 正式表示部分构成整体；compose 还可指创作。", "These acts constitute fraud.", "这些行为构成欺诈。")],
    "可靠词源：来自 Latin componere“放在一起”，经 French composer；核心图像是把部分放好。", "易混刹车：整体 is composed of 部分；部分 compose/constitute 整体。", "惊慌的音符先排好队组成乐曲，也让自己镇定下来。"),

  E(401, "compound", "/ˈkɒm.paʊnd/ (n., adj.) · /kəmˈpaʊnd/ (v.)", "noun · adjective · verb", "混合物：something composed；混合的：consisting；混合：together；扩大，增多：greater；和解：agree", "a mixture; made of several parts; to combine, intensify, or settle by agreement", "混合物；复合的；混合；加剧；协议解决",
    [U("a chemical compound", "化合物", "Water is a chemical compound of hydrogen and oxygen.", "水是氢和氧的化合物。", "a medicinal compound", "药物混合剂", "The pharmacist prepared a medicinal compound.", "药剂师配制了一种药物混合剂。"), U("a compound sentence", "复合句", "The paragraph begins with a compound sentence.", "该段以一个复合句开头。", "compound interest", "复利", "Compound interest increased the debt.", "复利增加了债务。"), U("compound the ingredients", "混合原料", "Workers compounded the ingredients in a sealed tank.", "工人在密封罐中混合原料。", "compound two substances", "混合两种物质", "The process compounds two substances under heat.", "该过程在加热下混合两种物质。"), U("compound the problem", "使问题加剧", "A second error compounded the problem.", "第二个错误加剧了问题。", "losses compound rapidly", "损失迅速扩大", "Without action, the losses will compound rapidly.", "若不行动，损失会迅速扩大。"), U("compound a dispute", "协议解决争端", "The parties agreed to compound the dispute.", "双方同意协议解决争端。", "compound with creditors", "与债权人和解", "The debtor compounded with creditors.", "债务人与债权人达成和解。")],
    [C("something composed", "/ˌsʌm.θɪŋ kəmˈpəʊzd/", "由多部分组成之物", "原表注解 · 名词", "该短语概括 compound 名词义；化学中各元素以固定方式结合。", "The alloy is something composed of several metals.", "该合金由多种金属组成。"), C("consisting", "/kənˈsɪs.tɪŋ/", "由……构成", "原表注解 · 形容词", "consisting 描述组成；compound 作形容词强调多个部分组合。", "The team consists of six members.", "团队由六名成员组成。"), C("together", "/təˈɡeð.ər/", "在一起", "原表注解 · 动词混合", "together 是方向；compound 表示实际把材料结合。", "Mix the powders together.", "把粉末混在一起。"), C("greater", "/ˈɡreɪ.tər/", "更大的", "原表注解 · 加剧", "greater 是结果；compound 指问题因新增因素变得更严重。", "The second storm caused greater damage.", "第二场风暴造成更大损害。"), C("agree", "/əˈɡriː/", "达成一致", "原表注解 · 和解", "agree 是普通一致；compound 在法律旧义中指通过协议解决债务或争议。", "They agreed on a payment plan.", "他们就付款计划达成一致。")],
    "可靠词源：来自 Latin componere“放在一起”；名词/形容词与动词重音不同。", "易混刹车：compound 可中性混合，也可使坏事加剧；务必看宾语 problem/debt。", "一个化合物把错误、利息和争端混进锅里，锅越煮越大。"),

  E(402, "compress", "/kəmˈpres/", "verb · noun", "压缩（体积）：reduce size, volume", "to press together and reduce size or volume", "压紧；压缩体积",
    [U("compress the data", "压缩数据", "The software compresses the data before transmission.", "软件在传输前压缩数据。", "compress air", "压缩空气", "The pump compresses air inside the cylinder.", "气泵压缩气缸内的空气。")],
    [C("reduce size", "/rɪˌdjuːs ˈsaɪz/", "减小尺寸", "原表注解 · 结果", "reduce size 很宽泛；compress 通过挤压或编码让内容占更少空间。", "We reduced the image size.", "我们减小了图像尺寸。"), C("volume", "/ˈvɒl.juːm/", "体积", "原表注解 · 物理量", "volume 是被减少的量；compress 是造成这种减少的动作。", "The gas occupies a smaller volume.", "气体占据更小体积。"), C("condense", "/kənˈdens/", "浓缩；压缩", "近义词", "condense 可删减文字或由气变液；compress 侧重挤压到更小空间。", "Condense the report into one page.", "把报告压缩到一页。")],
    "可靠词源：来自 Latin comprimere“共同压紧”，由 com- + premere“压”构成。", "易混刹车：compress /kəmˈpres/ 是动词；名词敷布常读 /ˈkɒm.pres/。", "一只巨手把云压进邮票大小的盒子。"),

  E(403, "compromise", "/ˈkɒm.prə.maɪz/", "noun · verb", "妥协：concessions；使危险：danger", "an agreement by mutual concessions; to expose to danger or weaken integrity", "妥协；以相互让步达成协议；危及、损害",
    [U("reach a compromise", "达成妥协", "The two sides reached a compromise on funding.", "双方就资金问题达成妥协。", "a reasonable compromise", "合理折中", "The schedule is a reasonable compromise.", "这个日程是合理折中。"), U("compromise security", "危及安全", "Sharing the password could compromise security.", "共享密码可能危及安全。", "compromise one's integrity", "损害个人操守", "The payment would compromise her integrity.", "这笔钱会损害她的操守。")],
    [C("concessions", "/kənˈseʃ.ənz/", "让步", "原表注解 · 妥协手段", "concessions 是各方放弃部分要求；compromise 是由这些让步形成的结果。", "Both unions made concessions.", "两个工会都作出让步。"), C("danger", "/ˈdeɪn.dʒər/", "危险", "原表注解 · 危及", "danger 是风险状态；compromise 作动词表示使安全、健康或原则暴露于风险。", "The leak placed patients in danger.", "泄漏使患者处于危险中。"), C("settlement", "/ˈset.əl.mənt/", "解决协议", "近义词", "settlement 强调争端结束；compromise 强调双方都让步。", "The parties signed a settlement.", "双方签署和解协议。")],
    "可靠词源：来自 Latin compromissum“共同承诺接受仲裁”，由 com- + promise 相关成分构成。", "易混刹车：名词 compromise 可积极折中；动词 compromise security 是负面危及。", "两只固执的尺子各剪掉一厘米达成妥协，却不慎危及了桥梁。"),

  E(404, "compunction", "/kəmˈpʌŋk.ʃən/", "noun", "焦虑，内疚，良心不安：anxiety, guilt", "a sharp feeling of guilt or unease about wrongdoing", "因过错产生的内疚、焦虑与良心不安",
    [U("feel compunction about", "对……感到内疚", "She felt compunction about misleading the client.", "她因误导客户而感到内疚。", "without compunction", "毫无愧疚", "He dismissed the workers without compunction.", "他毫无愧疚地解雇了工人。")],
    [C("anxiety", "/æŋˈzaɪ.ə.ti/", "焦虑", "原表注解 · 不安", "anxiety 可无道德原因；compunction 特指因做错事而不安。", "Travel delays caused anxiety.", "旅行延误引起焦虑。"), C("guilt", "/ɡɪlt/", "内疚；罪责", "原表注解 · 核心", "guilt 是宽泛内疚；compunction 常像良心突然刺痛并阻止行动。", "He admitted his guilt.", "他承认自己的罪责。"), C("remorse", "/rɪˈmɔːs/", "悔恨", "近义词", "remorse 通常更深、更持久；compunction 可是一阵迟疑或轻微良心不安。", "She showed genuine remorse.", "她表现出真诚悔恨。")],
    "可靠词源：来自 Latin compungere“刺痛”，由 com- + pungere“刺”构成；良心像针扎。", "易混刹车：compunction 必须与道德过错相关，不是普通紧张。", "良心变成一根小针，每当谎言开口就轻轻扎它一下。"),

  E(405, "concatenate", "/kənˈkæt.ə.neɪt/", "transitive verb", "连结，混合：bring together", "to link things together in a chain or ordered series", "把事物连成链或有序序列",
    [U("concatenate two strings", "连接两个字符串", "The program concatenates two strings.", "程序连接两个字符串。", "concatenate the records", "串联记录", "Analysts concatenated the records into one sequence.", "分析人员把记录串成一个序列。")],
    [C("bring together", "/brɪŋ təˈɡeð.ər/", "汇集到一起", "原表注解 · 定义", "bring together 很宽泛；concatenate 强调首尾相接成链或序列。", "The festival brings communities together.", "节日把各个社区聚在一起。"), C("link", "/lɪŋk/", "连接", "近义词", "link 可连接两个对象；concatenate 常按顺序连接多个文本或数据项。", "The bridge links the islands.", "桥连接两座岛。")],
    "可靠词源：来自 Latin concatenare“用链连接”，其中 catena 表示“链”。", "易混刹车：concatenate 是按顺序串接；concentrate 是集中；congregate 是聚集。", "一串字母手拉手变成长链，链尾还拴着一只逗号。"),
];

const group = (start) => all.slice(start - 371, start - 366);
const stories = [
  [75, "The Persuasive Moon", ["coax", "coda", "coerce", "coeval", "cogent"], "A moon tried to coax a coda, refused to coerce its coeval spoon, and offered one cogent reason for dancing.", "一轮月亮试图哄劝一段终曲，拒绝强迫与它同龄的勺子，并提出了一个支持跳舞的有力理由。"],
  [76, "The Falling Market", ["cognizant", "collapse", "collude", "colossal", "coltish"], "A cognizant roof watched a market collapse when two clocks collude, while a colossal coltish boot applauded.", "一座保持警觉的屋顶看着市场因两只钟串通而崩溃，一只巨大而顽皮的靴子在旁鼓掌。"],
  [77, "The Diplomatic Flame", ["coma", "combustible", "comely", "comity", "commencement"], "A coma wore a combustible hat; a comely bell restored comity during commencement.", "一场昏迷戴着易燃帽；一只端庄漂亮的铃在毕业典礼期间恢复了和睦。"],
  [78, "The Measuring Ribbon", ["commend", "commensurate", "commingle", "commitment", "committed"], "A ribbon would commend a commensurate spoon, commingle tea with thunder, sign a commitment, and remain committed.", "一根丝带要赞扬一把相称的勺子，把茶与雷声混合，签下一项承诺并保持忠诚。"],
  [79, "The Sensible Palace", ["commodious", "commonsensical", "commotion", "compendium", "complacency"], "A commodious palace gave commonsensical advice; a commotion wrote a compendium and cured complacency.", "一座宽敞宫殿给出合乎常识的建议；一阵骚动写成汇编并治好了自满。"],
  [80, "The Obedient Breakfast", ["complaisance", "compliant", "compliment", "comply", "compose"], "Complaisance served a compliant egg one compliment; the egg chose to comply and compose an anthem.", "殷勤顺从给一枚听话的蛋送上一句称赞；蛋选择服从并创作一首颂歌。"],
  [81, "The Compressed Chain", ["compound", "compress", "compromise", "compunction", "concatenate"], "A compound tried to compress a cloud, reached a compromise without compunction, and used a noodle to concatenate stars.", "一种混合物试图压缩云朵，毫无愧疚地达成妥协，并用面条把星星串起来。"],
];

export const [set75, set76, set77, set78, set79, set80, set81] = stories.map(([id, title, targetForms, plain, translation]) =>
  compactSet(id, title, group(371 + (id - 75) * 5), { title, targetForms, plain, translation }),
);
