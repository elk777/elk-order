import { withDefaultMediaUrl } from "@/utils/media.js";

export const ROLE_TYPES = {
	keeper: 0,
	foodie: 1,
};

export const ROLE_LABELS = {
	[ROLE_TYPES.keeper]: "饲养员",
	[ROLE_TYPES.foodie]: "吃货",
};

const toId = (value) => (value === undefined || value === null || value === "" ? "" : String(value));

export const isSameCoupleUser = (left = {}, right = {}) => {
	const leftId = toId(left.id);
	const rightId = toId(right.id);
	const leftUuid = toId(left.uuid || left.uuId);
	const rightUuid = toId(right.uuid || right.uuId);

	return (!!leftId && leftId === rightId) || (!!leftUuid && leftUuid === rightUuid);
};

const getAvatar = (user, fallback) => withDefaultMediaUrl(user?.avatar, fallback);

export const buildCoupleRoleSlots = ({ coupleInfo, currentUser, currentRoleType, defaultAvatar }) => {
	if (!coupleInfo) return null;

	const feeder = coupleInfo.feeder || null;
	const foodie = coupleInfo.foodie || null;
	const currentInCouple = [feeder, foodie].find((user) => isSameCoupleUser(user, currentUser));
	const partnerInCouple = currentInCouple
		? [feeder, foodie].find((user) => user && !isSameCoupleUser(user, currentInCouple))
		: null;

	if (currentRoleType === ROLE_TYPES.keeper) {
		const keeperUser = currentInCouple || feeder || currentUser;
		const foodieUser = partnerInCouple || foodie;
		return {
			keeper: {
				user: keeperUser,
				avatar: getAvatar(keeperUser, defaultAvatar),
				label: ROLE_LABELS[ROLE_TYPES.keeper],
				isCurrent: true,
			},
			foodie: {
				user: foodieUser,
				avatar: getAvatar(foodieUser, defaultAvatar),
				label: ROLE_LABELS[ROLE_TYPES.foodie],
				isCurrent: false,
			},
		};
	}

	if (currentRoleType === ROLE_TYPES.foodie) {
		const foodieUser = currentInCouple || foodie || currentUser;
		const keeperUser = partnerInCouple || feeder;
		return {
			keeper: {
				user: keeperUser,
				avatar: getAvatar(keeperUser, defaultAvatar),
				label: ROLE_LABELS[ROLE_TYPES.keeper],
				isCurrent: false,
			},
			foodie: {
				user: foodieUser,
				avatar: getAvatar(foodieUser, defaultAvatar),
				label: ROLE_LABELS[ROLE_TYPES.foodie],
				isCurrent: true,
			},
		};
	}

	return {
		keeper: {
			user: feeder,
			avatar: getAvatar(feeder, defaultAvatar),
			label: ROLE_LABELS[ROLE_TYPES.keeper],
			isCurrent: false,
		},
		foodie: {
			user: foodie,
			avatar: getAvatar(foodie, defaultAvatar),
			label: ROLE_LABELS[ROLE_TYPES.foodie],
			isCurrent: false,
		},
	};
};
