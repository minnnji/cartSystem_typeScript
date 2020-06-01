import React from 'react';
import Header from './layout/Header';
import CheckBox from './layout/Checkbox.js';
import styled from 'styled-components';
import theme from './layout/theme';

interface DiscountListProps {
  isLoading: boolean;
  discount: [
    string,
    {
      name: string;
      rate: number;
    }
  ][];
  selectedDiscountList: object[];
  handleSelectedDiscountList: (
    item: [
      string,
      {
        name: string;
        rate: number;
      }
    ]
  ) => void;
  handleBack: () => void;
}

const DiscountList = (props: DiscountListProps) => {
  const {
    isLoading,
    discount,
    selectedDiscountList,
    handleSelectedDiscountList,
    handleBack
  } = props;

  const isSelectedDiscount = (key: string) =>
    selectedDiscountList.some(selectedDiscount => selectedDiscount[0] === key);

  const discounts = discount.map(item => {
    return (
      <Li key={item[0]}>
        <CheckBox
          checked={isSelectedDiscount(item[0])}
          onChange={() => handleSelectedDiscountList(item)}
        />
        <Info>
          <Name>{item[1].name}</Name>
          <Price>{Math.floor(item[1].rate * 100)}% 할인</Price>
        </Info>
      </Li>
    );
  });

  return (
    <>
      <Header title='할인 추가하기' handleBack={handleBack} />
      <Section>
        {isLoading ? <div>Loading...</div> : <ul>{discounts}</ul>}
      </Section>
    </>
  );
};

const Section = styled.section`
  padding: 16px;
`;

const Li = styled.li`
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid lightgray;
`;

const Info = styled.dl`
  display: inline-block;
  margin-right: 10px;
  font-size: 18px;
`;

const Name = styled.dt`
  margin-bottom: 10px;
`;

const Price = styled.dd`
  font-weight: 200;
  font-size: 16px;
  color: ${theme.COLOR_PINK_2};
`;

export default DiscountList;
