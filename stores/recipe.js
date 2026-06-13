/*
 * @Author: elk
 * @Date: 2026-01-22 16:23:29
 * @LastEditors: elk
 * @LastEditTime: 2026-06-13 15:30:00
 * @FilePath: /hkt-applet/stores/recipe.js
 * @Description: 菜谱-购物车-状态管理
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { getCartList, addToCart, updateCartItem, removeCartItem, clearCart as clearCartAPI } from "@/api/cart.js";

export const useRecipeStore = defineStore(
	"recipe",
	() => {
		const cartList = ref([]); // 购物车列表
		const cartTotal = ref(0); // 购物车总数量

		const cateTotal = ref(0); // 菜谱总数量

		const errorMessage = ref(""); // 错误信息
		/**
		 * @description: 获取指定商品在购物车中的数量
		 * @param {*} productId 商品ID
		 * @return {*} 商品数量
		 */
		const getCartQuantity = (productId) => {
			const item = cartList.value.find((item) => item.id === productId);
			return item ? item.quantity : 0;
		};

		/**
		 * @description: 设置购物车列表
		 * @param {*} v
		 * @return {*}
		 */
		const setCartList = (v) => (cartList.value = v);
		/**
		 * @description: 设置购物车总数量
		 * @param {*} v
		 * @return {*}
		 */
		const setCartTotal = (v) => (cartTotal.value = v);
		/**
		 * @description: 设置菜谱总数量
		 * @param {*} v
		 * @return {*}
		 */
		const setCateTotal = (v) => (cateTotal.value = v);

		const hasIdValue = (id) => id !== undefined && id !== null && id !== "";

		const isSameId = (left, right) => hasIdValue(left) && hasIdValue(right) && String(left) === String(right);

		const getCartItemId = (cartItem) => {
			if (!cartItem || typeof cartItem !== "object") return undefined;
			return cartItem.cartItemId || cartItem.id;
		};

		/**
		 * @description: 新增购物车
		 * @param {Object} product - 菜谱对象
		 * @return {Promise}
		 */
		const addCart = async (product) => {
			try {
				// 调用后端新增购物车接口
				const res = await addToCart({
					recipeId: product.id,
					quantity: 1,
				});

				if (res.code === 200) {
					// 更新本地购物车列表
					const createdCartItemId = getCartItemId(res.data);
					const existingItem = cartList.value.find((item) => isSameId(item.id, product.id));
					if (existingItem) {
						// 商品已存在，增加数量
						existingItem.quantity += 1;
						if (createdCartItemId) {
							existingItem.cartItemId = createdCartItemId;
						}
					} else {
						// 新商品，添加到购物车
						cartList.value.push({
							...product,
							cartItemId: createdCartItemId,
							quantity: 1,
						});
					}
					// 更新购物车总数量
					cartTotal.value = cartList.value.reduce((total, item) => total + item.quantity, 0);

					if (!createdCartItemId) {
						loadCartList().catch((error) => {
							console.error("补齐购物车项ID失败:", error);
						});
					}
				}
				return res;
			} catch (error) {
				errorMessage.value = error.message || "新增购物车失败";
				console.error("新增购物车失败:", error);
				throw error;
			}
		};

		const resolveCartDeleteId = (cartInput) => {
			if (cartInput && typeof cartInput === "object") {
				return getCartItemId(cartInput);
			}
			return cartInput;
		};

		/**
		 * @description: 删除购物车
		 * @param {*} productId 购物车项ID或购物车项对象
		 * @return {Promise}
		 */
		const deleteCart = async (productId) => {
			try {
				const isCartObject = productId && typeof productId === "object";
				const normalizedId = resolveCartDeleteId(productId);
				if (!hasIdValue(normalizedId)) {
					throw new Error("购物车项ID不能为空");
				}

				// 查找购物车项，获取真实的 cartItemId
				let cartItem = cartList.value.find((item) => isSameId(item.id, normalizedId) || isSameId(item.cartItemId, normalizedId));
				let deleteId = cartItem?.cartItemId || (isCartObject ? productId.cartItemId : normalizedId);

				if (!hasIdValue(deleteId) && isCartObject) {
					await loadCartList();
					cartItem = cartList.value.find((item) => isSameId(item.id, normalizedId) || isSameId(item.cartItemId, normalizedId));
					deleteId = cartItem?.cartItemId;
				}

				if (!hasIdValue(deleteId)) {
					throw new Error("购物车项ID不能为空");
				}

				// 调用后端删除购物车接口
				const res = await removeCartItem(deleteId);

				if (res.code !== 200) {
					throw new Error(res.message || "删除购物车失败");
				}

				// 更新本地购物车列表（根据菜谱ID或购物车项ID删除）
				cartList.value = cartList.value.filter((item) => !isSameId(item.id, normalizedId) && !isSameId(item.cartItemId, normalizedId));
				// 更新购物车总数量
				cartTotal.value = cartList.value.reduce((total, item) => total + item.quantity, 0);
				return res;
			} catch (error) {
				errorMessage.value = error.message || "删除购物车失败";
				console.error("删除购物车失败:", error);
				throw error;
			}
		};

		/**
		 * @description: 更新购物车项数量
		 * @param {Object} cartInput 购物车项对象
		 * @param {number} quantity 新数量
		 * @return {Promise}
		 */
		const updateCartQuantity = async (cartInput, quantity) => {
			try {
				const cartItemId = getCartItemId(cartInput);
				if (!hasIdValue(cartItemId)) {
					throw new Error("购物车项ID不能为空");
				}

				const nextQuantity = Number(quantity);
				if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
					throw new Error("购物车数量不合法");
				}

				const res = await updateCartItem(cartItemId, nextQuantity);
				if (res.code !== 200) {
					throw new Error(res.message || "更新购物车数量失败");
				}

				const item = cartList.value.find((entry) => isSameId(entry.cartItemId, cartItemId) || isSameId(entry.id, cartInput?.id));
				if (item) {
					item.quantity = nextQuantity;
				}
				cartTotal.value = cartList.value.reduce((total, item) => total + item.quantity, 0);
				return res;
			} catch (error) {
				errorMessage.value = error.message || "更新购物车数量失败";
				console.error("更新购物车数量失败:", error);
				throw error;
			}
		};

		/**
		 * @description: 清空购物车
		 * @return {Promise}
		 */
		const clearCart = async () => {
			try {
				// 调用后端清空购物车接口
				const res = await clearCartAPI();

				if (res.code === 200) {
					// 清空本地购物车列表
					cartList.value = [];
					// 购物车总数量设为0
					cartTotal.value = 0;
				}
				return res;
			} catch (error) {
				errorMessage.value = error.message || "清空购物车失败";
				console.error("清空购物车失败:", error);
				throw error;
			}
		};

		/**
		 * @description: 从后端加载购物车列表
		 * @return {Promise}
		 */
		const loadCartList = async () => {
			try {
				const res = await getCartList();
				if (res.code === 200 && res.data) {
					// 后端返回的数据结构: { list: [], cartTotal: number }
					const list = res.data.list || res.data;
					const total = res.data.cartTotal;

					// 将后端购物车数据映射为前端格式
					// 后端返回: { id, recipeId, quantity, recipe: {...} }
					// 前端需要: { id (菜谱ID), cartItemId, quantity, ...recipe }
					if (Array.isArray(list)) {
						cartList.value = list.map((item) => ({
							id: item.recipe?.id || item.recipeId, // 使用菜谱ID作为主ID
							cartItemId: item.id, // 保存购物车项ID用于删除
							quantity: item.quantity,
							...(item.recipe || {}), // 展开菜谱信息
						}));
					} else {
						cartList.value = [];
					}

					cartTotal.value = total || 0;
				}
				return res;
			} catch (error) {
				errorMessage.value = error.message || "加载购物车失败";
				console.error("加载购物车失败:", error);
				throw error;
			}
		};

		/**
		 * @description: 重置菜谱和购物车状态
		 * @return {void}
		 */
		const resetRecipeState = () => {
			cartList.value = [];
			cartTotal.value = 0;
			cateTotal.value = 0;
			errorMessage.value = "";
		};

		return {
			cartList,
			cartTotal,
			cateTotal,
			getCartQuantity,
			setCartList,
			setCartTotal,
			setCateTotal,
			addCart,
			deleteCart,
			updateCartQuantity,
			clearCart,
			loadCartList,
			resetRecipeState,
		};
	},
	{
		persist: {
			key: "recipe",
			storage: {
				getItem: (k) => uni.getStorageSync(k),
				setItem: (k, v) => uni.setStorageSync(k, v),
			},
		},
	}
);
