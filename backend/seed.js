/**
 * seed.js
 * Run this ONCE to load your existing product catalog (from your old
 * products.js file) into the database, so the admin panel has something
 * to show and edit right away.
 *
 * Usage:  node seed.js
 *
 * Safe to run multiple times — it clears and re-inserts products each
 * time, so don't run it again after you've started editing products
 * through the admin panel (you'd lose those edits).
 */
const db = require('./db');

const PRODUCTS = [
    {
        id: 1,
        name: "Argentina Premium Player Edition",
        cat: "jerseys",
        catLabel: "Jersey",
        price: 1199,
        oldPrice: 1700,
        badge: "Best Seller",
        images: [
            "img/Arg premium Players2.jpeg",
            "img/Arg Premium 3.jpeg",
            "img/Arg Premium 4.jpeg",
            "img/Arg Premium 5.jpeg"
        ],
        description: "Player-edition fit with sweat-wicking fabric and embroidered crest. Lightweight mesh panels keep you cool on game day or off the pitch.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },
    {
        id: 2,
        name: "Brazil Premium Player Edition",
        cat: "jerseys",
        catLabel: "Jersey",
        price: 1199,
        oldPrice: 1700,
        badge: "Best Seller",
        images: [
            "img/Brazil Premium Player.jpeg",
            "img/Brazil Premium 2.jpeg",
            "img/Brazil Premium 3.jpeg",
            "img/Brazil Premium 4.jpeg",
        ],
        description: "Iconic colourway, player-edition cut. Breathable fabric built for performance and street-style alike.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },
    {
        id: 3,
        name: "Germany Premium Player Edition",
        cat: "jerseys",
        catLabel: "Jersey",
        price: 1199,
        oldPrice: 1700,
        badge: "New",
        images: [
            "img/germany premuim player.jpeg",
            "img/Germany Player 2.jpeg",
            "img/Germary Player 4.jpeg",
            "img/Germany Player 3.jpeg"
        ],
        description: "Clean, sharp design with player-fit tailoring. A wardrobe staple for matchday and casual wear.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },
    {
        id: 4,
        name: "England Premium Player Edition",
        cat: "jerseys",
        catLabel: "Jersey",
        price: 1199,
        oldPrice: 1700,
        badge: "New",
        images: [
            "img/England Premium Player.jpeg",
            "img/England Preimum 2.jpeg",
            "img/England Player 2.jpeg",
            "img/England Player 3.jpeg"
        ],
        description: "Classic crest detailing on a modern player-fit jersey. Built to last, made to wear everywhere.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },

    /* ---------- Jerseys (custom) ---------- */
    {
        id: 301, name: "Argentina Terrace Kit", cat: "jerseys", catLabel: "Jersey", price: 999, oldPrice: 1300, badge: "Sale",
        images: ["img/Argentina Terrace Kit.jpeg", "img/Arg Terrace Kit 2.jpeg", "img/Arg Terracce Kit 3.jpeg"],
        description: " Premium player edition (Copy). Mesh-panelled away jersey with breathable performance fabric. Athletic fit through the body.",
        sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },

    {
        id: 302, name: "Argentina Away Kit", cat: "jerseys", catLabel: "Jersey", price: 1199, oldPrice: 1700, badge: "New",
        images: ["img/Arg Away Kit.jpeg", "img/Arg Away 2.jpeg", "img/Arg Away 3.jpeg", "img/Arg Away 4.jpeg"],
        description: "Signature home colourway with embroidered crest. Designed for matchday and street wear both.",
        sizes: ["S", "M", "L", "XL"], outOfStock: [""],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest" }
    },

    {
        id: 303, name: "Brazil Away Kit", cat: "jerseys", catLabel: "Jersey", price: 1199, oldPrice: 1700, badge: null,
        images: ["img/Brazil Away Kit.jpeg", "img/Brazil Away 2.jpeg", "img/Brazil Away 3.jpeg", "img/Brazil Away 4.jpeg"],
        description: "Retro-inspired mesh jersey with a relaxed athletic cut. A throwback look with modern comfort.",
        sizes: ["M", "L", "XL", "XXL"], outOfStock: [],
        sizeGuide: { M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },

    {
        id: 304, name: "Spain Away Kit", cat: "jerseys", catLabel: "Jersey", price: 1199, oldPrice: 1700, badge: "Sale",
        images: ["img/Spain Away KIt.jpeg", "img/Spain Home 2.jpeg", "img/spain home 3.jpeg", "img/Spain Home 4.jpeg"],
        description: "Statement jersey with gold-foil number detailing on the back. Premium feel, true-to-size fit.",
        sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },
    {
        id: 305, name: "France Home Kit", cat: "jerseys", catLabel: "Jersey", price: 1199, oldPrice: 1700, badge: "Sale",
        images: ["img/France Home Kit.jpeg", "img/france 2.jpeg", "img/france 3.jpeg", "img/france 4.jpeg",],
        description: "Statement jersey with gold-foil number detailing on the back. Premium feel, true-to-size fit.",
        sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
        sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    },

    // {
    //     id: 101, name: "Oversized Gold Tag Tee", cat: "tshirts", catLabel: "T-Shirt", price: 850, oldPrice: 1050, badge: "Best Seller",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+01"], description: "Heavyweight 240gsm cotton, oversized boxy fit.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [], sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },
    // {
    //     id: 102, name: "Essential Black Tee", cat: "tshirts", catLabel: "T-Shirt", price: 750, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+02"], description: "A no-fuss black tee built from soft, durable cotton.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: ["S"], sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 201, name: "Black Drop-Shoulder Tee", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1100, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+01"], description: "Relaxed drop-shoulder silhouette in solid black.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [], sizeGuide: { S: "38-40 in chest", M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest", XXL: "46-48 in chest" }
    // },

    // {
    //     id: 301, name: "Dripkits Away Jersey", cat: "jerseys", catLabel: "Jersey", price: 1450, oldPrice: 1800, badge: "Sale",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Jersey+01"], description: "Mesh-panelled away jersey with breathable performance fabric.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [], sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 401, name: "Limited Drop Tee", cat: "new", catLabel: "New Arrival", price: 950, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=New+01"], description: "Limited run tee, numbered print, premium cotton.",
    //     sizes: ["S", "M", "L", "XL"], outOfStock: [], sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest" }
    // }
];

const insert = db.prepare(`
  INSERT INTO products (id, name, cat, catLabel, price, oldPrice, badge, images, description, sizes, outOfStock, sizeGuide, active)
  VALUES (@id, @name, @cat, @catLabel, @price, @oldPrice, @badge, @images, @description, @sizes, @outOfStock, @sizeGuide, 1)
`);

db.exec('DELETE FROM products'); // clear before reseeding

const seedAll = db.transaction((items) => {
    for (const p of items) {
        insert.run({
            id: p.id,
            name: p.name,
            cat: p.cat,
            catLabel: p.catLabel,
            price: p.price,
            oldPrice: p.oldPrice ?? null,
            badge: p.badge ?? null,
            images: JSON.stringify(p.images),
            description: p.description,
            sizes: JSON.stringify(p.sizes),
            outOfStock: JSON.stringify(p.outOfStock || []),
            sizeGuide: JSON.stringify(p.sizeGuide || {})
        });
    }
});

seedAll(PRODUCTS);
console.log(`✅ Seeded ${PRODUCTS.length} products into dripkits.db`);
console.log('You can now add/edit more products through the admin panel.');