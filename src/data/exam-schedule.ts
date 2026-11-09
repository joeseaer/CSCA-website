/** Confirmed dates: https://csca.cn/articles/news/5845493510871449664 */
export const examSchedule = {
  startsAt: '2026-11-14T00:00:00+08:00',
  endsAt: '2026-11-16T00:00:00+08:00',
  milestones: [
    {
      title: '报名开始',
      date: '2026年10月15日',
      time: '12:00（预计）',
      detail: '单科 ¥450，两科及以上 ¥700，支持支付宝、微信、银联、Visa、Mastercard',
      kind: 'registration',
    },
    {
      title: '报名截止',
      date: '2026年10月21日',
      time: '12:00（预计）',
      detail: '未缴费报名自动作废；缴费后信息不可更改',
      kind: 'registration',
    },
    {
      title: '退费截止',
      date: '2026年11月',
      time: '（预计）',
      detail: '准考证生成后不再退费，具体规则以当次报名须知为准',
      kind: 'reminder',
    },
    {
      title: '准考证与考试软件',
      date: '2026年11月',
      time: '（预计）',
      detail: '均在 CSCA 账户内下载；安装最新考试软件',
      kind: 'reminder',
    },
    {
      title: '设备检测',
      date: '2026年11月',
      time: '（预计）',
      hours: '14:00–21:00',
      detail: '务必使用考试当天同一台电脑检测',
      kind: 'reminder',
    },
    {
      title: '官方模考',
      date: '2026年11月',
      time: '（预计）',
      hours: '19:00–21:00',
      detail: '不计分的全流程演练：登录、监考和样题',
      kind: 'reminder',
    },
    {
      title: '考试当天',
      date: '2026年11月14日',
      dateEnd: '至15日',
      time: '',
      detail: '提前45分钟登录，完成设备检测、人脸识别、证件核验',
      kind: 'exam',
    },
    {
      title: '出分',
      date: '2026年11月',
      time: '（预计）',
      detail: '登录 csca.cn 查询并下载成绩证书，具体出分日期以官方通知为准',
      kind: 'results',
    },
  ],
};

export function scheduleState(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  // Month-only milestones are reference reminders, never assumed to be completed
  const current =
    date < '2026-10-15'
      ? 0
      : date <= '2026-10-21'
        ? 1
        : date < '2026-11-14'
          ? 3
          : date <= '2026-11-15'
            ? 6
            : 7;
  return {
    current,
    label: `今天 · ${Number(part('month'))}月${Number(part('day'))}日`,
    ended: date > '2026-11-15',
  };
}
