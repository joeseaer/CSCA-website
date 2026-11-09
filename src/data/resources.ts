// 生成日期：2026-11-08
// 文档概要：资源库的官方大纲索引、自编数学公式、同源术语表与小程序功能介绍。
import glossary from '../../public/resources/glossary.json';
import { site } from './site';

export const syllabus = [
  {
    id: 'mathematics',
    title: '数学考试大纲',
    subject: 'Mathematics',
    description: '2025 版 · 48 道单选题 · 60 分钟 · 100 分',
    topics: ['集合与不等式', '函数、数列与导数', '几何与代数', '概率与统计'],
    href: 'resources/syllabus/mathematics-2025.pdf',
    format: '官方 PDF · English',
  },
  {
    id: 'chinese-humanities',
    title: '文科中文考试大纲',
    subject: '专业中文 · 文科',
    description: '2025 版 · 单项选择题 · 90 分钟 · 100 分',
    topics: ['汉字与词语', '语段与语句', '专业阅读', '人文社科话题'],
    href: 'resources/syllabus/chinese-humanities-2025.pdf',
    format: '官方 PDF · 中文',
  },
  {
    id: 'chinese-stem',
    title: '理科中文考试大纲',
    subject: '专业中文 · 理科',
    description: '2025 版 · 单项选择题 · 90 分钟 · 100 分',
    topics: ['数理概念表达', '专业课程词汇', '实验与图表', '学术阅读与交流'],
    href: 'resources/syllabus/chinese-stem-2025.pdf',
    format: '官方 PDF · 中文',
  },
  {
    id: 'physics',
    title: '物理考试大纲',
    subject: 'Physics',
    description: '2025 版 · 48 道单选题 · 60 分钟 · 100 分',
    topics: ['力学', '电磁学', '热学', '光学与近代物理'],
    href: 'resources/syllabus/physics-2025.pdf',
    format: '官方 PDF · English',
  },
  {
    id: 'chemistry',
    title: '化学考试大纲',
    subject: 'Chemistry',
    description: '2025 版 · 48 道单选题 · 60 分钟 · 100 分',
    topics: ['基本概念与计算', '物质性质与反应', '化学理论', '实验与应用'],
    href: 'resources/syllabus/chemistry-2025.pdf',
    format: '官方 PDF · English',
  },
];

