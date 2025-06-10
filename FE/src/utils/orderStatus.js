export const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "Čaká na spracovanie";
    case "processing":
      return "Spracováva sa";
    case "shipped":
      return "Odoslané";
    case "delivered":
      return "Doručené";
    case "cancelled":
      return "Zrušené";
    default:
      return status;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "info";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "info";
  }
};
