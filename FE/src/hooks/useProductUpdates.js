import { useState, useCallback } from "react";
import useWsSubscription from "./useWsSubscription";

export default function useProductUpdates() {
  const [inventoryUpdates, setInventoryUpdates] = useState([]);
  const [removedProducts, setRemovedProducts] = useState(new Set());

  // Stabilized callback for inventory updates
  const handleInventoryUpdate = useCallback((message) => {
    console.log("useProductUpdates: Received inventory update", message.data);

    if (Array.isArray(message.data)) {
      setInventoryUpdates((prev) => {
        const newUpdates = [...message.data, ...prev].slice(0, 100); // Keep last 100 updates
        return newUpdates;
      });
    }
  }, [setInventoryUpdates]); // setInventoryUpdates is stable

  // Stabilized callback for product removal
  const handleProductRemoved = useCallback((message) => {
    console.log("useProductUpdates: Product removed", message.data);

    if (message.data?.productId) {
      setRemovedProducts((prev) => new Set([...prev, message.data.productId]));
    }
  }, [setRemovedProducts]); // setRemovedProducts is stable

  useWsSubscription("inventoryUpdate", handleInventoryUpdate);
  useWsSubscription("productRemoved", handleProductRemoved);

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
