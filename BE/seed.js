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
    const testUserId = testUser[0].id;
    const adminUserId = adminUser[0].id;

    console.log("Creating products...");
    const productResults = await db
      .insert(schema.products)
      .values([
        {
          name: "Apple iPhone 16 Pro 128GB Black Titanium",
          description:
            "iPhone 16 Pro s čipom A18 Pro, 128GB úložisko, dizajn Black Titanium, pokročilý Pro kamerový systém s 5x teleobjektívom.",
          price: 119900,
          inventory: 25,
          imageUrl:
            "https://img-cdn.heureka.group/v1/1fdfe0cb-e346-4e27-a336-a0683de7e7b8.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Apple Macbook Air 2020 Space Grey",
          description:
            "MacBook Air s čipom M1, 13,3-palcový Retina displej, Space Grey povrchová úprava, 8GB pamäť, 256GB SSD úložisko.",
          price: 99900,
          inventory: 15,
          imageUrl:
            "https://img-cdn.heureka.group/v1/2d2174ba-95c5-4714-bf8e-a038f425f394.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Apple iPad 10.9 (2024) 64GB Wi-Fi Blue",
          description:
            "iPad 10,9-palcový s čipom A14 Bionic, 64GB úložisko, Wi-Fi model v krásnej modrej farbe, ideálny pre kreativitu a produktivitu.",
          price: 37900,
          inventory: 30,
          imageUrl:
            "https://img-cdn.heureka.group/v1/288c7f7f-eeb9-45a7-949e-104926adc440.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Xiaomi Mi TV Box S",
          description:
            "Android TV streamovacie zariadenie s 4K HDR podporou, Google Assistant a prístupom k tisíckam aplikácií z Google Play Store.",
          price: 5900,
          inventory: 50,
          imageUrl:
            "https://img-cdn.heureka.group/v1/120d6845-11df-4c2c-b5cf-d05f840c16cd.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Apple AirTag (1 Pack)",
          description:
            "Presné vyhľadávacie zariadenie s Ultra Wideband technológiou, vymeniteľnou batériou a bezproblémovou integráciou s Find My sieťou.",
          price: 2900,
          inventory: 100,
          imageUrl:
            "https://img-cdn.heureka.group/v1/dcfc092c-531b-449a-83f7-e2adb874a19a.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "WD Elements Portable 2TB",
          description:
            "Prenosný externý pevný disk s kapacitou 2TB, USB 3.0 pripojenie, jednoduché nastavenie plug-and-play a spoľahlivé úložisko dát.",
          price: 7900,
          inventory: 40,
          imageUrl:
            "https://img-cdn.heureka.group/v1/84a70796-569f-4251-a757-aa4b7a51e99b.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Lenovo V15 G4",
          description:
            "Obchodný notebook s AMD Ryzen procesorom, 15,6-palcový displej, 8GB RAM, 256GB SSD, ideálny pre kancelársku prácu a produktivitu.",
          price: 54900,
          inventory: 20,
          imageUrl:
            "https://img-cdn.heureka.group/v1/1cf8b04f-ece5-4a7e-bd54-b66a014a0ed4.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Asus TUF Gaming A15",
          description:
            "Herný notebook s AMD Ryzen procesorom, NVIDIA GeForce RTX grafikou, 15,6-palcový 144Hz displej, 16GB RAM, 512GB SSD.",
          price: 89900,
          inventory: 12,
          imageUrl:
            "https://img-cdn.heureka.group/v1/138d4a00-0744-4224-926c-b443da1d0368.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Asus Vivobook 15",
          description:
            "Každodenný notebook s Intel Core procesorom, 15,6-palcový displej, 8GB RAM, 256GB SSD, elegantný dizajn pre bežné výpočtové potreby.",
          price: 49900,
          inventory: 25,
          imageUrl:
            "https://img-cdn.heureka.group/v1/34622d85-726e-4ada-ace3-a8885ea881ab.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Xiaomi Redmi Note 14 5G 8GB/256GB Midnight Black",
          description:
            "5G smartfón s 8GB RAM, 256GB úložiskom, 108MP kamerovým systémom, 5000mAh batériou a rýchlym nabíjaním v farbe Midnight Black.",
          price: 29900,
          inventory: 35,
          imageUrl:
            "https://img-cdn.heureka.group/v1/93c2151a-52e0-473d-99ec-1c9b967749ab.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Samsung Galaxy S25 12GB/128GB",
          description:
            "Vlajkový smartfón so Snapdragon procesorom, 12GB RAM, 128GB úložiskom, pokročilým kamerovým systémom a One UI rozhraním.",
          price: 89900,
          inventory: 18,
          imageUrl:
            "https://img-cdn.heureka.group/v1/294eb7f5-6069-4f09-89f2-05642c11b953.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Dell Alienware AW3423DWF",
          description:
            "34-palcový zakrivený QD-OLED herný monitor s 175Hz obnovovacou frekvenciou, NVIDIA G-SYNC kompatibilitou a úžasnou vizuálnou kvalitou.",
          price: 119900,
          inventory: 8,
          imageUrl:
            "https://img-cdn.heureka.group/v1/671f7b6a-74e4-47d9-9379-56ba3e4559c5.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Philips 243V7QJABF",
          description:
            "24-palcový Full HD IPS monitor s ultra-tenkým dizajnom, technológiou bez blikania a viacerými možnosťami pripojenia.",
          price: 12900,
          inventory: 45,
          imageUrl:
            "https://img-cdn.heureka.group/v1/a68526d0-98c8-4ab1-987c-b755b5f25e14.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Sony Alpha A7 III",
          description:
            "Plnoformátový bezspätnový fotoaparát s 24,2MP senzorom, 4K video nahrávaním, 5-osovou stabilizáciou obrazu a profesionálnymi funkciami.",
          price: 199900,
          inventory: 6,
          imageUrl:
            "https://img-cdn.heureka.group/v1/9b08f51a-e664-408c-8a3f-ec18d6c5c844.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "Canon PowerShot SX740 HS",
          description:
            "Kompaktný digitálny fotoaparát s 40x optickým zoomom, 4K videom, Wi-Fi pripojením a výkonným spracovaním obrazu.",
          price: 39900,
          inventory: 22,
          imageUrl:
            "https://img-cdn.heureka.group/v1/0545c5de-db8c-4000-aaa4-45d4faa21c95.jpg?width=2000&height=2000&fit=upsize",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: "JBL Wave Beam",
          description:
            "Slúchadlá s kvalitným zvukom JBL Deep Bass dokonale padnú do uší.",
          price: 50000,
          inventory: 0,
          imageUrl:
            "https://img-cdn.heureka.group/v1/8f78e7b5-8f3e-41bd-8671-cb49393520cb.jpg?width=2000&height=2000&fit=upsize",
          active: false,
          createdAt: new Date(
            Date.now() - 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ])
      .returning();

    console.log("Database seeding completed successfully!");
    console.log("\nCreated test accounts:");
    console.log("- Username: test, Password: password123 (regular user)");
    console.log("- Username: admin, Password: admin123 (admin user)");
    console.log("\nCreated 16 products (15 active, 1 inactive):");
    console.log(
      "- Electronics: Smartphones, Laptops, Tablets, Monitors, Cameras"
    );
    console.log(
      "- Accessories: Storage devices, Streaming devices, Tracking devices"
    );
    console.log(
      "- Brands: Apple, Samsung, Xiaomi, Asus, Lenovo, Dell, Sony, Canon, WD, Philips"
    );
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
