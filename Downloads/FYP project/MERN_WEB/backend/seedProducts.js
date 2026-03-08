const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config({ path: './config.env' });

const sampleProducts = [
    // Jewelry
    {
        name: "Handcrafted Silver Necklace",
        category: "Jewelry",
        price: 120,
        description: "Elegant sterling silver necklace with intricate detailing, perfect for any occasion.",
        images: ["https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500&q=80"],
        tags: ["silver", "necklace", "handmade"],
        stock: 15
    },
    {
        name: "Gold Plated Hoop Earrings",
        category: "Jewelry",
        price: 45,
        description: "Classic gold plated hoops that add a touch of sophistication to your look.",
        images: ["https://images.unsplash.com/photo-1635767798638-384372a812ad?w=500&q=80"],
        tags: ["gold", "earrings", "accessories"],
        stock: 25
    },
    {
        name: "Gemstone Bracelet",
        category: "Jewelry",
        price: 60,
        description: "A beautiful bracelet featuring semi-precious gemstones strung on high-quality elastic.",
        images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80"],
        tags: ["gemstone", "bracelet", "boho"],
        stock: 20
    },

    // Home Decor
    {
        name: "Rustic Wooden Wall Clock",
        category: "Home Decor",
        price: 85,
        description: "Hand-carved wooden wall clock with a rustic finish, ideal for farmhouse decor.",
        images: ["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&q=80"],
        tags: ["wood", "clock", "rustic"],
        stock: 10
    },
    {
        name: "Ceramic Flower Vase",
        category: "Home Decor",
        price: 35,
        description: "Minimalist ceramic vase, perfect for displaying fresh or dried flowers.",
        images: ["https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=500&q=80"],
        tags: ["ceramic", "vase", "minimalist"],
        stock: 30
    },
    {
        name: "Woven Macrame Wall Hanging",
        category: "Home Decor",
        price: 55,
        description: "Intricate macrame wall hanging made from natural cotton rope.",
        images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80"],
        tags: ["macrame", "wall art", "boho"],
        stock: 12
    },

    // Pottery
    {
        name: "Glazed Ceramic Mug",
        category: "Pottery",
        price: 28,
        description: "Hand-thrown ceramic mug with a beautiful blue glaze.",
        images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80"],
        tags: ["mug", "ceramic", "coffee"],
        stock: 50
    },
    {
        name: "Terra Cotta Planter",
        category: "Pottery",
        price: 40,
        description: "Breathable terra cotta planter with a drainage hole and matching saucer.",
        images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80"],
        tags: ["planter", "gardening", "terra cotta"],
        stock: 22
    },
    {
        name: "Hand-painted Serving Bowl",
        category: "Pottery",
        price: 65,
        description: "Large serving bowl featuring hand-painted floral designs.",
        images: ["https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=500&q=80"],
        tags: ["bowl", "serving", "painted"],
        stock: 8
    },

    // Clothing
    {
        name: "Organic Cotton T-Shirt",
        category: "Clothing",
        price: 30,
        description: "Soft, breathable organic cotton t-shirt available in earth tones.",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"],
        tags: ["cotton", "t-shirt", "sustainable"],
        stock: 100
    },
    {
        name: "Hand-knit Wool Scarf",
        category: "Clothing",
        price: 50,
        description: "Cozy wool scarf hand-knit in a chunky pattern for extra warmth.",
        images: ["https://images.unsplash.com/photo-1520903920248-0c9135086d9a?w=500&q=80"],
        tags: ["wool", "scarf", "winter"],
        stock: 18
    },
    {
        name: "Linen Dress",
        category: "Clothing",
        price: 90,
        description: "Breezy linen dress with pockets, perfect for summer days.",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"],
        tags: ["linen", "dress", "summer"],
        stock: 14
    },

    // Accessories
    {
        name: "Leather Wallet",
        category: "Accessories",
        price: 55,
        description: "Genuine leather bifold wallet with multiple card slots.",
        images: ["https://images.unsplash.com/photo-1627123424574-1837309414f6?w=500&q=80"],
        tags: ["leather", "wallet", "men"],
        stock: 40
    },
    {
        name: "Canvas Tote Bag",
        category: "Accessories",
        price: 25,
        description: "Durable canvas tote bag with reinforced handles, great for shopping.",
        images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80"],
        tags: ["bag", "tote", "canvas"],
        stock: 60
    },
    {
        name: "Beaded Keychain",
        category: "Accessories",
        price: 15,
        description: "Colorful beaded keychain handmade by local artisans.",
        images: ["https://images.unsplash.com/photo-1582562124811-ba7f66639c59?w=500&q=80"],
        tags: ["keychain", "beads", "colorful"],
        stock: 80
    },

    // Bath & Body
    {
        name: "Lavender Soap Bar",
        category: "Bath & Body",
        price: 8,
        description: "Natural handmade soap bar infused with relaxing lavender essential oil.",
        images: ["https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&q=80"],
        tags: ["soap", "lavender", "natural"],
        stock: 200
    },
    {
        name: "Shea Butter Body Lotion",
        category: "Bath & Body",
        price: 18,
        description: "Rich body lotion made with organic shea butter for deep hydration.",
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"],
        tags: ["lotion", "shea butter", "skincare"],
        stock: 45
    },
    {
        name: "Soy Wax Candle",
        category: "Home Decor",
        price: 22,
        description: "Hand-poured soy wax candle with a crackling wood wick.",
        images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80"],
        tags: ["candle", "soy", "home fragrance"],
        stock: 35
    },

    // Art & Prints
    {
        name: "Abstract Canvas Painting",
        category: "Art & Prints",
        price: 250,
        description: "Original abstract acrylic painting on stretched canvas.",
        images: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&q=80"],
        tags: ["art", "painting", "abstract"],
        stock: 1
    },
    {
        name: "Botanical Print Set",
        category: "Art & Prints",
        price: 40,
        description: "Set of 3 botanical prints on high-quality archival paper.",
        images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80"],
        tags: ["prints", "botanical", "wall art"],
        stock: 50
    },
    {
        name: "Watercolor Landscape",
        category: "Art & Prints",
        price: 150,
        description: "Original watercolor painting depicting a serene mountain landscape.",
        images: ["https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=500&q=80"],
        tags: ["watercolor", "landscape", "art"],
        stock: 1
    },

    // Additional Products to reach 30-40 range
    {
        name: "Copper Wire Wrapped Ring",
        category: "Jewelry",
        price: 20,
        description: "Unique ring made from twisted copper wire.",
        images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80"],
        tags: ["copper", "ring", "wire wrap"],
        stock: 30
    },
    {
        name: "Embroidered Cushion Cover",
        category: "Home Decor",
        price: 35,
        description: "Cotton cushion cover with colorful floral embroidery.",
        images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&q=80"],
        tags: ["cushion", "embroidery", "decor"],
        stock: 25
    },
    {
        name: "Hand-carved Wooden Spoon",
        category: "Kitchen",
        price: 18,
        description: "Durable wooden spoon carved from cherry wood.",
        images: ["https://images.unsplash.com/photo-1588729584288-2c26027c427e?w=500&q=80"],
        tags: ["spoon", "wood", "kitchen"],
        stock: 40
    },
    {
        name: "Silk Scarf",
        category: "Clothing",
        price: 45,
        description: "Luxurious silk scarf with a hand-dyed pattern.",
        images: ["https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=500&q=80"],
        tags: ["silk", "scarf", "luxury"],
        stock: 20
    },
    {
        name: "Leather Belt",
        category: "Accessories",
        price: 40,
        description: "Sturdy leather belt with a brass buckle.",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"],
        tags: ["belt", "leather", "classic"],
        stock: 35
    },
    {
        name: "Bath Bomb Set",
        category: "Bath & Body",
        price: 25,
        description: "Set of 6 fizzy bath bombs with assorted scents.",
        images: ["https://images.unsplash.com/photo-1632707663360-1e5287f7db9b?w=500&q=80"],
        tags: ["bath bomb", "gift set", "relax"],
        stock: 60
    },
    {
        name: "Succulent Terrarium",
        category: "Home Decor",
        price: 45,
        description: "Glass geometric terrarium planted with live succulents.",
        images: ["https://images.unsplash.com/photo-1453989130154-ca3204c56238?w=500&q=80"],
        tags: ["terrarium", "succulents", "plants"],
        stock: 15
    },
    {
        name: "Handmade Paper Journal",
        category: "Art & Prints",
        price: 20,
        description: "Journal with recycled handmade paper and a leather cover.",
        images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80"],
        tags: ["journal", "writing", "handmade"],
        stock: 45
    },
    {
        name: "Bamboo Cutting Board",
        category: "Kitchen",
        price: 30,
        description: "Eco-friendly bamboo cutting board with a juice groove.",
        images: ["https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500&q=80"],
        tags: ["cutting board", "bamboo", "kitchen"],
        stock: 30
    },
    {
        name: "Silver Stacking Rings",
        category: "Jewelry",
        price: 25,
        description: "Set of 3 thin silver rings meant to be worn together.",
        images: ["https://images.unsplash.com/photo-1622398925373-3f6c69566956?w=500&q=80"],
        tags: ["rings", "stacking", "silver"],
        stock: 40
    },
    {
        name: "Beeswax Wrap Set",
        category: "Kitchen",
        price: 22,
        description: "Reusable beeswax food wraps, a sustainable alternative to plastic wrap.",
        images: ["https://images.unsplash.com/photo-1615392072175-927b2e35b719?w=500&q=80"],
        tags: ["beeswax", "sustainable", "kitchen"],
        stock: 55
    },
    {
        name: "Crystal Pendant",
        category: "Jewelry",
        price: 35,
        description: "Raw crystal point pendant on a gold chain.",
        images: ["https://images.unsplash.com/photo-1618331835717-801e976710b2?w=500&q=80"],
        tags: ["crystal", "pendant", "necklace"],
        stock: 25
    },
    {
        name: "Macrame Plant Hanger",
        category: "Home Decor",
        price: 28,
        description: "Boho style macrame plant hanger, suitable for various pot sizes.",
        images: ["https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&q=80"],
        tags: ["macrame", "plant hanger", "boho"],
        stock: 35
    }
];

