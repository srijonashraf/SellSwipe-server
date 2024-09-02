export const postValidationQuery = ({
  onReview = false,
  isDeclined = false,
  isApproved = true,
  isActive = true,
  isDeleted = false,
  ...props
} = {}) => {
  return {
    onReview,
    isDeclined,
    isApproved,
    isActive,
    isDeleted,
    ...props,
  };
};
