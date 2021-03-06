import React, { ReactElement, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import {
  cartItemIdState,
  cartItemState,
  cartDiscountIdState,
  cartDiscountState,
  currentModal
} from '../store/atoms';
import {
  requestCurrencyCode,
  requestItemByIdList,
  requestDiscountByIdList
} from '../api';
import Cart from '../components/Cart';
import Modal from '../components/layout/Modal';

interface Item {
  count: number;
  name: string;
  price: number;
}

interface Discount {
  name: string;
  rate: number;
  targetItems: { [key: string]: Item };
  costForDiscount: number;
}

interface CartContainerProps {
  history: RouteComponentProps;
}

const reducer = (acc, cur) => acc + cur;

const CartContainer = (props: CartContainerProps) => {
  const { history } = props;
  const schedule = {
    name: '최민지',
    date: '2020. 6. 2. 오후 6:00'
  };

  const [cartItemIds, setCartItemIds] = useRecoilState(cartItemIdState);
  const [cartItems, setCartItems] = useRecoilState(cartItemState);
  const [cartDiscountIds, setCartDiscountIds] = useRecoilState(
    cartDiscountIdState
  );
  const [cartDiscounts, setCartDiscounts] = useRecoilState(cartDiscountState);
  const [modalState, setModalState] = useRecoilState(currentModal);

  const closeModal = useResetRecoilState(currentModal);

  const [isLoading, setIsLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [currencyCode, setCurrencyCode] = useState('');

  useEffect(() => {
    const getCurrencyCode = async () => {
      const code = await requestCurrencyCode();
      setCurrencyCode(code);
    };
    getCurrencyCode();
  }, []);

  const cartItemIdList = Object.keys(cartItemIds);
  useEffect(() => {
    // instead of getItemById
    const getItem = async () => {
      try {
        setIsLoading(true);
        const data:
          | { [key: string]: Item }
          | undefined = await requestItemByIdList(cartItemIdList);

        for (let key in data) {
          data[key].count = cartItemIds[key].count;
        }
        setCartItems(data);

        setIsLoading(false);
      } catch (err) {
        console.warn(err);
      }
    };

    if (cartItemIdList.length) getItem();
  }, []);

  const cartDiscountIdList = Object.keys(cartDiscountIds);
  useEffect(() => {
    // instead of getDiscountById
    const getDiscount = async () => {
      try {
        setIsLoading(true);
        const data:
          | { [key: string]: Discount }
          | undefined = await requestDiscountByIdList(cartDiscountIdList);

        for (let key in data) {
          data[key].targetItems = cartDiscountIds[key].targetItems;
          data[key].costForDiscount = cartDiscountIds[key].costForDiscount;
        }
        setCartDiscounts(data);

        setIsLoading(false);
      } catch (err) {
        console.warn(err);
      }
    };

    if (cartDiscountIdList.length) getDiscount();
  }, []);

  useEffect(() => {
    const handleTotalCost = () => {
      let totalPrice,
        totalDiscountCost = 0;
      if (Object.values(cartItems).length) {
        const itemList: Item[] = Object.values(cartItems);
        const costList = itemList.map((item: Item) => item.price * item.count);
        totalPrice = costList.reduce(reducer, 0);

        if (Object.values(cartDiscounts).length) {
          const discountList: Discount[] = Object.values(cartDiscounts);
          const discountCostList = discountList.map(
            (discount: Discount) => discount.costForDiscount
          );
          totalDiscountCost = discountCostList.reduce(reducer, 0);
        }
        setTotalCost(totalPrice - totalDiscountCost);
      }
    };
    handleTotalCost();
  });

  const handleItemCount = (key: string, count: number) => {
    const updateItemInfo = { ...cartItems[key], count };
    const newItems = { ...cartItems };
    const newItemIds = { ...cartItemIds };
    newItems[key] = updateItemInfo;
    newItemIds[key] = { count };
    setCartItems(newItems);
    setCartItemIds(newItemIds);
  };

  const removeItem = (key: string) => {
    const newItemIds = { ...cartItemIds };
    delete newItemIds[key];
    setCartItemIds(newItemIds);
    const newItems = { ...cartItems };
    delete newItems[key];
    setCartItems(newItems);
  };

  const removeDiscount = (key: string) => {
    const newDiscountIds = { ...cartDiscountIds };
    delete newDiscountIds[key];
    setCartDiscountIds(newDiscountIds);
    const newDiscounts = { ...cartDiscounts };
    delete newDiscounts[key];
    setCartDiscounts(newDiscounts);
  };

  const submitTargetItems = (
    discountKey: string,
    discountRate: number,
    targetItems: { [key: string]: Item }
  ) => {
    const itemList = Object.values(targetItems);
    const costList = itemList.map((item: Item) => item.price * item.count);
    const totalCost = costList.reduce(reducer, 0);

    const newDiscounts = { ...cartDiscounts };
    const newDiscountInfo = {
      ...newDiscounts[discountKey],
      targetItems,
      costForDiscount: totalCost * discountRate
    };
    newDiscounts[discountKey] = newDiscountInfo;
    setCartDiscounts(newDiscounts);

    const newDiscountIds = { ...cartDiscountIds };
    newDiscountIds[discountKey] = {
      targetItems,
      costForDiscount: totalCost * discountRate
    };
    setCartDiscountIds(newDiscountIds);
  };

  const handleModalOpen = (title: string, children: ReactElement) => {
    const newModal = { ...modalState, isDisplay: true, title, children };
    setModalState(newModal);
  };

  return (
    <>
      <Cart
        isLoading={isLoading}
        history={history}
        schedule={schedule}
        currencyCode={currencyCode}
        cartItems={cartItems}
        cartDiscounts={cartDiscounts}
        totalCost={totalCost}
        handleItemCount={handleItemCount}
        removeItem={removeItem}
        removeDiscount={removeDiscount}
        submitTargetItems={submitTargetItems}
        handleModalOpen={handleModalOpen}
        handleModalClose={closeModal}
      />
      <Modal
        isDisplay={modalState.isDisplay}
        handleClose={closeModal}
        title={modalState.title}
        children={modalState.children}
      />
    </>
  );
};

export default CartContainer;