export const formulaGroups = [
  {
    id: 'algebra',
    title: '集合与代数',
    formulas: [
      {
        name: '并集计数',
        expression: '|A ∪ B| = |A| + |B| − |A ∩ B|',
        note: 'A、B 为有限集合；|A| 表示元素个数。',
      },
      {
        name: '平方与立方差',
        expression: 'a² − b² = (a − b)(a + b)；a³ − b³ = (a − b)(a² + ab + b²)',
      },
      { name: '完全平方', expression: '(a ± b)² = a² ± 2ab + b²' },
      {
        name: '一元二次方程',
        expression: 'x = (−b ± √(b² − 4ac)) / (2a)',
        note: 'ax² + bx + c = 0，a ≠ 0；实数根要求 b² − 4ac ≥ 0。',
      },
      {
        name: '韦达定理',
        expression: 'x₁ + x₂ = −b/a；x₁x₂ = c/a',
        note: 'x₁、x₂ 是 ax² + bx + c = 0 的两根，a ≠ 0。',
      },
      {
        name: '基本不等式',
        expression: '(a + b)/2 ≥ √(ab)',
        note: 'a、b ≥ 0；等号当且仅当 a = b。',
      },
    ],
  },
  {
    id: 'functions',
    title: '指数与对数',
    formulas: [
      { name: '指数运算', expression: 'aᵐ · aⁿ = aᵐ⁺ⁿ；(aᵐ)ⁿ = aᵐⁿ', note: 'a > 0，m、n 为实数。' },
      {
        name: '对数的积与商',
        expression: 'logₐ(xy) = logₐx + logₐy；logₐ(x/y) = logₐx − logₐy',
        note: 'a > 0 且 a ≠ 1；x、y > 0。',
      },
      {
        name: '对数的幂',
        expression: 'logₐ(xʳ) = r logₐx',
        note: 'a > 0 且 a ≠ 1；x > 0，r 为实数。',
      },
      { name: '换底公式', expression: 'logₐb = ln b / ln a', note: 'a、b > 0 且 a ≠ 1。' },
    ],
  },
  {
    id: 'trigonometry',
    title: '三角函数',
    formulas: [
      {
        name: '同角关系',
        expression: 'sin²x + cos²x = 1；tan x = sin x / cos x',
        note: '正切公式要求 cos x ≠ 0。',
      },
      { name: '两角和与差', expression: 'sin(α ± β) = sin α cos β ± cos α sin β' },
      { name: '余弦和与差', expression: 'cos(α ± β) = cos α cos β ∓ sin α sin β' },
      { name: '二倍角', expression: 'sin 2x = 2 sin x cos x；cos 2x = 2 cos²x − 1 = 1 − 2 sin²x' },
      {
        name: '正弦定理',
        expression: 'a/sin A = b/sin B = c/sin C = 2R',
        note: 'A、B、C 为三角形内角，a、b、c 为对应边；R 为外接圆半径。',
      },
      { name: '余弦定理', expression: 'c² = a² + b² − 2ab cos C', note: 'C 为边 a、b 的夹角。' },
    ],
  },
  {
    id: 'sequences',
    title: '数列',
    formulas: [
      { name: '等差数列通项', expression: 'aₙ = a₁ + (n − 1)d', note: 'd 为公差，n 为正整数。' },
      { name: '等差数列求和', expression: 'Sₙ = n(a₁ + aₙ)/2 = na₁ + n(n − 1)d/2' },
      { name: '等比数列通项', expression: 'aₙ = a₁qⁿ⁻¹', note: 'q 为非零公比，n 为正整数。' },
      {
        name: '等比数列求和',
        expression: 'Sₙ = a₁(1 − qⁿ)/(1 − q)',
        note: 'q ≠ 1；q = 1 时 Sₙ = na₁。',
      },
    ],
  },
  {
    id: 'derivatives',
    title: '导数',
    formulas: [
      {
        name: '幂函数求导',
        expression: '(xⁿ)′ = nxⁿ⁻¹',
        note: 'n 为正整数时适用于全体实数 x；一般实数指数取 x > 0。',
      },
      {
        name: '指数与对数求导',
        expression: '(eˣ)′ = eˣ；(aˣ)′ = aˣ ln a；(ln x)′ = 1/x',
        note: 'a > 0 且 a ≠ 1；ln x 要求 x > 0。',
      },
      {
        name: '三角函数求导',
        expression: '(sin x)′ = cos x；(cos x)′ = −sin x',
        note: '角度使用弧度。',
      },
      {
        name: '积与商的导数',
        expression: '(uv)′ = u′v + uv′；(u/v)′ = (u′v − uv′)/v²',
        note: 'u、v 可导；商法则要求 v ≠ 0。',
      },
      {
        name: '复合函数与切线',
        expression: '[f(g(x))]′ = f′(g(x))g′(x)；y − f(x₀) = f′(x₀)(x − x₀)',
        note: '相关函数在所求点可导。',
      },
    ],
  },
  {
    id: 'geometry',
    title: '解析几何',
    formulas: [
      { name: '两点距离', expression: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)' },
      {
        name: '点到直线距离',
        expression: 'd = |Ax₀ + By₀ + C| / √(A² + B²)',
        note: '直线 Ax + By + C = 0，A、B 不同时为 0。',
      },
      {
        name: '圆的标准方程',
        expression: '(x − a)² + (y − b)² = r²',
        note: '圆心 (a,b)，半径 r > 0。',
      },
      {
        name: '椭圆',
        expression: 'x²/a² + y²/b² = 1；c² = a² − b²；e = c/a',
        note: 'a > b > 0，焦点 (±c,0)。',
      },
      {
        name: '双曲线',
        expression: 'x²/a² − y²/b² = 1；c² = a² + b²；y = ±(b/a)x',
        note: 'a、b > 0；最后一式为渐近线。',
      },
      {
        name: '抛物线',
        expression: 'y² = 2px；F(p/2,0)；x = −p/2',
        note: 'p > 0，F 为焦点；最后一式为准线。',
      },
    ],
  },
  {
    id: 'vectors',
    title: '向量、复数与立体几何',
    formulas: [
      {
        name: '向量数量积',
        expression: 'a · b = a₁b₁ + a₂b₂ = |a||b| cos θ',
        note: '平面向量 a = (a₁,a₂)、b = (b₁,b₂)；夹角 θ 要求两向量非零。',
      },
      { name: '空间距离', expression: 'd = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)' },
      {
        name: '复数的模与共轭',
        expression: '|a + bi| = √(a² + b²)；(a + bi)(a − bi) = a² + b²',
        note: 'a、b 为实数，i² = −1。',
      },
      {
        name: '柱体与锥体体积',
        expression: 'V柱 = Sh；V锥 = Sh/3',
        note: 'S 为底面积，h 为垂直高。',
      },
      { name: '球的面积与体积', expression: 'S = 4πr²；V = 4πr³/3', note: 'r > 0 为球半径。' },
    ],
  },
  {
    id: 'probability',
    title: '概率与统计',
    formulas: [
      {
        name: '排列与组合',
        expression: 'Aₙᵏ = n!/(n − k)!；Cₙᵏ = n!/[k!(n − k)!]',
        note: 'n、k 为整数，0 ≤ k ≤ n；0! = 1。',
      },
      {
        name: '古典概型',
        expression: 'P(A) = |A|/|Ω|',
        note: '有限样本空间 Ω 中各基本结果等可能，且 |Ω| > 0。',
      },
      { name: '事件的加法公式', expression: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)' },
      {
        name: '均值与方差',
        expression: 'x̄ = (x₁ + ⋯ + xₙ)/n；σ² = [(x₁ − x̄)² + ⋯ + (xₙ − x̄)²]/n',
        note: '这里为 n 个数据的总体方差；无偏样本方差的分母为 n − 1。',
      },
      {
        name: '正态分布标准化',
        expression: 'X ∼ N(μ,σ²) ⇒ Z = (X − μ)/σ ∼ N(0,1)',
        note: 'σ > 0；分布关于 μ 对称，P(X ≤ μ) = 1/2。',
      },
    ],
  },
];

