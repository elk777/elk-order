/*
 * @Author: elk
 * @Date: 2026-06-15
 * @FilePath: /hkt-applet/config/subscriptionMessages.js
 * @Description: 微信订阅消息模板配置
 */

export const SUBSCRIBE_MESSAGE_TYPES = {
	ORDER_COMPLETED: "order_completed",
	ORDER_MAKING: "order_making",
	ORDER_ACCEPTED: "order_accepted",
	ORDER_CANCELED: "order_canceled",
	ORDER_RESERVATION: "order_reservation",
	CHECKIN_REMINDER: "checkin_reminder",
};

export const SUBSCRIBE_MESSAGE_SCENES = {
	SETTINGS: "settings",
	CHECKIN_ACTION: "checkin_action",
	CHECKIN_REMIND: "checkin_remind",
	ORDER_SUBMIT: "order_submit",
	ORDER_CANCEL: "order_cancel",
	ORDER_ACCEPT: "order_accept",
	ORDER_MAKING: "order_making",
	ORDER_COMPLETE: "order_complete",
};

export const SUBSCRIBE_MESSAGE_TEMPLATES = [
	{
		type: SUBSCRIBE_MESSAGE_TYPES.ORDER_COMPLETED,
		title: "订单完成通知",
		desc: "饲养员完成订单后提醒吃货",
		templateId: "n6JkOezrdEPZdyYQqNEkmgPKCYJ-_gTOECs-NWH6t-M",
	},
	{
		type: SUBSCRIBE_MESSAGE_TYPES.ORDER_MAKING,
		title: "订单制作通知",
		desc: "饲养员开始制作时提醒吃货",
		templateId: "4rS-ukjKyG9goW9p7AiSrTd0OAi6yLCYtXXBkeraAyI",
	},
	{
		type: SUBSCRIBE_MESSAGE_TYPES.ORDER_ACCEPTED,
		title: "接单成功通知",
		desc: "饲养员接单后提醒吃货",
		templateId: "MqwIYitdCwH7WPXyb69AttnyBkNo1wfI28nnBExjcaE",
	},
	{
		type: SUBSCRIBE_MESSAGE_TYPES.ORDER_CANCELED,
		title: "订单取消通知",
		desc: "任一方取消订单后提醒对方",
		templateId: "93ZBSiRuK3P6wdkgX_5qQ-qSVpcfhK0aHffHFkAxcYY",
	},
	{
		type: SUBSCRIBE_MESSAGE_TYPES.ORDER_RESERVATION,
		title: "订餐预约提醒",
		desc: "吃货提交订单后提醒饲养员",
		templateId: "9St9GUeQUstdVnHf224sIG6O8-btcQu8Bbn4orMyUiQ",
	},
	{
		type: SUBSCRIBE_MESSAGE_TYPES.CHECKIN_REMINDER,
		title: "签到提醒",
		desc: "提醒绑定的对方来签到",
		templateId: "nKaeJCZqenAAoUGTROKbHafscnGHFHzlZRIRkDMoII4",
	},
];

export const SUBSCRIBE_MESSAGE_TYPE_TO_TEMPLATE = SUBSCRIBE_MESSAGE_TEMPLATES.reduce((map, item) => {
	map[item.type] = item;
	return map;
}, {});

export const SUBSCRIBE_MESSAGE_TEMPLATE_ID_TO_TYPE = SUBSCRIBE_MESSAGE_TEMPLATES.reduce((map, item) => {
	map[item.templateId] = item.type;
	return map;
}, {});

export const SUBSCRIBE_MESSAGE_SCENE_TYPES = {
	[SUBSCRIBE_MESSAGE_SCENES.SETTINGS]: [
		SUBSCRIBE_MESSAGE_TYPES.CHECKIN_REMINDER,
		SUBSCRIBE_MESSAGE_TYPES.ORDER_RESERVATION,
		SUBSCRIBE_MESSAGE_TYPES.ORDER_CANCELED,
		SUBSCRIBE_MESSAGE_TYPES.ORDER_ACCEPTED,
		SUBSCRIBE_MESSAGE_TYPES.ORDER_MAKING,
		SUBSCRIBE_MESSAGE_TYPES.ORDER_COMPLETED,
	],
	[SUBSCRIBE_MESSAGE_SCENES.CHECKIN_ACTION]: [SUBSCRIBE_MESSAGE_TYPES.CHECKIN_REMINDER],
	[SUBSCRIBE_MESSAGE_SCENES.CHECKIN_REMIND]: [SUBSCRIBE_MESSAGE_TYPES.CHECKIN_REMINDER],
	[SUBSCRIBE_MESSAGE_SCENES.ORDER_SUBMIT]: [SUBSCRIBE_MESSAGE_TYPES.ORDER_RESERVATION],
	[SUBSCRIBE_MESSAGE_SCENES.ORDER_CANCEL]: [SUBSCRIBE_MESSAGE_TYPES.ORDER_CANCELED],
	[SUBSCRIBE_MESSAGE_SCENES.ORDER_ACCEPT]: [SUBSCRIBE_MESSAGE_TYPES.ORDER_ACCEPTED],
	[SUBSCRIBE_MESSAGE_SCENES.ORDER_MAKING]: [SUBSCRIBE_MESSAGE_TYPES.ORDER_MAKING],
	[SUBSCRIBE_MESSAGE_SCENES.ORDER_COMPLETE]: [SUBSCRIBE_MESSAGE_TYPES.ORDER_COMPLETED],
};
