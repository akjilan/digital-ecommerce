import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Product } from "./product.entity";
import type { CreateProductDto, UpdateProductDto } from "./dto/product.dto";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Demo seed data ───────────────────────────────────────────────────────────

const SEED_PRODUCTS: Omit<Product, "id" | "createdAt">[] = [
  {
    title: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    description:
      "Premium over-ear headphones with 40-hour battery life and active noise cancellation.",
    price: 299.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/headphones/800/600"],
    stock: 45,
    status: "active",
  },
  {
    title: "Mechanical Keyboard Pro",
    slug: "mechanical-keyboard-pro",
    description: "Compact TKL mechanical keyboard with Cherry MX switches and RGB backlighting.",
    price: 149.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/keyboard/800/600"],
    stock: 120,
    status: "active",
  },
  {
    title: "4K Ultra-Wide Monitor",
    slug: "4k-ultra-wide-monitor",
    description: "34-inch curved ultra-wide display with 144Hz refresh rate and HDR support.",
    price: 799.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/monitor/800/600"],
    stock: 18,
    status: "active",
  },
  {
    title: "Ergonomic Office Chair",
    slug: "ergonomic-office-chair",
    description: "Fully adjustable lumbar support chair designed for all-day comfort.",
    price: 449.0,
    currency: "USD",
    images: ["https://picsum.photos/seed/chair/800/600"],
    stock: 30,
    status: "active",
  },
  {
    title: "Smart Standing Desk",
    slug: "smart-standing-desk",
    description: "Electric height-adjustable desk with memory presets and cable management.",
    price: 599.0,
    currency: "USD",
    images: ["https://picsum.photos/seed/desk/800/600"],
    stock: 22,
    status: "active",
  },
  {
    title: "USB-C Hub 12-in-1",
    slug: "usb-c-hub-12-in-1",
    description: "Thunderbolt 4 hub with dual 4K HDMI, 100W PD, SD card reader, and Ethernet.",
    price: 89.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/hub/800/600"],
    stock: 200,
    status: "active",
  },
  {
    title: "Portable SSD 2TB",
    slug: "portable-ssd-2tb",
    description: "Rugged USB 3.2 Gen 2 SSD with 2000MB/s read speed and IP55 rating.",
    price: 179.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/ssd/800/600"],
    stock: 75,
    status: "active",
  },
  {
    title: "Webcam 4K Pro",
    slug: "webcam-4k-pro",
    description: "4K 30fps webcam with built-in ring light, auto-focus, and noise-cancelling mic.",
    price: 129.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/webcam/800/600"],
    stock: 60,
    status: "active",
  },
  {
    title: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description: "15W Qi2 fast wireless charger compatible with iPhone, Android, and AirPods.",
    price: 39.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/charger/800/600"],
    stock: 300,
    status: "active",
  },
  {
    title: "Smart Home Hub",
    slug: "smart-home-hub",
    description: "Matter-compatible hub supporting Zigbee, Z-Wave, and Thread protocols.",
    price: 129.0,
    currency: "USD",
    images: ["https://picsum.photos/seed/smarthome/800/600"],
    stock: 40,
    status: "active",
  },
  {
    title: "Gaming Mouse 16K DPI",
    slug: "gaming-mouse-16k-dpi",
    description: "Lightweight 58g gaming mouse with 16,000 DPI optical sensor and 70-hour battery.",
    price: 79.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/mouse/800/600"],
    stock: 150,
    status: "active",
  },
  {
    title: "Noise-Isolating Earbuds",
    slug: "noise-isolating-earbuds",
    description: "True wireless earbuds with 8-hour playtime, IPX5 water resistance, and ANC.",
    price: 119.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/earbuds/800/600"],
    stock: 90,
    status: "active",
  },
  {
    title: "Laptop Stand Aluminium",
    slug: "laptop-stand-aluminium",
    description: "Adjustable aluminium laptop stand with 6 height levels and foldable design.",
    price: 49.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/laptopstand/800/600"],
    stock: 180,
    status: "active",
  },
  {
    title: "Desk LED Lamp",
    slug: "desk-led-lamp",
    description:
      "Smart LED desk lamp with 5 colour temperatures, wireless charging base, and USB-A port.",
    price: 64.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/lamp/800/600"],
    stock: 110,
    status: "active",
  },
  {
    title: "Mechanical Numpad",
    slug: "mechanical-numpad",
    description: "Standalone wireless numpad with hot-swap sockets and per-key RGB.",
    price: 59.99,
    currency: "USD",
    images: ["https://picsum.photos/seed/numpad/800/600"],
    stock: 55,
    status: "draft",
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ProductsService {
  private readonly products: Map<string, Product> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    for (const p of SEED_PRODUCTS) {
      const id = randomUUID();
      this.products.set(id, { ...p, id, createdAt: new Date() });
    }
  }

  findAll(
    q?: string,
    page = 1,
    limit = 12,
  ): { data: Product[]; total: number; page: number; limit: number } {
    let all = Array.from(this.products.values()).filter((p) => p.status === "active");
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (p) => p.title.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower),
      );
    }
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  }

  findBySlug(slug: string): Product | undefined {
    for (const p of this.products.values()) {
      if (p.slug === slug) return p;
    }
    return undefined;
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  create(dto: CreateProductDto, ownerId?: string): Product {
    const id = randomUUID();
    const product: Product = {
      id,
      ownerId,
      title: dto.title,
      slug: slugify(dto.title),
      description: dto.description,
      price: dto.price,
      currency: dto.currency ?? "USD",
      images: dto.images ?? [],
      stock: dto.stock ?? 0,
      status: dto.status ?? "draft",
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  /** Return all products (all statuses) belonging to a specific user */
  findByOwner(ownerId: string): Product[] {
    return Array.from(this.products.values()).filter((p) => p.ownerId === ownerId);
  }

  update(id: string, dto: UpdateProductDto): Product | undefined {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated: Product = { ...existing, ...dto };
    this.products.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }
}

