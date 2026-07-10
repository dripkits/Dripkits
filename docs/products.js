/* ============================================================
   DRIPKITS SHARED PRODUCT CATALOG
   Include this file (before cart.js) on every page that needs
   product data: Home, Mens, Product Detail page.
   Edit this single file to update products everywhere.
   ============================================================ */

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
    /* ---------- T-Shirts ---------- */
    // {
    //     id: 101, name: "Oversized Gold Tag Tee", cat: "tshirts", catLabel: "T-Shirt", price: 850, oldPrice: 1050, badge: "Best Seller",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+01", "https://placehold.co/600x720/141414/d4af37?text=Tee+01b", "https://placehold.co/600x720/0a0a0a/d4af37?text=Tee+01c"],
    //     description: "Heavyweight 240gsm cotton, oversized boxy fit, gold woven tag at the hem. Built for everyday streetwear rotation.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 102, name: "Essential Black Tee", cat: "tshirts", catLabel: "T-Shirt", price: 750, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+02", "https://placehold.co/600x720/141414/d4af37?text=Tee+02b"],
    //     description: "A no-fuss black tee built from soft, durable cotton. The base layer every wardrobe needs.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: ["S"],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 103, name: "Gold Stitch Pocket Tee", cat: "tshirts", catLabel: "T-Shirt", price: 800, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+03", "https://placehold.co/600x720/141414/d4af37?text=Tee+03b"],
    //     description: "Front pocket detail finished with contrast gold stitching. Regular fit, breathable cotton blend.",
    //     sizes: ["S", "M", "L", "XL"], outOfStock: [],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest" }
    // },

    // {
    //     id: 104, name: "Heavyweight Boxy Tee", cat: "tshirts", catLabel: "T-Shirt", price: 900, oldPrice: 1100, badge: "Sale",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+04", "https://placehold.co/600x720/141414/d4af37?text=Tee+04b"],
    //     description: "Drop-cut boxy silhouette in premium heavyweight cotton. Structured but still breathable.",
    //     sizes: ["M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 105, name: "Street Script Tee", cat: "tshirts", catLabel: "T-Shirt", price: 780, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+05", "https://placehold.co/600x720/141414/d4af37?text=Tee+05b"],
    //     description: "Bold script print on the chest, regular fit, soft-hand print that won't crack or fade quickly.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: ["XXL"],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // },

    // {
    //     id: 106, name: "Faded Wash Tee", cat: "tshirts", catLabel: "T-Shirt", price: 820, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Tee+06", "https://placehold.co/600x720/141414/d4af37?text=Tee+06b"],
    //     description: "Acid-washed finish for a worn-in look from day one. Soft, lived-in cotton feel.",
    //     sizes: ["S", "M", "L"], outOfStock: [],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest" }
    // },

    /* ---------- Drop-Shoulders ---------- */
    // {
    //     id: 201, name: "Black Drop-Shoulder Tee", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1100, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+01", "https://placehold.co/600x720/141414/d4af37?text=Drop+01b"],
    //     description: "Relaxed drop-shoulder silhouette in solid black. Heavyweight fabric drapes clean without losing shape.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { S: "38-40 in chest", M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest", XXL: "46-48 in chest" }
    // },

    // {
    //     id: 202, name: "Gold Trim Drop-Shoulder", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1150, oldPrice: 1400, badge: "Sale",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+02", "https://placehold.co/600x720/141414/d4af37?text=Drop+02b"],
    //     description: "Drop-shoulder cut finished with gold ribbed trim at the collar and cuffs for a premium touch.",
    //     sizes: ["M", "L", "XL", "XXL"], outOfStock: ["M"],
    //     sizeGuide: { M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest", XXL: "46-48 in chest" }
    // },

    // {
    //     id: 203, name: "Heavy Cotton Drop Tee", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1050, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+03", "https://placehold.co/600x720/141414/d4af37?text=Drop+03b"],
    //     description: "260gsm heavy cotton for a substantial, structured drape. Built to hold its shape wash after wash.",
    //     sizes: ["S", "M", "L", "XL"], outOfStock: [],
    //     sizeGuide: { S: "38-40 in chest", M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest" }
    // },

    // {
    //     id: 204, name: "Washed Grey Drop-Shoulder", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1100, oldPrice: null, badge: null,
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+04", "https://placehold.co/600x720/141414/d4af37?text=Drop+04b"],
    //     description: "Garment-washed grey tone with a soft broken-in texture. Relaxed drop-shoulder fit throughout.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { S: "38-40 in chest", M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest", XXL: "46-48 in chest" }
    // },

    // {
    //     id: 205, name: "Boxy Fit Drop-Shoulder", cat: "dropshoulders", catLabel: "Drop-Shoulder", price: 1200, oldPrice: null, badge: "Best Seller",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Drop+05", "https://placehold.co/600x720/141414/d4af37?text=Drop+05b"],
    //     description: "Our most-loved drop-shoulder cut — boxy through the body, clean lines, zero fuss.",
    //     sizes: ["M", "L", "XL"], outOfStock: [],
    //     sizeGuide: { M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest" }
    // },



    /* ---------- Shirts ---------- */
    // {
    //     id: 401, name: "Limited Drop Tee", cat: "shirts", catLabel: "New Arrival", price: 950, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Shirts+01", "https://placehold.co/600x720/141414/d4af37?text=Shirts+01b"],
    //     description: "Limited run tee, numbered print, premium cotton. Once it's gone, it's gone.",
    //     sizes: ["S", "M", "L", "XL"], outOfStock: [],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest" }
    // },

    // {
    //     id: 402, name: "Vol.2 Drop-Shoulder", cat: "shirts", catLabel: "New Arrival", price: 1180, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Shirts+02", "https://placehold.co/600x720/141414/d4af37?text=Shirts+02b"],
    //     description: "Second volume of our drop-shoulder line. Updated fit, same heavyweight cotton you trust.",
    //     sizes: ["M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { M: "40-42 in chest", L: "42-44 in chest", XL: "44-46 in chest", XXL: "46-48 in chest" }
    // },

    // {
    //     id: 403, name: "Away Kit V2 Jersey", cat: "Shirts", catLabel: "New Arrival", price: 1550, oldPrice: null, badge: "New",
    //     images: ["https://placehold.co/600x720/1a1a1a/d4af37?text=Shirts+03", "https://placehold.co/600x720/141414/d4af37?text=Shirts+03b"],
    //     description: "Second-edition away kit with updated panel design and breathable mesh side inserts.",
    //     sizes: ["S", "M", "L", "XL", "XXL"], outOfStock: [],
    //     sizeGuide: { S: "36-38 in chest", M: "38-40 in chest", L: "40-42 in chest", XL: "42-44 in chest", XXL: "44-46 in chest" }
    // }
];

/* ---------- Helper: get product by id ---------- */
function getProductById(id) {
    return PRODUCTS.find(p => p.id === Number(id));
}

/* ---------- Helper: get related products (same category, excluding itself) ---------- */
function getRelatedProducts(product, limit = 4) {
    return PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, limit);
}