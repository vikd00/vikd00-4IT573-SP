import { useState, useCallback } from "react";
import useWsSubscription from "./useWsSubscription";

export default function useProductUpdates() {
  const [productUpdates, setProductUpdates] = useState(new Map());
  const [newProducts, setNewProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState(new Set());

  const handleProductUpdate = useCallback((message) => {
    console.log("useProductUpdates: Received product update", message.data);

    if (message.data?.id) {
      const productData = {
        ...message.data,
        price: message.data.price / 100,
      };

      setProductUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.set(message.data.id, productData);
        return newMap;
      });
    }
  }, []);

  const handleProductCreated = useCallback((message) => {
    console.log("useProductUpdates: Received product created", message.data);

    if (message.data?.id) {
      const productData = {
        ...message.data,
        price: message.data.price / 100,
      };

      setNewProducts((prev) => {
        if (prev.some((p) => p.id === productData.id)) {
          return prev;
        }
        return [productData, ...prev];
      });
    }
  }, []);

  const handleProductDeleted = useCallback((message) => {
    console.log("useProductUpdates: Product removed", message.data);

    if (message.data?.productId) {
      setDeletedProducts((prev) => new Set([...prev, message.data.productId]));

      setProductUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(message.data.productId);
        return newMap;
      });

      setNewProducts((prev) =>
        prev.filter((p) => p.id !== message.data.productId)
      );
    }
  }, []);

  useWsSubscription("productUpdated", handleProductUpdate);
  useWsSubscription("productCreated", handleProductCreated);
  useWsSubscription("productDeleted", handleProductDeleted);

  const getUpdatedProduct = (productId) => {
    return productUpdates.get(productId) || null;
  };

  const isProductDeleted = (productId) => {
    return deletedProducts.has(productId);
  };

  const isProductDeactivated = (productId) => {
    const updatedProduct = productUpdates.get(productId);
    return updatedProduct && updatedProduct.active === false;
  };

  const clearDeletedProducts = () => {
    setDeletedProducts(new Set());
  };

  const clearUpdates = () => {
    setProductUpdates(new Map());
    setNewProducts([]);
    setDeletedProducts(new Set());
  };

  return {
    productUpdates: Array.from(productUpdates.values()),
    newProducts,
    deletedProducts: Array.from(deletedProducts),
    getUpdatedProduct,
    isProductDeleted,
    isProductDeactivated,
    clearDeletedProducts,
    clearUpdates,
  };
}
