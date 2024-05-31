export default async (data) => {
  const {
    userID,
    title,
    price,
    discountPrice,
    discountPercentage,
    stock,
    divisionID,
    districtID,
    areaID,
    address,
    otherPhone,
    description,
    size,
    color,
    authenticity,
    condition,
    usedMonths,
    brandID,
    modelID,
    categoryID,
    keyword,
  } = data;

  return {
    PostData: {
      userID,
      title,
      price,
      discountPrice,
      discountPercentage,
      stock,
      divisionID,
      districtID,
      areaID,
      address,
      otherPhone,
    },

    PostDetailsData: {
      description,
      size,
      color,
      authenticity,
      condition,
      usedMonths,
      brandID,
      modelID,
      categoryID,
      keyword,
    },
  };
};
