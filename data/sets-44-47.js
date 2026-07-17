import { compactSet, vocab } from "./compact.js";

const M = (soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh) => ({ soundZh, rootZh, englishHookZh, sceneZh, bridgeZh, trapZh, microEn, microZh });
const R = "GRE 高频 · 正式 / 书面";

const all = [
  vocab(216, "belie", "/bɪˈlaɪ/", "transitive verb", "错误的描述，误述：picture falsely; 证明···为假：false, wrong; 掩饰：shut off from view; 与···相对立，与···相矛盾：counter", "to give a false impression of, contradict, or conceal the true nature of something", "误述；掩饰；证明为假；与……矛盾",
    "一张微笑面具遮住暴风雨，又被身后的闪电当场拆穿。",
    [["belie the truth", "掩盖真相", "His calm tone belied the truth about the crisis.", "他平静的语气掩盖了危机真相。"], ["belie expectations", "与预期相反", "The tiny engine belied expectations by pulling the train.", "小发动机拉动了火车，与预期相反。"], ["an appearance that belies age", "掩盖年龄的外表", "Her energetic appearance belies her age.", "她充满活力的外表让人看不出年龄。"]],
    [["picture falsely", "错误地描绘", "原表注解 · 误述", "picture falsely 直接制造错误形象；belie 可由外观无意造成假象。", "The headline pictured the event falsely.", "标题错误描述了事件。"], ["false or wrong", "证明为假或错误", "原表注解 · 反证", "belie evidence/claim 可表示事实与之冲突，显示其为假；false/wrong 是结果判断。", "The data showed the claim to be false.", "数据表明该说法为假。"], ["shut off from view", "遮住视线", "原表注解 · 掩饰", "该短语强调物理遮挡；belie 是让真实性质看不出来。", "Curtains shut the room off from view.", "窗帘把房间遮住。"], ["counter", "与……相反；反驳", "原表注解 · 矛盾", "counter 可主动反驳；belie 常说事实或外表与说法相矛盾。", "New evidence counters the accusation.", "新证据反驳了指控。"]],
    M("声音联想（非词源）：belie 像‘背离’，外表背离真相。", "可靠构词：be- + lie；历史上有‘用谎言包围/诽谤’义，现代聚焦造成假象或反证。", "熟词桥：appearances can belie reality，外表会说谎。", "微笑面具盖住雷雨，闪电却从面具耳朵里钻出。", "说假话 → 造成错误印象 → 外表与事实矛盾或掩饰事实。", "易混刹车：belie 不是 believe；主语常是 appearance/tone/evidence，宾语是真相、年龄或说法。", "The smile belied a thunderstorm hiding behind the mask.", "微笑掩饰了藏在面具后的雷雨。"),
    ["What relationship does belie create between appearance and reality?", "belie 在外表与现实间建立什么关系？", "The appearance misrepresents, conceals, or contradicts reality.", "外表误述、掩饰或与现实相矛盾。"],
    ["Her steady voice seemed to ________ her deep anxiety.", "她平稳的声音似乎掩盖了深切焦虑。", "An outward sign that conceals reality belies it.", "掩盖现实的外在表现 belies it。"], ["reveal", "confirm", "display"]),

  vocab(217, "bellwether", "/ˈbelˌweð.ər/", "noun", "领导者，带头人：lead", "a leader or an indicator of future trends", "领头者；风向标；趋势指标",
    "领头羊脖子挂着铃，整群羊跟着它走进未来趋势图。",
    [["an industry bellwether", "行业风向标", "The company is an industry bellwether.", "这家公司是行业风向标。"], ["a political bellwether", "政治风向标", "The county is considered a political bellwether.", "该县被视为政治风向标。"], ["serve as a bellwether", "充当先行指标", "Housing permits serve as a bellwether for construction.", "住房许可是建筑业的先行指标。"]],
    [["lead", "带领；领先", "原表注解 · 作用", "lead 是动作；bellwether 是走在前面并让群体或趋势可被观察的对象。", "She will lead the delegation.", "她将率领代表团。"], ["leader", "领导者", "近义词", "leader 真的指挥人；bellwether 也可只是预示整体走向的指标。", "The leader announced a new policy.", "领导者宣布新政策。"], ["trendsetter", "潮流引领者", "近义词", "trendsetter 主动创造潮流；bellwether 可能只是可靠反映未来趋势。", "The designer became a trendsetter.", "设计师成为潮流引领者。"]],
    M("声音联想（非词源）：bell + wether；挂铃的阉公羊走在羊群前。", "可靠构词：bell（铃）+ wether（阉公羊）；牧人给领头羊挂铃，由此引申为领导者和指标。", "熟词桥：听见 bell 就知道整群羊往哪走，正如市场 bellwether 显示趋势。", "挂铃羊跳上股票图，后面的羊排队跟着曲线转弯。", "领头羊的位置可预告羊群方向 → 行业、选举或经济的风向标。", "易混刹车：拼写是 wether，不是 weather；bellwether 不必拥有正式领导权。", "The bellwether rang once, and the whole market followed the sheep.", "风向标羊摇一次铃，整个市场就跟着羊走。"),
    ["Can a bellwether be an indicator without commanding anyone?", "bellwether 能只作指标而不指挥人吗？", "Yes; it often predicts or reflects the direction of a larger group.", "可以；它常预测或反映更大群体的方向。"],
    ["Analysts treat chip sales as a ________ for the technology sector.", "分析师把芯片销量视为科技行业风向标。", "A leading indicator is a bellwether.", "先行指标就是 bellwether。"], ["laggard", "exception", "mystery"]),

  vocab(218, "beneficent", "/bɪˈnef.ɪ.sənt/", "adjective", "仁慈的，好慈善的：charity; （对个人或社会）有益的：contributing", "doing good through kindness or charity; producing benefit", "仁慈行善的；慈善的；有益的",
    "一朵云给全城发雨伞、奖学金和阳光，把善意变成实际帮助。",
    [["a beneficent donor", "仁慈的捐赠者", "A beneficent donor funded the clinic.", "一位仁慈的捐赠者资助了诊所。"], ["a beneficent influence", "有益影响", "The reform had a beneficent influence on public health.", "改革对公共健康产生有益影响。"], ["beneficent acts", "慈善善举", "Her beneficent acts remained anonymous.", "她的慈善善举一直未署名。"]],
    [["charity", "慈善；仁爱", "原表注解 · 行善", "charity 是行为或组织；beneficent 形容主动行善的人或产生益处的事物。", "The proceeds went to charity.", "收益捐给了慈善机构。"], ["contributing", "有助于；作出贡献", "原表注解 · 有益作用", "contributing 说明参与结果；beneficent 评价该作用确实带来福祉。", "Clean water is a contributing factor to health.", "清洁水是健康的促进因素。"], ["benevolent", "仁慈的；善意的", "近义词", "benevolent 侧重善良意愿；beneficent 更强调实际做出好事、产生益处。", "The ruler seemed benevolent.", "统治者似乎仁慈。"], ["beneficial", "有益的", "易混词", "beneficial 常形容措施或效果；beneficent 更书面，可形容施惠的人或力量。", "Exercise is beneficial to sleep.", "运动有益睡眠。"]],
    M("声音联想（非词源）：beneficent 像 benefit 在送礼，善意落实成好处。", "可靠词根：Latin bene（好）+ facere（做）相关词干；核心是‘doing good’。", "熟词桥：benefit 是好处；beneficent 是主动造福的。", "慈善云从口袋里掏出诊所、书本和太阳，送给全城。", "有善意且做出好事 → 给个人或社会带来实际利益。", "易混刹车：benevolent 偏善意，beneficent 偏善行；beneficial 不通常形容人。", "The beneficent cloud donated sunshine to every basement.", "仁慈的云给每个地下室捐赠阳光。"),
    ["What distinction often separates beneficent from benevolent?", "beneficent 与 benevolent 常如何区分？", "Beneficent emphasizes doing good; benevolent emphasizes wishing good.", "beneficent 强调做善事；benevolent 强调怀有善意。"],
    ["The foundation's ________ program supplied medicine to remote villages.", "基金会的慈善项目向偏远村庄提供药品。", "A program that actively does good is beneficent.", "主动造福的项目是 beneficent。"], ["harmful", "selfish", "malign"]),

  vocab(219, "benign", "/bɪˈnaɪn/", "adjective", "好心的，仁慈的：kindness, gentleness; 无害的：not causing", "kind and gentle; not harmful, dangerous, or malignant", "和善的；温和的；无害的；良性的",
    "一只外表巨大的怪兽递来热茶，医生给它盖上‘无害’印章。",
    [["a benign smile", "和善的微笑", "The judge greeted the child with a benign smile.", "法官以和善的微笑迎接孩子。"], ["a benign tumor", "良性肿瘤", "Tests confirmed that the tumor was benign.", "检查确认肿瘤为良性。"], ["a benign climate", "温和气候", "The island has a benign climate.", "这座岛气候温和。"]],
    [["kindness", "善意；仁慈", "原表注解 · 品格", "kindness 是名词；benign 形容人、神态或力量温和友善。", "Her kindness reassured the patient.", "她的善意让患者安心。"], ["gentleness", "温和；柔和", "原表注解 · 气质", "gentleness 是柔和特质；benign 还可表达医学上的非恶性、无害。", "He handled the bird with gentleness.", "他轻柔地对待小鸟。"], ["not causing harm", "不造成伤害", "原表注解 · 无害", "该短语直释 benign 的风险判断，尤其用于 condition、tumor、neglect。", "The substance is not causing harm.", "这种物质没有造成伤害。"], ["harmless", "无害的", "近义词", "harmless 是普通无害；benign 更正式，常与 malignant 对立。", "The spider is harmless.", "这种蜘蛛无害。"]],
    M("声音联想（非词源）：benign 像‘别拧’，它很温和，不会伤你。", "可靠词源：来自 Latin benignus（善良、仁慈），与 bene（好）相关。", "熟词桥：benign tumor 与 malignant tumor 是医学高频对照。", "巨兽拿着体检单和茶壶，轻声说自己既和善又是良性。", "性情善良温和 → 作用不严厉 → 医学上无恶性危险。", "易混刹车：benign 不等于 beneficial；无害不一定有益。医学判断应由专业人员作出。", "The benign monster offered tea and apologized for looking enormous.", "和善的怪兽递上茶，并为自己看起来太巨大而道歉。"),
    ["What is the standard medical opposite of benign?", "医学上 benign 的标准反义词是什么？", "Malignant.", "malignant（恶性的）。"],
    ["Laboratory tests showed that the growth was ________.", "化验显示该增生是良性的。", "A nonmalignant growth is benign.", "非恶性增生是 benign。"], ["malignant", "dangerous", "hostile"]),

  vocab(220, "berate", "/bɪˈreɪt/", "transitive verb", "（长时间）严厉指责：scold, vehemently, at length", "to scold or criticize someone angrily and at length", "长时间严厉斥责；痛骂",
    "老板的斥责变成一列没有终点的火车，追着一枚迟到的回形针。",
    [["berate someone for a mistake", "因错误严斥某人", "The coach berated the players for giving up.", "教练因队员放弃而严厉斥责他们。"], ["publicly berate an employee", "当众痛斥员工", "Managers should not publicly berate an employee.", "管理者不应当众痛斥员工。"], ["be berated by critics", "遭评论家痛批", "The director was berated by critics.", "导演遭到评论家痛批。"]],
    [["scold", "责骂；训斥", "原表注解 · 核心动作", "scold 可短可长；berate 强调猛烈且常持续很久。", "She scolded the child for shouting.", "她因孩子大喊而训斥他。"], ["vehemently", "激烈地；强烈地", "原表注解 · 强度", "vehemently 是方式副词；berate 自带激烈斥责的动作。", "He vehemently denied the charge.", "他强烈否认指控。"], ["at length", "长时间地；详尽地", "原表注解 · 时长", "at length 表明持续时间；berate 兼有时间长和语气严厉。", "They discussed the issue at length.", "他们长时间详谈此事。"], ["rebuke", "严厉责备", "近义词", "rebuke 正式且可很简短；berate 常像连续炮轰。", "The judge rebuked the lawyer.", "法官斥责律师。"]],
    M("声音联想（非词源）：berate 像‘被 rate’，被人长时间打低分并痛骂。", "词源结论：berate 由 be- + rate（旧义责骂）形成；这里不是现代‘比率’义。", "熟词桥：rate someone 可评价；berate someone 是把负面评价变成猛烈训斥。", "老板的骂声坐上火车，绕办公室三圈仍不停站。", "反复责骂 → 激烈且持续地痛斥某人。", "易混刹车：berate 后接人，常接 for + 原因；criticize 可针对观点且不必发怒。", "The manager berated a paper clip until it requested a lawyer.", "经理痛骂一枚回形针，直到它要求找律师。"),
    ["What two dimensions make berate stronger than scold?", "哪两个维度使 berate 比 scold 更强？", "Vehemence and duration.", "激烈程度和持续时间。"],
    ["The captain began to ________ the crew for their careless delay.", "船长开始因船员粗心延误而痛斥他们。", "Angry, sustained scolding is berating.", "愤怒而持续的斥责是 berating。"], ["commend", "thank", "console"]),

  vocab(221, "beseech", "/bɪˈsiːtʃ/", "transitive verb", "（急切地）恳求：beg", "to beg someone urgently and earnestly", "急切恳求；哀求",
    "一位骑士跪求月亮借一把梯子，连盔甲都举起双手。",
    [["beseech someone to help", "恳求某人帮助", "She beseeched the guard to open the gate.", "她恳求守卫开门。"], ["beseech forgiveness", "恳求宽恕", "He beseeched forgiveness from the family.", "他恳求那家人宽恕。"], ["I beseech you", "我恳求你", "I beseech you, reconsider the decision.", "我恳求你重新考虑这个决定。"]],
    [["beg", "乞求；恳求", "原表注解 · 强近义", "beg 最常用；beseech 更书面、情感更急切庄重。", "They begged the doctor to stay.", "他们求医生留下。"], ["implore", "恳求；哀求", "近义词", "implore 与 beseech 极近；beseech 带古典或文学色彩。", "I implore you to listen.", "我恳求你听一听。"]],
    M("声音联想（非词源）：beseech 像‘比膝’，跪下比谁的膝盖更诚恳。", "可靠词源：Old English besēcan，字面接近‘请求、寻求’，由 be- + seek 的古形构成。", "熟词桥：seek 是寻找；beseech 是带着强烈需要去寻求帮助。", "骑士跪着请求月亮，盔甲也从身体上跳下来一起跪。", "寻求某人回应 → 急切庄重地恳求。", "易混刹车：现代多用 beseech someone to do 或 beseech someone for something；语气比 ask 强很多。", "The knight beseeched the moon to lend him a ladder.", "骑士恳求月亮借给他一把梯子。"),
    ["What tone does beseech add to ask?", "beseech 比 ask 多什么语气？", "Urgency, earnestness, and often desperation.", "急切、诚恳，且常带绝望感。"],
    ["The villagers ________ the ruler to spare the forest.", "村民恳求统治者放过森林。", "An urgent, earnest plea uses beseech.", "急切诚恳的请求可用 beseech。"], ["commanded", "dismissed", "forbade"]),

  vocab(222, "besmirch", "/bɪˈsmɜːtʃ/", "transitive verb", "弄脏，弄污：make dirty; 诽谤，玷污：detract from the honor", "to make physically dirty or to damage someone's reputation or honor", "弄脏；玷污名誉；诽谤",
    "墨水怪先弄脏白披风，再把谣言写在英雄的奖牌上。",
    [["besmirch a reputation", "玷污名誉", "False rumors besmirched her reputation.", "虚假谣言玷污了她的名誉。"], ["besmirch someone's honor", "玷污某人的荣誉", "He refused to besmirch his family's honor.", "他拒绝玷污家族荣誉。"], ["besmirched with soot", "被煤烟弄脏", "The workers emerged besmirched with soot.", "工人们出来时满身煤烟。"]],
    [["make dirty", "弄脏", "原表注解 · 实体义", "make dirty 是普通描述；besmirch 较书面，并保留涂抹污迹的画面。", "Mud made the floor dirty.", "泥把地板弄脏了。"], ["detract from the honor", "有损荣誉", "原表注解 · 名誉义", "该短语说明比喻结果；besmirch 常指谣言或指控给名誉留下污点。", "The scandal detracted from the honor of the office.", "丑闻有损该职位的声誉。"], ["tarnish", "使失去光泽；玷污", "近义词", "tarnish 原指金属失去光泽；besmirch 原指沾污，两者都可比喻名誉受损。", "The affair tarnished his legacy.", "这件事玷污了他的遗产。"]],
    M("声音联想（非词源）：besmirch 像‘被 smear’，被污泥涂抹。", "可靠构词：be-（遍及、使）+ smirch（污迹、弄脏）；smirch 的更深来源不确定。", "熟词桥：smear 是涂抹也可诽谤；besmirch 具有相近的‘污物→污名’桥。", "墨水怪给奖牌泼泥，再把假新闻贴在披风上。", "在表面留下污迹 → 在名誉上留下污点。", "易混刹车：besmirch 的对象常是 reputation/name/honor；不能把所有合理批评都叫诽谤。", "The ink monster besmirched the hero's medal with a rumor.", "墨水怪用谣言玷污了英雄的奖牌。"),
    ["How does the figurative sense grow from the literal one?", "besmirch 的比喻义怎样从实体义发展？", "A stain on cloth becomes a stain on reputation or honor.", "衣物上的污迹变成名誉或荣誉上的污点。"],
    ["The fabricated story was designed to ________ the scientist's name.", "捏造的故事旨在玷污科学家的名声。", "To stain someone's reputation is to besmirch it.", "玷污某人名誉就是 besmirch it。"], ["honor", "restore", "praise"]),

  vocab(223, "bifurcate", "/ˈbaɪ.fə.keɪt/", "verb · adjective", "（使）分成两支：two branches", "to divide or cause to divide into two branches or parts", "（使）分叉；一分为二",
    "一条路在巨型叉子前分成两支，每支都声称自己是直路。",
    [["bifurcate into two paths", "分成两条路", "The trail bifurcates into two paths near the lake.", "小径在湖边分成两条路。"], ["a bifurcated system", "二分的系统", "The country developed a bifurcated school system.", "该国形成了二分的学校体系。"], ["where the river bifurcates", "河流分叉处", "A village stands where the river bifurcates.", "河流分叉处有一个村庄。"]],
    [["two branches", "两支；两条分支", "原表注解 · 结果形态", "two branches 是结果；bifurcate 是形成这两支的动作或状态。", "The road has two branches.", "道路有两条分支。"], ["divide", "分开；划分", "近义词", "divide 可以分成任意数量；bifurcate 严格突出分成两支。", "The committee divided the work into five parts.", "委员会把工作分成五部分。"], ["fork", "分叉", "近义词", "fork 更日常、形象；bifurcate 更正式、技术化。", "The road forks after the bridge.", "道路过桥后分叉。"]],
    M("声音联想（非词源）：bi + fork；把可靠前缀 bi- 与熟词 fork 连接。", "可靠词根：Latin bi-（二）+ furca（叉）；bifurcatus 即‘分成两叉’。", "熟词桥：bicycle 有两个轮，bifurcate 有两个分支。", "巨型餐叉把河流切成两条，每条河都戴一只鞋。", "二 + 叉 → 分成两支，可用于道路、血管、组织或论证。", "易混刹车：bifurcate 只指二分；分成三支应用 trifurcate 或普通 divide。", "The river bifurcated because a giant fork blocked its lunch.", "河流因为一把巨叉挡住午餐而分成两支。"),
    ["How many branches are implied by bifurcate?", "bifurcate 暗示多少条分支？", "Exactly two.", "正好两支。"],
    ["At the old bridge, the trail will ________ into northern and southern routes.", "在旧桥处，小径会分成南北两路。", "A division into two branches is bifurcation.", "分成两支就是 bifurcation。"], ["merge", "unite", "converge"]),

  vocab(224, "bigot", "/ˈbɪɡ.ət/", "noun", "固执己见者，有偏见的人：obstinately devoted", "a person obstinately devoted to prejudiced beliefs and intolerant of others", "顽固偏执者；有偏见且不宽容的人",
    "一个人把偏见锁进头盔，再把不同意见都挡在门外。",
    [["a religious bigot", "宗教偏执者", "The novel portrays a dangerous religious bigot.", "小说描绘了一个危险的宗教偏执者。"], ["an intolerant bigot", "不宽容的偏执者", "No one challenged the intolerant bigot.", "没人挑战那个不宽容的偏执者。"], ["condemn someone as a bigot", "谴责某人为偏执者", "They condemned him as a bigot after the speech.", "演讲后他们谴责他是偏执者。"]],
    [["obstinately devoted", "顽固地执着", "原表注解 · 固守", "obstinately devoted 可用于任何对象；bigot 特指顽固坚持偏见并不容异己的人。", "He remained obstinately devoted to the theory.", "他顽固坚持该理论。"], ["prejudiced person", "有偏见的人", "近义释义", "prejudiced person 说明偏见；bigot 还突出强烈、顽固和不宽容。", "A prejudiced person judged them before listening.", "有偏见的人没听就作判断。"], ["fanatic", "狂热者", "易混词", "fanatic 对事业极端狂热，不一定针对群体有偏见；bigot 的核心是不宽容偏见。", "The sports fanatic missed no game.", "体育狂热者一场比赛不落。"]],
    M("声音联想（非词源）：bigot 像‘壁垢’，偏见像墙上顽垢，拒绝清除。", "词源结论：bigot 经 French 进入英语，但更早来源有争议，不能可靠硬拆。", "熟词桥：bigotry 是偏执与不宽容这一抽象名词。", "偏执者戴上石墙头盔，所有新观点都撞墙弹回。", "顽固信念若针对群体并拒绝宽容，就构成 bigotry；持有者是 bigot。", "易混刹车：不要仅因意见不同就随意给人贴 bigot 标签；该词指顽固偏见和不宽容。", "The bigot built a wall inside his helmet and called it an idea.", "偏执者在头盔里砌墙，还称它为观点。"),
    ["What makes a bigot more than merely stubborn?", "bigot 为什么不只是固执？", "The stubbornness is tied to prejudice and intolerance toward others.", "这种固执与对他人的偏见和不宽容相连。"],
    ["The speaker was exposed as a ________ who rejected an entire group.", "发言者被揭露为排斥整个群体的偏执者。", "An obstinately prejudiced, intolerant person is a bigot.", "顽固有偏见且不宽容的人是 bigot。"], ["mediator", "pluralist", "humanitarian"]),

  vocab(225, "bland", "/blænd/", "adjective", "味道平淡的，不刺激的：soothing; 无趣的：dull; 温和的，和蔼的：not harsh", "mild and not irritating, but often lacking flavor, interest, or character", "清淡温和的；乏味的；和蔼而无刺激的",
    "一碗白粥穿着灰色西装，既不辣也不生气，只把所有笑话说得没味道。",
    [["bland food", "清淡无味的食物", "The patient was given bland food.", "患者得到清淡食物。"], ["a bland response", "平淡无趣的回应", "The official offered a bland response.", "官员给出平淡无趣的回应。"], ["a bland manner", "温和无锋芒的态度", "His bland manner concealed firm resolve.", "他温和的态度掩盖了坚定决心。"]],
    [["soothing", "舒缓的", "原表注解 · 不刺激", "soothing 积极强调使人舒服；bland 只表示温和不刺激，且常批评无味无趣。", "The lotion has a soothing effect.", "乳液有舒缓作用。"], ["dull", "乏味的", "原表注解 · 无趣", "dull 泛指不精彩；bland 常因缺少鲜明味道、观点或个性而乏味。", "The lecture was dull.", "讲座很乏味。"], ["not harsh", "不严厉；不刺激", "原表注解 · 温和", "not harsh 是中性描述；bland 可形容温和语气，也可暗示过分平淡。", "The punishment was not harsh.", "处罚并不严厉。"], ["mild", "温和的；清淡的", "近义词", "mild 常中性或褒义；bland 更易带‘没味道、没特色’的批评。", "The curry is mild.", "这份咖喱不辣。"]],
    M("声音联想（非词源）：bland 像‘白烂的’，白粥淡到没有个性。", "可靠词源：来自 Latin blandus（温和、讨人喜欢、奉承的），经语义发展产生无刺激和乏味义。", "熟词桥：bland diet 是不刺激肠胃的清淡饮食；bland speech 是不刺激思维的乏味讲话。", "白粥主持节目，所有颜色和调味料都在台下睡着。", "温和讨喜 → 不刺激 → 缺少味道、活力或鲜明特点。", "易混刹车：bland 不必等于 bad；病中清淡饮食可能正合适，但 bland art 多是负评。", "The bland soup apologized for having no opinion.", "清淡无味的汤为自己没有观点而道歉。"),
    ["Why can bland be neutral for food but critical for writing?", "为什么 bland 用于食物可中性，用于写作常含批评？", "Mild food may be suitable, while writing without flavor or character is usually disappointing.", "温和食物可能合适；缺乏特色的写作通常令人失望。"],
    ["The campaign replaced its bold proposal with a ________ slogan.", "竞选活动用一句乏味口号取代了大胆提案。", "A slogan lacking character is bland.", "缺乏特色的口号是 bland。"], ["vivid", "spicy", "forceful"]),

  vocab(226, "blandishment", "/ˈblæn.dɪʃ.mənt/", "noun", "甜言蜜语，讨某人好话：coax, cajole", "flattering or pleasing words used to coax or persuade", "甜言蜜语；奉承诱劝",
    "狐狸把奉承话做成糖果，哄乌鸦交出钥匙。",
    [["resist blandishments", "抵制甜言蜜语", "She resisted their blandishments and kept the documents.", "她抵制了他们的甜言蜜语，保住了文件。"], ["use blandishments to persuade", "用奉承话劝诱", "He used blandishments to persuade the guard.", "他用甜言蜜语劝诱守卫。"], ["promises and blandishments", "许诺与奉承", "Promises and blandishments failed to change her mind.", "许诺和甜言蜜语没能改变她的想法。"]],
    [["coax", "哄劝；诱导", "原表注解 · 目的", "coax 是温和劝诱动作；blandishment 是用于这种劝诱的讨好话。", "She coaxed the child into eating.", "她哄孩子吃东西。"], ["cajole", "哄骗；劝诱", "原表注解 · 手段", "cajole 强调靠奉承或持续劝说使人同意；blandishments 是具体的奉承手段。", "They cajoled him into signing.", "他们哄他签字。"], ["flattery", "奉承", "近义词", "flattery 可无明确目的；blandishment 通常带劝服或操纵意图。", "He was vulnerable to flattery.", "他容易受奉承影响。"]],
    M("声音联想（非词源）：blandishment 像把 bland 话涂上糖，温柔地哄人。", "可靠词源：来自 blandish + -ment；blandish 经 Old French 源自 Latin blandiri（奉承、讨好）。", "熟词桥：coax with compliments，用赞美把对方轻轻推向你想要的决定。", "狐狸把每句奉承包成糖，乌鸦吃完就把钥匙递了过去。", "温柔讨好 → 用甜言蜜语哄劝，使对方按意图行动。", "易混刹车：常用复数 blandishments；它通常暗含不完全真诚的劝诱。", "The fox's blandishment wore a sugar coat and stole the key.", "狐狸的甜言蜜语穿着糖衣，偷走了钥匙。"),
    ["What purpose distinguishes blandishment from a simple compliment?", "blandishment 与普通赞美的区别目的是什么？", "It is used to coax or persuade the listener.", "它被用来哄劝或说服听者。"],
    ["Neither threats nor ________ persuaded the witness to lie.", "威胁和甜言蜜语都未能说服证人撒谎。", "Flattering persuasion uses blandishments.", "奉承式劝诱使用 blandishments。"], ["evidence", "candor", "silence"]),

  vocab(227, "blasé", "/ˈblɑː.zeɪ/", "adjective", "（过度放纵之后）厌倦享乐的，腻厌的：apathetic", "unimpressed and bored because of excessive familiarity or indulgence", "厌倦享乐的；见怪不怪的；冷漠无动于衷的",
    "一位每天看烟花的猫，在月亮爆成彩纸时仍打哈欠。",
    [["blasé about fame", "对名声不以为意", "The actor seemed blasé about fame.", "演员似乎对名声不以为意。"], ["a blasé attitude", "厌倦冷漠的态度", "His blasé attitude annoyed the excited students.", "他那见怪不怪的态度惹恼了兴奋的学生。"], ["become blasé", "变得腻厌", "Travelers can become blasé about luxury.", "旅行者可能对奢华变得腻厌。"]],
    [["apathetic", "冷漠的；无兴趣的", "原表注解 · 表现", "apathetic 可由任何原因缺乏兴趣；blasé 特别暗示看得太多、享受过度而厌倦。", "Voters seemed apathetic.", "选民显得冷漠。"], ["jaded", "厌倦疲惫的", "近义词", "jaded 强调因过量经历而疲惫麻木；blasé 更突出故作或实际的不惊讶。", "The critic sounded jaded.", "评论家听起来厌倦麻木。"], ["indifferent", "不在乎的；冷淡的", "近义词", "indifferent 只表示不关心；blasé 解释为熟悉或纵享过度后的不在意。", "She was indifferent to gossip.", "她对流言毫不在意。"]],
    M("声音联想（非词源）：blasé 像‘不拉赛’，比赛再精彩也懒得参与。", "可靠词源：借自 French blasé，是 blaser（使厌腻）的过去分词；更深来源不确定。", "熟词桥：too much pleasure → no surprise，把奢华过量与无动于衷连接。", "猫连续看了一千场烟花，月亮爆炸时只翻了一页报纸。", "刺激或享乐过度 → 感觉迟钝 → 对本应惊奇之事无动于衷。", "易混刹车：保留重音符号 blasé；不是单纯 calm，而是因见多或纵享而厌倦。", "The blasé cat yawned when the moon exploded into confetti.", "见怪不怪的猫看到月亮炸成彩纸仍打哈欠。"),
    ["What past experience is often implied by blasé?", "blasé 常暗示怎样的过去经历？", "Excessive exposure, familiarity, or indulgence that has dulled interest.", "过度接触、过分熟悉或纵享，使兴趣变迟钝。"],
    ["After years in luxury hotels, he grew ________ about marble suites.", "住了多年豪华酒店后，他对大理石套房变得腻厌。", "Overfamiliar boredom is blasé.", "过度熟悉后的厌倦是 blasé。"], ["amazed", "eager", "delighted"]),

  vocab(228, "blast", "/blɑːst/", "noun · verb", "爆炸：explosion; 一阵猛烈的强风：gust; 巨响：loud, sound; 炸裂，爆破：cause to break open;斥责，抨击：criticize harshly", "an explosion, violent gust, or loud sound; to break open explosively or criticize harshly", "爆炸；强风；巨响；炸开；猛烈抨击",
    "一阵风抱着炸药和大喇叭冲进山洞，把石门和演讲一起轰碎。",
    [["a blast of wind", "一阵强风", "A blast of wind slammed the gate.", "一阵强风猛地关上大门。"], ["blast a tunnel through rock", "炸穿岩石开隧道", "Engineers blasted a tunnel through the mountain.", "工程师炸穿山体开出隧道。"], ["blast the proposal", "猛烈抨击提案", "Critics blasted the proposal as wasteful.", "评论家猛烈抨击该提案浪费。"]],
    [["explosion", "爆炸", "原表注解 · 爆破", "explosion 是爆炸事件；blast 可指爆炸及其冲击波。", "The explosion shattered windows.", "爆炸震碎窗户。"], ["gust", "一阵强风", "原表注解 · 气流", "gust 是短促强风；blast 更猛烈，也可指热气或声浪突然冲来。", "A gust lifted the papers.", "一阵风掀起纸张。"], ["loud sound", "巨响", "原表注解 · 声音", "loud sound 是泛称；blast 常指喇叭等突然、强烈的一响。", "A loud sound woke us.", "一声巨响惊醒我们。"], ["cause to break open", "炸裂；爆破", "原表注解 · 动词", "该短语描述爆炸造成破开；blast 常接 rock、door、tunnel。", "The charge caused the door to break open.", "炸药使门爆开。"], ["criticize harshly", "严厉抨击", "原表注解 · 比喻义", "criticize harshly 是直接释义；blast 用爆炸能量比喻猛烈公开抨击。", "The editorial criticized the policy harshly.", "社论严厉抨击政策。"]],
    M("声音联想（非词源）：blast 像‘不拉死’，大风、巨响和爆炸一起拉满。", "可靠词源：Old English blǣst（吹气、阵风）；爆炸和巨响义由强烈气流发展。", "熟词桥：air blast、bomb blast、music blasting 都保留猛烈冲击。", "大喇叭吹出炸药般的风，把山洞门和坏提案一起轰开。", "猛烈吹气 → 强风、爆炸冲击、巨响 → 用言语猛烈轰击。", "易混刹车：blast 作批评动词很强；a blast 口语还可表示‘非常开心的经历’，需看语境。", "The blast opened the cave and criticized the mountain.", "爆炸炸开山洞，还顺便抨击了大山。"),
    ["What common force links the senses of blast?", "blast 各义由什么共同力量连接？", "A sudden, violent burst of air, energy, sound, or criticism.", "空气、能量、声音或批评的突然猛烈爆发。"],
    ["A sudden ________ of icy wind knocked over the sign.", "一阵突然的冰冷强风吹倒了牌子。", "A violent burst of wind is a blast.", "猛烈突发的一阵风是 blast。"], ["breeze", "calm", "murmur"]),

  vocab(229, "blatant", "/ˈbleɪ.tənt/", "adjective", "大声喧哗的：noisy; （让人生厌地）惹人注目的：noticeable", "offensively obvious and conspicuous; historically, noisily clamorous", "明目张胆的；惹眼得令人反感的；喧嚷的",
    "作弊者用霓虹灯写着‘我在作弊’，还拿喇叭广播。",
    [["a blatant lie", "明目张胆的谎言", "The advertisement contained a blatant lie.", "广告包含一个明目张胆的谎言。"], ["blatant discrimination", "公然歧视", "The court condemned the blatant discrimination.", "法院谴责公然歧视。"], ["a blatant attempt", "赤裸裸的企图", "It was a blatant attempt to influence the vote.", "这是赤裸裸影响投票的企图。"]],
    [["noisy", "吵闹的", "原表注解 · 历史语感", "noisy 是声音大；blatant 早期含喧嚷，现代主要指坏事惹眼到无法忽视。", "The crowd was noisy.", "人群很吵。"], ["noticeable", "明显的；引人注意的", "原表注解 · 可见度", "noticeable 可中性；blatant 通常负面，表示公然到令人反感。", "There was a noticeable improvement.", "出现了明显改善。"], ["flagrant", "骇人听闻的；公然的", "近义词", "flagrant 与 blatant 都修饰明显恶行；flagrant 更强调严重违反规则。", "It was a flagrant violation.", "这是公然严重的违规。"]],
    M("声音联想（非词源）：blatant 像‘不赖账’，但他拿喇叭公然赖账，太惹眼。", "词源结论：blatant 由 Spenser 在16世纪使用，可能关联 blat（叫嚷）；确切形成过程不完全确定。", "熟词桥：blatant lie 不只是错，而是明目张胆、毫不遮掩。", "作弊者头戴霓虹箭头，喇叭重复广播自己的答案。", "喧嚷得刺耳 → 显眼得令人反感 → 公然明显的错误或恶行。", "易混刹车：obvious 可中性；blatant 带强烈负评，常修饰 lie、bias、violation。", "The blatant thief wore a sign announcing the theft.", "明目张胆的小偷戴着牌子宣布盗窃。"),
    ["Why is blatant stronger than noticeable?", "为什么 blatant 比 noticeable 更强？", "It is offensively conspicuous, usually describing something wrong or objectionable.", "它惹眼到令人反感，通常描述错误或不当之事。"],
    ["The audit uncovered a ________ conflict of interest.", "审计发现了一个明目张胆的利益冲突。", "An offensively obvious violation is blatant.", "公然到令人反感的违规是 blatant。"], ["subtle", "hidden", "innocent"]),

  vocab(230, "blazon", "/ˈbleɪ.zən/", "transitive verb · noun", "使知名：make known openly; 修饰，装扮：make more attractive", "to proclaim openly or display prominently; to adorn, especially with heraldic devices", "公开宣扬；醒目展示；装饰；纹章描述",
    "骑士把秘密写成金字挂满城墙，还给每只盾牌镶上太阳。",
    [["blazon a name across the banner", "把名字醒目写在横幅上", "They blazoned the sponsor's name across the banner.", "他们把赞助商名字醒目写在横幅上。"], ["blazon the news abroad", "四处宣扬消息", "The herald blazoned the news abroad.", "传令官四处宣扬消息。"], ["a shield blazoned with stars", "饰有星星的盾牌", "The shield was blazoned with silver stars.", "盾牌上饰有银星。"]],
    [["make known openly", "公开使人知晓", "原表注解 · 宣扬", "make known openly 是功能；blazon 暗示高调、醒目地公告。", "The agency made the findings known openly.", "机构公开了调查结果。"], ["make more attractive", "使更美观", "原表注解 · 装饰", "该短语较宽泛；blazon 的装饰义常与鲜明图案、纹章或醒目展示有关。", "Flowers made the entrance more attractive.", "鲜花使入口更美观。"], ["proclaim", "宣布；宣扬", "近义词", "proclaim 强调正式宣告；blazon 强调到处显眼展示。", "The council proclaimed a holiday.", "议会宣布放假。"], ["emblazon", "用醒目图案装饰", "近义词", "emblazon 是现代更常见的装饰动词；blazon 还可指公开颂扬或纹章描述。", "A dragon was emblazoned on the flag.", "旗上醒目饰有一条龙。"]],
    M("声音联想（非词源）：blazon 像‘把 logo 亮着’，让图案和消息人人看见。", "可靠词源：经 Old French blason（盾牌、纹章）进入英语；更深来源不确定。", "熟词桥：emblazoned across a shirt 是醒目印在衬衫上。", "传令官把秘密镀金，挂上城里最高的旗杆公开展示。", "盾牌上醒目展示纹章 → 装饰、描述纹章 → 高调公开宣扬。", "易混刹车：blaze 是燃烧；blazon 是公开展示或纹章，拼写和词义都不同。", "The herald blazoned the secret across a golden cloud.", "传令官把秘密醒目写在金云上公开宣扬。"),
    ["What visual quality does blazon add to announce?", "blazon 比 announce 多什么视觉特点？", "Prominent, conspicuous public display.", "醒目、显眼的公开展示。"],
    ["The brand name was ________ across every wall.", "品牌名称被醒目地写在每面墙上。", "Prominent public display can be described with blazoned.", "醒目的公开展示可用 blazoned。"], ["concealed", "erased", "whispered"]),

  vocab(231, "blemish", "/ˈblem.ɪʃ/", "noun · transitive verb", "缺点，污点：imperfection; 损害，玷污：reduce", "a small flaw or mark that spoils perfection; to mar appearance or reputation", "瑕疵；污点；损害；玷污",
    "完美白盘上出现一个黑点，黑点拿着放大镜宣布自己是主角。",
    [["a minor blemish", "小瑕疵", "The vase has a minor blemish near its base.", "花瓶底部附近有一处小瑕疵。"], ["blemish a reputation", "玷污名誉", "The scandal blemished the institution's reputation.", "丑闻玷污了该机构的名誉。"], ["without blemish", "毫无瑕疵", "The diamond appeared without blemish.", "钻石看起来毫无瑕疵。"]],
    [["imperfection", "不完美；缺点", "原表注解 · 名词义", "imperfection 是任何不完美；blemish 常是局部污点，破坏整体外观或名声。", "A slight imperfection lowered the price.", "一处轻微缺陷降低了价格。"], ["reduce", "降低；削弱", "原表注解 · 损害结果", "reduce 很宽泛；blemish 是降低完美度、美观或声誉。", "The error reduced public confidence.", "错误降低了公众信心。"], ["flaw", "瑕疵；缺陷", "近义词", "flaw 可能是结构性缺陷；blemish 常更表面、更小，却显眼。", "The plan has a serious flaw.", "计划有严重缺陷。"], ["stain", "污迹；污点", "近义词", "stain 可是真实污渍或道德污点；blemish 不必有颜色，任何破坏完美的小缺点都可。", "The incident left a stain on his career.", "事件给他的职业留下污点。"]],
    M("声音联想（非词源）：blemish 像‘白面失’，白净表面因一个黑点失去完美。", "可靠词源：经 Old French blemir（使苍白、损伤）进入英语；更深来源可能与 Germanic 词有关。", "熟词桥：skin blemish 是皮肤小瑕疵；record blemish 是履历污点。", "黑点在白盘上搭舞台，宣布要破坏整套餐具的完美。", "外观小污点 → 任何破坏完美之处 → 名誉上的污点。", "易混刹车：blemish 往往小而局部；fatal flaw 可造成整体失败。", "One blemish rented a spotlight on the perfect plate.", "一个瑕疵在完美盘子上租了聚光灯。"),
    ["What scale is often suggested by blemish?", "blemish 常暗示怎样的规模？", "A localized flaw that mars an otherwise good whole.", "一个局部瑕疵，破坏了原本良好的整体。"],
    ["The false accusation left a lasting ________ on his record.", "虚假指控给他的履历留下持久污点。", "A mark that mars reputation is a blemish.", "损害名誉的污点是 blemish。"], ["merit", "perfection", "honor"]),

  vocab(232, "blight", "/blaɪt/", "noun · transitive verb", "（使）枯萎：affect; 损害：impair", "a plant disease or destructive influence; to wither, ruin, or severely impair", "枯萎病；祸害；使枯萎；严重损害",
    "一团灰雾碰过花园，花朵和城市计划同时低下头枯萎。",
    [["potato blight", "马铃薯枯萎病", "Potato blight destroyed the crop.", "马铃薯枯萎病毁掉了庄稼。"], ["blight someone's hopes", "摧毁某人的希望", "The injury blighted her hopes of competing.", "伤病摧毁了她参赛的希望。"], ["urban blight", "城市衰败", "Vacant buildings contributed to urban blight.", "空置建筑加剧了城市衰败。"]],
    [["affect", "影响", "原表注解 · 作用", "affect 中性且强弱不限；blight 指像病害一样产生严重破坏。", "Weather affects crop growth.", "天气影响作物生长。"], ["impair", "损害；削弱", "原表注解 · 损害", "impair 表示功能下降；blight 更形象，常暗示希望、前景或环境被毁坏。", "Noise impaired her concentration.", "噪声损害了她的注意力。"], ["wither", "枯萎；衰弱", "近义词", "wither 描述逐渐干枯；blight 可指导致这种枯萎的病害或力量。", "The leaves withered in the heat.", "树叶在高温中枯萎。"], ["ruin", "毁坏", "近义词", "ruin 泛指彻底毁坏；blight 常保留植物疾病扩散般的损害图像。", "The flood ruined the harvest.", "洪水毁了收成。"]],
    M("声音联想（非词源）：blight 像 black + light，黑光照过之处全枯萎。", "词源结论：blight 的确切来源不确定；早期植物病害义不能可靠拆成 black + light。", "熟词桥：plant blight destroys crops；economic blight 像病一样毁掉社区。", "灰雾给每朵花盖章，花园和希望一起变成皱纸。", "植物病害使作物枯萎 → 任何蔓延并毁掉希望、前景或地区的力量。", "易混刹车：plight 是困境；blight 是枯萎病或造成破坏，首字母不同。", "The blight touched one rose, and the whole garden sighed.", "枯萎病碰了一朵玫瑰，整座花园都叹气。"),
    ["Why is blight stronger than affect?", "为什么 blight 比 affect 强？", "It implies serious, destructive impairment, often like spreading plant disease.", "它暗示严重破坏性损害，常像植物病害扩散。"],
    ["Years of neglect began to ________ the neighborhood.", "多年的忽视开始严重损害这个社区。", "A destructive influence can blight a place.", "破坏性力量会 blight 一个地方。"], ["renew", "nourish", "improve"]),

  vocab(233, "bliss", "/blɪs/", "noun", "极度快乐：ecstasy; 极乐世界：place of perfect happiness", "perfect or extreme happiness; a state or place imagined as perfectly happy", "极乐；无上幸福；极乐境界",
    "猫躺在云做的枕头上，奶酪雨正好落进嘴里，它宣布这里是极乐世界。",
    [["pure bliss", "纯粹的幸福", "The first quiet morning felt like pure bliss.", "第一个宁静早晨如同纯粹幸福。"], ["domestic bliss", "家庭幸福", "The photograph suggests domestic bliss.", "照片呈现家庭幸福。"], ["a state of bliss", "极乐状态", "She closed her eyes in a state of bliss.", "她在极乐中闭上眼睛。"]],
    [["ecstasy", "狂喜；极度快乐", "原表注解 · 强度", "ecstasy 常是激烈兴奋的狂喜；bliss 可更宁静、圆满而持续。", "The crowd shouted in ecstasy.", "人群狂喜地高呼。"], ["place of perfect happiness", "极乐世界", "原表注解 · 境界", "该短语把 bliss 具体化为空间；bliss 本身通常是不可数的幸福状态。", "They dreamed of a place of perfect happiness.", "他们梦想极乐世界。"], ["joy", "喜悦", "近义词", "joy 可轻可重；bliss 是近乎完美、没有烦恼的幸福。", "The news brought great joy.", "消息带来巨大喜悦。"]],
    M("声音联想（非词源）：bliss 像‘不离死’，幸福到不愿离开。", "可靠词源：Old English bliss/blīths，关联 blithe（快乐）；不是现代词的随意缩写。", "熟词桥：blissful 是极幸福的；ignorance is bliss 是常见格言。", "猫躺在云枕上，奶酪雨自动落嘴，烦恼被禁止入境。", "快乐、恩赐 → 完满无忧的幸福状态，甚至想象中的极乐境界。", "易混刹车：bliss 多为不可数名词；不要随意说 a bliss，常说 a moment/state of bliss。", "For the cat, a cloud pillow and cheese rain were pure bliss.", "对猫而言，云枕和奶酪雨就是纯粹幸福。"),
    ["How does bliss differ in tone from ordinary happiness?", "bliss 与普通 happiness 的语气有何不同？", "It suggests perfect, complete, often serene happiness.", "它暗示完满、彻底且常很宁静的幸福。"],
    ["After the noise stopped, the sudden silence was ________.", "噪声停止后，突如其来的安静简直是极乐。", "Perfect happiness or relief can be bliss.", "完美幸福或宽慰可称为 bliss。"], ["misery", "torment", "anxiety"]),

  vocab(234, "blithe", "/blaɪð/", "adjective", "愉快高兴的：happy lighthearted; 无忧无虑的，漫不经心的：freedom from worries", "cheerfully lighthearted; casually unconcerned, sometimes irresponsibly so", "愉快无忧的；漫不经心的",
    "小鸟唱着歌签下一百张账单，对身后的火山毫不在意。",
    [["a blithe spirit", "快乐无忧的人", "Her blithe spirit lifted the whole team.", "她快乐无忧的精神鼓舞了全队。"], ["blithe disregard", "漫不经心的无视", "He showed a blithe disregard for the rules.", "他漫不经心地无视规则。"], ["blithely assume", "想当然地认为", "They blithely assumed the work was finished.", "他们想当然地认为工作已经完成。"]],
    [["happy and lighthearted", "愉快而无忧的", "原表注解 · 正面义", "该短语直释 blithe 的愉快面；blithe 也可能批评不负责任的轻松。", "She felt happy and lighthearted.", "她感到愉快轻松。"], ["freedom from worries", "无忧无虑", "原表注解 · 心态", "freedom from worries 可是理想状态；blithe disregard 则可能因不顾风险而负面。", "The holiday gave him freedom from worries.", "假期让他无忧无虑。"], ["carefree", "无忧无虑的", "近义词", "carefree 多褒义；blithe 在正式语境常带‘轻率不在乎’。", "They enjoyed a carefree afternoon.", "他们享受了无忧下午。"], ["heedless", "不留心的；轻率的", "易混近义", "heedless 明确负面地不注意；blithe 可正面快乐，也可负面漫不经心。", "He was heedless of the warning.", "他不理会警告。"]],
    M("声音联想（非词源）：blithe 像‘不来事’，太无忧，麻烦来了也不当回事。", "可靠词源：Old English blīthe（欢乐、温和）；与 bliss 有历史关联。", "熟词桥：blithe spirit 是快乐灵魂；blithe disregard 是轻率无视，两种语气看搭配。", "小鸟边唱歌边给火山递账单，完全没看撤离警告。", "快乐无忧 → 对烦恼不挂心；若对真实风险也不挂心，就变成漫不经心。", "易混刹车：注意 th 发浊音 /ð/；blithe 可褒可贬，必须看是否有责任和风险。", "The blithe bird sang while signing a volcano's invoice.", "无忧小鸟一边唱歌，一边签火山账单。"),
    ["Why can blithe become critical rather than complimentary?", "为什么 blithe 有时带批评？", "Lighthearted unconcern can become irresponsible disregard for real risks.", "轻松不在乎可能变成对真实风险不负责任的无视。"],
    ["The executive showed a ________ disregard for safety warnings.", "这名高管漫不经心地无视安全警告。", "Careless, cheerful unconcern can be blithe.", "轻率而轻松的不在乎可用 blithe。"], ["anxious", "vigilant", "cautious"]),

  vocab(235, "blueprint", "/ˈbluː.prɪnt/", "noun · transitive verb", "蓝图，详细计划：architects’ plans; 事先计划：work out, in advance", "a detailed technical drawing or a comprehensive plan; to plan in detail beforehand", "蓝图；详细方案；预先规划",
    "建筑师铺开一张蓝纸，纸上的房子先长出门窗，再安排未来。",
    [["a blueprint for reform", "改革蓝图", "The report offers a blueprint for reform.", "报告提出改革蓝图。"], ["draw up a blueprint", "制订详细方案", "Engineers drew up a blueprint for the bridge.", "工程师为桥梁制订蓝图。"], ["blueprint the project", "预先详细规划项目", "The team blueprinted the project before seeking funds.", "团队在筹资前详细规划了项目。"]],
    [["architects' plans", "建筑师的图纸", "原表注解 · 实体义", "architects' plans 是具体图纸；blueprint 原指蓝底复制图，现泛指详细技术图。", "Architects' plans showed every doorway.", "建筑师图纸标出每道门。"], ["work out in advance", "事先拟定", "原表注解 · 动词义", "该短语说明 blueprint 作动词：在实施前把细节系统规划好。", "They worked out the route in advance.", "他们事先拟定路线。"], ["plan", "计划；方案", "近义词", "plan 范围最广；blueprint 常是可供复制实施的详细总体方案。", "We need a clear plan.", "我们需要清晰计划。"], ["template", "模板；范本", "近义词", "template 是可重复套用的格式；blueprint 更强调如何建成目标的详细步骤和结构。", "Use this document as a template.", "用这份文件作模板。"]],
    M("声音联想（非词源）：blue + print 是‘蓝色印图’，把未来先印在纸上。", "可靠构词：blue + print；19世纪蓝晒复制工艺形成蓝底白线技术图，后引申为详细计划。", "熟词桥：建筑 blueprint 告诉工人怎么建；policy blueprint 告诉机构怎么实施。", "蓝纸上的房子先长出来，拿着尺子指挥现实中的砖块排队。", "技术图纸提供施工细节 → 任何可指导未来行动的全面详细方案。", "易混刹车：blueprint 比 idea 具体；作动词是预先详细规划，不只是随便想想。", "The blueprint built a paper house before the bricks arrived.", "砖块到达前，蓝图先建起一座纸房。"),
    ["What makes a blueprint stronger than a general idea?", "blueprint 为什么比普通 idea 更具体？", "It lays out detailed structure and steps for implementation.", "它列出可实施的详细结构和步骤。"],
    ["The commission published a ________ for rebuilding public transport.", "委员会发布了重建公共交通的详细蓝图。", "A detailed implementation plan is a blueprint.", "详细实施方案是 blueprint。"], ["rumor", "impulse", "accident"]),
];