// Shuffle array helper
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get all vendors
        const vendors = await User.find({ role: 'vendor', isActive: true });

        if (vendors.length === 0) {
            console.log('No vendors found!');
            process.exit(1);
        }

        console.log(`Found ${vendors.length} vendors`);

        let totalAdded = 0;

        for (const vendor of vendors) {
            console.log(`Processing vendor: ${vendor.name}`);

            // Delete existing products for this vendor (optional, but keeps things clean)
            await Product.deleteMany({ vendor: vendor._id });
            console.log(`  Cleared existing products`);

            // Shuffle and pick a random subset of products (e.g., 20-35 products)
            const shuffledProducts = shuffleArray([...sampleProducts]);
            const numProducts = Math.floor(Math.random() * 16) + 20; // 20 to 35 products
            const selectedProducts = shuffledProducts.slice(0, numProducts);

            const productsWithVendor = selectedProducts.map(product => ({
                ...product,
                name: `${product.name}`, // Keep original name or customize if needed
                vendor: vendor._id,
                vendorName: vendor.name,
                rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating 3.5 - 5.0
                reviewCount: Math.floor(Math.random() * 100),
                stock: Math.floor(Math.random() * 50) + 10
            }));

            await Product.insertMany(productsWithVendor);
            console.log(`  Added ${productsWithVendor.length} products`);
            totalAdded += productsWithVendor.length;
        }

        console.log(`Successfully added ${totalAdded} products across all vendors`);
        process.exit(0);

    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
