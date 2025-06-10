import {
  sendToAll,
  sendToAdmins,
  sendToUser,
  sendDashboardMetrics,
} from "../websocket/wsServer.js";
import * as analyticsService from "./analyticsService.js";

let dashboardRefreshTimeout = null;

function dashboardUpdate() {
  if (dashboardRefreshTimeout) {
    clearTimeout(dashboardRefreshTimeout);
  }

  dashboardRefreshTimeout = setTimeout(async () => {
    try {
      const metrics = await analyticsService.calcMetrics();
      sendDashboardMetrics(metrics);
      dashboardRefreshTimeout = null;
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      dashboardRefreshTimeout = null;
    }
  }, 2000); // 2 seconds
}

export function orderCreated(order) {
  sendToAdmins("newOrder", {
    orderId: order.id,
    userId: order.userId,
    totalPrice: order.totalPrice,
    itemCount: order.items?.length || 0,
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function orderStatusChanged(order) {
  sendToUser(order.userId, {
    type: "orderStatus",
    data: {
      orderId: order.id,
      status: order.status,
      timestamp: new Date().toISOString(),
    },
  });

  sendToAdmins("orderUpdated", {
    orderId: order.id,
    status: order.status,
    userId: order.userId,
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function orderDeleted(orderId) {
  sendToAdmins("orderDeleted", {
    orderId: orderId,
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function productCreated(product) {
  sendToAdmins("productCreated", {
    productId: product.id,
    productName: product.name,
    price: product.price,
    inventory: product.inventory,
    timestamp: new Date().toISOString(),
  });

  sendToAll({
    type: "productCreated",
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      active: product.active,
      imageUrl: product.imageUrl,
    },
    timestamp: new Date().toISOString(),
  });

  if (product.inventory <= 5) {
    dashboardUpdate();
  }
}

export function productUpdated(product) {
  sendToAdmins("productUpdated", {
    productId: product.id,
    productName: product.name,
    price: product.price,
    inventory: product.inventory,
    timestamp: new Date().toISOString(),
  });

  sendToAll({
    type: "productUpdated",
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      active: product.active,
      imageUrl: product.imageUrl,
    },
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function productDeleted(productId) {
  sendToAdmins("productDeleted", {
    productId: productId,
    timestamp: new Date().toISOString(),
  });

  sendToAll({
    type: "productDeleted",
    data: {
      productId: productId,
    },
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function lowStock(product) {
  sendToAdmins("lowStock", {
    sku: product.id.toString(),
    productId: product.id,
    productName: product.name,
    stock: product.inventory,
    timestamp: new Date().toISOString(),
  });

  dashboardUpdate();
}

export function cartUpdated(userId, cartData) {
  sendToUser(userId, {
    type: "cartSync",
    data: cartData,
    timestamp: new Date().toISOString(),
  });
}

export function notify(target, eventType, data, refreshMetrics = false) {
  const payload = {
    type: eventType,
    data: data,
    timestamp: new Date().toISOString(),
  };

  if (target === "all") {
    sendToAll(payload);
  } else if (target === "admins") {
    sendToAdmins(eventType, data);
  } else if (typeof target === "number") {
    sendToUser(target, payload);
  }
  if (refreshMetrics) {
    dashboardUpdate();
  }
}
