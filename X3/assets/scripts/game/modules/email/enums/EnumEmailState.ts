/**
 * 邮件状态
 */
export enum EnumEmailState {
    // 未读
    UNREAD = 0,
    // 已读/未领取
    READ_NO_GAIN = 1,
    // 已读/领取
    READ_HAVE_GAIN = 2,
    // 删除
    DELETED = 3,
    
}