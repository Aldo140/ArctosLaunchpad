export const budgetRanges = [
  "Under $1,000",
  "$1,000–$2,499",
  "$2,500–$4,999",
  "$5,000–$9,999",
  "$10,000+",
] as const;

// Keep accepting submissions from pages that were open before this release.
export const acceptedBudgetRanges = [
  ...budgetRanges,
  "Under $10,000",
  "$10,000 to $25,000",
  "$25,000 to $50,000",
  "$50,000 to $100,000",
  "$100,000+",
  "Not sure yet",
] as const;