const ipas = new Map([
  ["picture falsely", "/ˌpɪk.tʃər ˈfɔːls.li/"], ["false or wrong", "/ˌfɔːls ɔː ˈrɒŋ/"], ["shut off from view", "/ˌʃʌt ɒf frəm ˈvjuː/"], ["counter", "/ˈkaʊn.tər/"], ["lead", "/liːd/"], ["leader", "/ˈliː.dər/"], ["trendsetter", "/ˈtrendˌset.ər/"], ["charity", "/ˈtʃær.ə.ti/"], ["contributing", "/kənˈtrɪb.juː.tɪŋ/"], ["benevolent", "/bəˈnev.əl.ənt/"], ["beneficial", "/ˌben.ɪˈfɪʃ.əl/"], ["kindness", "/ˈkaɪnd.nəs/"], ["gentleness", "/ˈdʒen.təl.nəs/"], ["not causing harm", "/nɒt ˌkɔː.zɪŋ ˈhɑːm/"], ["harmless", "/ˈhɑːm.ləs/"], ["scold", "/skəʊld/"], ["vehemently", "/ˈviː.ə.mənt.li/"], ["at length", "/ət ˈleŋθ/"], ["rebuke", "/rɪˈbjuːk/"], ["beg", "/beɡ/"], ["implore", "/ɪmˈplɔːr/"], ["make dirty", "/meɪk ˈdɜː.ti/"], ["detract from the honor", "/dɪˌtrækt frəm ði ˈɒn.ər/"], ["tarnish", "/ˈtɑː.nɪʃ/"], ["two branches", "/tuː ˈbrɑːn.tʃɪz/"], ["divide", "/dɪˈvaɪd/"], ["fork", "/fɔːk/"], ["obstinately devoted", "/ˈɒb.stɪ.nət.li dɪˈvəʊ.tɪd/"], ["prejudiced person", "/ˈpredʒ.ə.dɪst ˌpɜː.sən/"], ["fanatic", "/fəˈnæt.ɪk/"], ["soothing", "/ˈsuː.ðɪŋ/"], ["dull", "/dʌl/"], ["not harsh", "/nɒt ˈhɑːʃ/"], ["mild", "/maɪld/"], ["coax", "/kəʊks/"], ["cajole", "/kəˈdʒəʊl/"], ["flattery", "/ˈflæt.ər.i/"], ["apathetic", "/ˌæp.əˈθet.ɪk/"], ["jaded", "/ˈdʒeɪ.dɪd/"], ["indifferent", "/ɪnˈdɪf.ər.ənt/"], ["explosion", "/ɪkˈspləʊ.ʒən/"], ["gust", "/ɡʌst/"], ["loud sound", "/laʊd ˈsaʊnd/"], ["cause to break open", "/kɔːz tə breɪk ˈəʊ.pən/"], ["criticize harshly", "/ˈkrɪt.ɪ.saɪz ˌhɑːʃ.li/"], ["noisy", "/ˈnɔɪ.zi/"], ["noticeable", "/ˈnəʊ.tɪ.sə.bəl/"], ["flagrant", "/ˈfleɪ.ɡrənt/"], ["make known openly", "/meɪk nəʊn ˈəʊ.pən.li/"], ["make more attractive", "/meɪk mɔːr əˈtræk.tɪv/"], ["proclaim", "/prəˈkleɪm/"], ["emblazon", "/ɪmˈbleɪ.zən/"], ["imperfection", "/ˌɪm.pəˈfek.ʃən/"], ["reduce", "/rɪˈdjuːs/"], ["flaw", "/flɔː/"], ["stain", "/steɪn/"], ["affect", "/əˈfekt/"], ["impair", "/ɪmˈpeər/"], ["wither", "/ˈwɪð.ər/"], ["ruin", "/ˈruː.ɪn/"], ["ecstasy", "/ˈek.stə.si/"], ["place of perfect happiness", "/pleɪs əv ˌpɜː.fekt ˈhæp.i.nəs/"], ["joy", "/dʒɔɪ/"], ["happy and lighthearted", "/ˌhæp.i ən ˈlaɪtˌhɑː.tɪd/"], ["freedom from worries", "/ˌfriː.dəm frəm ˈwʌr.iz/"], ["carefree", "/ˈkeə.friː/"], ["heedless", "/ˈhiːd.ləs/"], ["architects' plans", "/ˈɑː.kɪ.tekts plænz/"], ["work out in advance", "/wɜːk aʊt ɪn ədˈvɑːns/"], ["plan", "/plæn/"], ["template", "/ˈtem.pleɪt/"]
]);
for (const config of all) { config.register = R; for (const item of config.comparisons) item[6] = ipas.get(item[0]); }
const group = (start) => all.slice(start - 216, start - 211);

