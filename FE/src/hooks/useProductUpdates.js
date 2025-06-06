import { useState } from "react";
import useWsSubscription from "./useWsSubscription";

export default function useProductUpdates() {
  const [inventoryUpdates, setInventoryUpdates] = useState([]);
  const [removedProducts, setRemovedProducts] = useState(new Set());

  useWsSubscription("inventoryUpdate", (message) => {
    console.log("useProductUpdates: Received inventory update", message.data);

    if (Array.isArray(message.data)) {
      setInventoryUpdates((prev) => {
        const newUpdates = [...message.data, ...prev].slice(0, 100); // Keep last 100 updates
        return newUpdates;
      });
    }
  });

  useWsSubscription("productRemoved", (message) => {
    console.log("useProductUpdates: Product removed", message.data);

    if (message.data?.productId) {
      setRemovedProducts((prev) => new Set([...prev, message.data.productId]));
    }
  });

  const getLatestInventoryForProduct = (productId) => {
    const update = inventoryUpdates.find((update) => update.id === productId);
    return update ? update.inventory : null;
  };

  const isProductRemoved = (productId) => {
    return removedProducts.has(productId);
  };

  const clearRemovedProducts = () => {
    setRemovedProducts(new Set());
  };

  return {
    inventoryUpdates,
    removedProducts: Array.from(removedProducts),
    getLatestInventoryForProduct,
    isProductRemoved,
    clearRemovedProducts,
  };
}
