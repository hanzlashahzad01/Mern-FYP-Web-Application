const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const VendorProfile = require('./models/VendorProfile');

dotenv.config({ path: './config.env' });

const fixVendorProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get all vendors
        const vendors = await User.find({ role: 'vendor' });
        console.log(`Found ${vendors.length} users with role 'vendor'`);

        for (const vendor of vendors) {
            console.log(`Processing vendor: ${vendor.name} (${vendor._id})`);

            // Check if profile exists
            let profile = await VendorProfile.findOne({ userId: vendor._id });

            if (!profile) {
                console.log(`  No profile found for ${vendor.name}. Creating one...`);

                const shopName = vendor.vendorDetails?.businessName || `${vendor.name}'s Shop`;
                const bio = vendor.vendorDetails?.bio || `Welcome to ${shopName}! I am a passionate creator dedicated to bringing you high-quality, handcrafted items. Explore my collection and find something unique for yourself or a loved one.`;

                profile = new VendorProfile({
                    userId: vendor._id,
                    shopName: shopName,
                    bio: bio,
                    tagline: "Handcrafted with love",
                    specialties: ["Handmade", "Artisan", "Custom"],
                    profileImage: vendor.avatar || "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&q=80",
                    bannerImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80",
                    location: {
                        address: vendor.vendorDetails?.businessAddress?.street || "123 specific st",
                        city: vendor.vendorDetails?.businessAddress?.city || "Unknown City",
                        country: vendor.vendorDetails?.businessAddress?.country || "Pakistan"
                    },
                    isApproved: true,
                    isActive: true
                });

                await profile.save();
                console.log(`  Created profile for ${vendor.name}`);
            } else {
                console.log(`  Profile already exists for ${vendor.name}`);
            }

            // Ensure user has correct flags
            if (!vendor.hasVendorProfile || !vendor.vendorProfileId || vendor.vendorProfileId.toString() !== profile._id.toString()) {
                vendor.hasVendorProfile = true;
                vendor.vendorProfileId = profile._id;
                await vendor.save();
                console.log(`  Updated user flags for ${vendor.name}`);
            }
        }

        console.log('Finished processing all vendors');
        process.exit(0);

    } catch (err) {
        console.error('Error fixing vendor profiles:', err);
        process.exit(1);
    }
};

fixVendorProfiles();
