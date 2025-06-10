import { db, runMigrations } from "./src/config/database.js";
import * as schema from "./src/models/schema.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Starting database seeding...");

  try {
    // Ensure migrations are run first
    await runMigrations();
    console.log("Migrations completed successfully");

    // Clear existing data (be careful in production!)
    console.log("Clearing existing data...");
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.cartItems);
    await db.delete(schema.carts);
    await db.delete(schema.products);
    await db.delete(schema.users);
    console.log("Existing data cleared");

    // Create users
    console.log("Creating users...");
    const testPasswordHash = await bcrypt.hash("password123", 10);
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const testUser = await db
      .insert(schema.users)
      .values({
        username: "test",
        passwordHash: testPasswordHash,
        role: "user",
        createdAt: new Date().toISOString(),
      })
      .returning();

    const adminUser = await db
      .insert(schema.users)
      .values({
        username: "admin",
        passwordHash: adminPasswordHash,
        role: "admin",
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Get user IDs from the returned results
    const testUserId = testUser[0].id;
    const adminUserId = adminUser[0].id; // Create products
    console.log("Creating products...");
    const productResults = await db
      .insert(schema.products)
      .values([
        {
          name: "MacBook Pro 14-inch",
          description:
            "Apple MacBook Pro with M3 chip, 14-inch Liquid Retina XDR display, 16GB memory, 512GB SSD storage.",
          price: 199900, // $1999.00 in cents
          inventory: 15,
          imageUrl: "https://example.com/macbook-pro-14.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "iPhone 15 Pro",
          description:
            "iPhone 15 Pro with A17 Pro chip, 128GB storage, Titanium design, Pro camera system.",
          price: 99900, // $999.00 in cents
          inventory: 25,
          imageUrl: "https://example.com/iphone-15-pro.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "AirPods Pro (2nd generation)",
          description:
            "Active Noise Cancellation, Transparency mode, Spatial Audio, MagSafe Charging Case.",
          price: 24900, // $249.00 in cents
          inventory: 50,
          imageUrl: "https://example.com/airpods-pro.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "iPad Air 11-inch",
          description:
            "iPad Air with M2 chip, 11-inch Liquid Retina display, 128GB Wi-Fi model.",
          price: 59900, // $599.00 in cents
          inventory: 30,
          imageUrl: "https://example.com/ipad-air-11.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Apple Watch Series 9",
          description:
            "GPS model, 45mm case, Sport Band, Health and fitness tracking.",
          price: 42900, // $429.00 in cents
          inventory: 8, // Low stock for testing inventory alerts
          imageUrl: "https://example.com/apple-watch-series-9.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Magic Mouse",
          description:
            "Wireless, rechargeable mouse with Multi-Touch surface and Lightning connector.",
          price: 7900, // $79.00 in cents
          inventory: 40,
          imageUrl: "https://example.com/magic-mouse.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Studio Display",
          description:
            "27-inch 5K Retina display, 12MP Ultra Wide camera, six-speaker sound system.",
          price: 159900, // $1599.00 in cents
          inventory: 5, // Low stock
          imageUrl: "https://example.com/studio-display.jpg",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Discontinued Laptop",
          description: "An old laptop model that's no longer available.",
          price: 50000, // $500.00 in cents
          inventory: 0,
          imageUrl: "https://example.com/old-laptop.jpg",
          active: false, // Inactive product for testing
          createdAt: new Date(
            Date.now() - 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 year ago
        },
      ])
      .returning();

    // Get product IDs for foreign key references
    const macbookId = productResults[0].id;
    const iphoneId = productResults[1].id;
    const airpodsId = productResults[2].id;
    const ipadId = productResults[3].id;
    const watchId = productResults[4].id;
    const mouseId = productResults[5].id;
    const displayId = productResults[6].id;
    const laptopId = productResults[7].id; // Create carts for users
    console.log("Creating user carts...");
    const testCart = await db
      .insert(schema.carts)
      .values({
        userId: testUserId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const adminCart = await db
      .insert(schema.carts)
      .values({
        userId: adminUserId,
        createdAt: new Date().toISOString(),
      })
      .returning(); // Add some items to test user's cart
    console.log("Adding items to test user cart...");
    await db.insert(schema.cartItems).values([
      {
        cartId: testCart[0].id, // test user's cart
        productId: airpodsId, // AirPods Pro
        quantity: 1,
      },
      {
        cartId: testCart[0].id, // test user's cart
        productId: mouseId, // Magic Mouse
        quantity: 2,
      },
    ]); // Create some sample orders
    console.log("Creating sample orders...");
    const order1 = await db
      .insert(schema.orders)
      .values({
        userId: testUserId,
        status: "delivered",
        shippingAddress: "123 Main St, Cityville, State 12345, USA",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      })
      .returning();

    const order2 = await db
      .insert(schema.orders)
      .values({
        userId: testUserId,
        status: "shipped",
        shippingAddress: "123 Main St, Cityville, State 12345, USA",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      })
      .returning();

    const order3 = await db
      .insert(schema.orders)
      .values({
        userId: adminUserId,
        status: "processing",
        shippingAddress: "456 Admin Ave, Admin City, State 67890, USA",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      })
      .returning();

    const order4 = await db
      .insert(schema.orders)
      .values({
        userId: testUserId,
        status: "pending",
        shippingAddress: "123 Main St, Cityville, State 12345, USA",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning(); // Add order items for the orders
    console.log("Adding order items...");
    await db.insert(schema.orderItems).values([
      // Order 1 (delivered) - iPhone 15 Pro
      {
        orderId: order1[0].id,
        productId: iphoneId, // iPhone 15 Pro
        quantity: 1,
        price: 99900,
      },
      {
        orderId: order1[0].id,
        productId: airpodsId, // AirPods Pro
        quantity: 1,
        price: 24900,
      },

      // Order 2 (shipped) - MacBook Pro
      {
        orderId: order2[0].id,
        productId: macbookId, // MacBook Pro
        quantity: 1,
        price: 199900,
      },
      {
        orderId: order2[0].id,
        productId: mouseId, // Magic Mouse
        quantity: 1,
        price: 7900,
      },

      // Order 3 (processing) - iPad Air
      {
        orderId: order3[0].id,
        productId: ipadId, // iPad Air
        quantity: 1,
        price: 59900,
      },

      // Order 4 (pending) - Apple Watch
      {
        orderId: order4[0].id,
        productId: watchId, // Apple Watch
        quantity: 1,
        price: 42900,
      },
      {
        orderId: order4[0].id,
        productId: airpodsId, // AirPods Pro
        quantity: 1,
        price: 24900,
      },
    ]);

    console.log("Database seeding completed successfully!");
    console.log("\nCreated test accounts:");
    console.log("- Username: test, Password: password123 (regular user)");
    console.log("- Username: admin, Password: admin123 (admin user)");
    console.log("\nCreated 8 products (7 active, 1 inactive)");
    console.log("Created 4 sample orders with different statuses");
    console.log("Added items to test user's cart");
    console.log("\nSome products have low inventory for testing alerts:");
    console.log("- Apple Watch Series 9: 8 units");
    console.log("- Studio Display: 5 units");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await main();
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