export const set44 = compactSet(44, "The Gentle Alarm", group(216), {
  title: "The Gentle Alarm", targetForms: ["belied", "bellwether", "beneficent", "benign", "berated"],
  plain: "A smile belied the bellwether, so a beneficent cloud became benign and berated a golden teaspoon for looking worried.",
  translation: "一个微笑掩盖了领头羊，于是一朵仁慈的云变得温和无害，并因一把金茶匙看起来忧虑而痛斥它。",
});
export const set45 = compactSet(45, "The Forked Banquet", group(221), {
  title: "The Forked Banquet", targetForms: ["beseeched", "besmirched", "bifurcated", "bigot", "bland"],
  plain: "A spoon beseeched a cloud, besmirched a silver napkin, bifurcated beside a bigot, and served bland thunder for supper.",
  translation: "一把勺子恳求一朵云，弄脏一块银餐巾，在一个偏执者旁边分成两叉，并把无味雷声当晚餐。",
});
export const set46 = compactSet(46, "The Unimpressed Mountain", group(226), {
  title: "The Unimpressed Mountain", targetForms: ["blandishment", "blasé", "blast", "blatant", "blazoned"],
  plain: "A blandishment left the mountain blasé, until a blast exposed a blatant secret and blazoned it across a purple umbrella.",
  translation: "一句甜言蜜语让大山厌倦无感，直到一声爆响揭露了一个明目张胆的秘密，并把它醒目写在紫伞上。",
});
export const set47 = compactSet(47, "The Perfect Garden", group(231), {
  title: "The Perfect Garden", targetForms: ["blemish", "blight", "bliss", "blithe", "blueprint"],
  plain: "A blemish invited a blight into bliss, while a blithe radish unfolded a blueprint for a palace made entirely of socks.",
  translation: "一个瑕疵把枯萎病请进极乐之境，与此同时，一根无忧萝卜展开了用袜子建造宫殿的蓝图。",
});