export const glossaryGroups = [
  { id: 'vocabulary', title: '数学词汇', terms: glossary.filter((term) => !term.symbol) },
  { id: 'symbols', title: '数学符号', terms: glossary.filter((term) => Boolean(term.symbol)) },
];

export const glossaryMeta = {
  count: glossary.length,
  dataHref: '/resources/glossary.json',
  downloadHref: '/resources/csca-math-glossary.docx',
  csvHref: '/resources/csca-math-glossary.csv',
};

const appBase = `${site.platform}pages/`;
export const appModules = [
  {
    id: 'home',
    title: '学习首页',
    icon: 'home',
    description: '把备考日程、学习入口与每日复习放在一起。',
    features: ['考试日程与倒计时', '错题回顾', '知识点卡片'],
    href: `${appBase}home/index`,
  },
  {
    id: 'practice',
    title: '题库训练',
    icon: 'book',
    description: '按试卷或知识点练习，随时继续上次进度。',
    features: ['试卷练习', '每日练习', '知识点筛选'],
    href: `${appBase}practice/index`,
  },
  {
    id: 'exam',
    title: '模拟考试',
    icon: 'clock',
    description: '用 48 题、60 分钟的完整练习检验掌握程度。',
    features: ['限时作答', '成绩与用时', '薄弱知识点分析'],
    href: `${appBase}practice/index`,
  },
  {
    id: 'camera',
    title: '拍照搜题',
    icon: 'camera',
    description: '拍摄或上传题目，裁剪后查看题干、翻译与解题过程。',
    features: ['单题与整页识别', '图片裁剪', '解答与追问'],
    href: `${appBase}camera/index`,
  },
  {
    id: 'chat',
    title: 'AI 学习问答',
    icon: 'sparkles',
    description: '围绕题目继续追问，也可以从一个新的学习问题开始。',
    features: ['连续对话', '解题思路', '历史会话'],
    href: `${appBase}home/index`,
  },
  {
    id: 'translate',
    title: '文本与公式翻译',
    icon: 'languages',
    description: '跨语言阅读题目，保留原文中的数学公式。',
    features: ['语言切换', '数学公式保留', '词语释义'],
    href: `${appBase}translate/index`,
  },
  {
    id: 'document',
    title: '文档翻译',
    icon: 'file',
    description: '上传学习文档，查看翻译进度并下载文本译文。',
    features: ['PDF 与 DOCX', 'TXT、Markdown 与 CSV', '任务进度与译文下载'],
    href: `${appBase}document-translate/index`,
  },
  {
    id: 'glossary',
    title: '数学术语表',
    icon: 'globe',
    description: '查找中文、外文、拼音与数学符号之间的对应关系。',
    features: ['关键词搜索', '中外文对照', '符号与释义'],
    href: `${appBase}glossary/index`,
  },
  {
    id: 'notebook',
    title: '笔记与错题复习',
    icon: 'notebook',
    description: '保存题目与解答，把练习中的错题带回日常复习。',
    features: ['收藏与文件夹', '错题自动归档', '按掌握程度安排复习'],
    href: `${appBase}notebook/index`,
  },
  {
    id: 'classroom',
    title: '辅导课堂',
    icon: 'play',
    description: '浏览课程与课时，观看教学视频并记录学习进度。',
    features: ['课程目录', '课时视频', '学习进度'],
    href: `${appBase}classroom/index`,
  },
  {
    id: 'booking',
    title: '课程预约',
    icon: 'calendar',
    description: '选择授课语言、课程形式与时间，查看预约进度。',
    features: ['中英文与双语课程', '一对一与小班', '预约记录与评价'],
    href: `${appBase}booking/index`,
  },
  {
    id: 'profile',
    title: '我的学习空间',
    icon: 'user',
    description: '管理学习资料、会员权益和个人偏好。',
    features: ['学习与订单', '会员与邀请', '语言、主题与字号'],
    href: `${appBase}profile/index`,
  },
];

export const resourceDownloads = {
  glossary: { href: '/resources/csca-math-glossary.docx', label: '中英对照表', format: 'DOCX' },
  glossaryCsv: { href: '/resources/csca-math-glossary.csv', label: '术语数据表', format: 'CSV' },
};
