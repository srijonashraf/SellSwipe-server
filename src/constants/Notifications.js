export const REPORT_CATEGORIES = {
  SCAM_OR_FRAUD: "Scam or Fraud",
  HARASSMENT: "Harassment",
  HATE_SPEECH: "Hate Speech",
  VIOLENCE_OR_THREAT: "Violence or Threat",
  SPAM: "Spam",
  NUDITY_OR_SEXUAL_CONTENT: "Nudity or Sexual Content",
  FALSE_INFORMATION: "False Information",
  INTELLECTUAL_PROPERTY_VIOLATION: "Intellectual Property Violation",
  SELF_HARM_OR_SUICIDE: "Self-Harm or Suicide",
  TERRORISM_OR_VIOLENT_EXTREMISM: "Terrorism or Violent Extremism",
  UNAUTHORIZED_SALES: "Unauthorized Sales",
  OTHER: "Other",
};

export const NOTIFICATION_ACTIONS = {
  DELETE_POST: {
    event: "deletePost",
    title: "Your post was removed",
    description:
      "Your post violated our community standards and has been removed. Please follow the guidelines to avoid further actions.",
  },
  FEEDBACK_POST: {
    event: "feedbackPost",
    title: "New feedback on your post",
    description: "You have received new feedback on your post.",
  },
  MARKED_FAVOURITE: {
    event: "markedAsFavourite",
    title: "Your post was marked as a favorite",
    description: "Another user marked your post as a favorite.",
  },
  WARNING_ACCOUNT: {
    event: "warningAccount",
    title: "Account warning",
    description:
      "Your account has received a warning due to policy violations.",
  },
  REPORT_TO_ADMIN: {
    event: "reportAccount",
    title: "New report submitted",
    description: "A new report has been submitted for review.",
  },
};
