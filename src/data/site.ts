export const site = {
  name: 'HubCSCA',
  platform: 'https://hubcsca.dcpstudios.top/#/',
  tagline: '线下教学 × 线上工具，双重赋能',
  description:
    'HubCSCA 国际学生 CSCA 备考平台，提供全科备考支持，以线下精品课程结合线上智能练习，系统提升学习效率与应试能力',
  reference: 'https://www.cscapreppals.com/zh',
  openClass: 'https://www.cscapreppals.com/zh/open-class',
  courses: 'https://www.cscapreppals.com/zh/tutoring',
  subjects: [
    { label: '数学', path: 'math' },
    { label: '物理', path: 'physics' },
    { label: '化学', path: 'chemistry' },
    { label: '中文', path: 'chinese' },
  ],
};

export const base = import.meta.env.BASE_URL;
export const asset = (path: string) => `${base}${path.replace(/^\//, '')}`;
