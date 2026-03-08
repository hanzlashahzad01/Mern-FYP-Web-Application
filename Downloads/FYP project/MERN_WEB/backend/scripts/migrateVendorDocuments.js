const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  migrateVendorDocuments();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function migrateVendorDocuments() {
  try {
    console.log('🔍 Finding vendors with document issues...');
    
    // Find vendors with documents that have just filenames (no path separators)
    const vendors = await User.find({
      role: 'vendor',
      'vendorDetails.documents': { $exists: true, $ne: [] }
    });

    console.log(`📊 Found ${vendors.length} vendors with documents`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const vendor of vendors) {
      if (!vendor.vendorDetails.documents) continue;

      let hasChanges = false;
      const updatedDocuments = [];

      for (const doc of vendor.vendorDetails.documents) {
        // Check if document has just filename (no path separators)
        if (!doc.filePath.includes('/') && !doc.filePath.includes('\\')) {
          console.log(`⚠️  Found broken document: ${doc.fileName} (${doc.filePath})`);
          
          // Try to find the file in common upload directories
          const possiblePaths = [
            `uploads/products/${doc.filePath}`,
            `uploads/profiles/${doc.filePath}`,
            `uploads/banners/${doc.filePath}`,
            `uploads/gallery/${doc.filePath}`,
            `uploads/${doc.filePath}`
          ];

          let foundPath = null;
          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              foundPath = possiblePath.replace('uploads/', '');
              console.log(`✅ Found file at: ${foundPath}`);
              break;
            }
          }

          if (foundPath) {
            // Update the document with the correct path
            updatedDocuments.push({
              ...doc.toObject(),
              filePath: foundPath
            });
            hasChanges = true;
            migratedCount++;
          } else {
            // File not found, mark as missing
            updatedDocuments.push({
              ...doc.toObject(),
              filePath: `MISSING-${doc.filePath}`,
              isMissing: true
            });
            hasChanges = true;
            console.log(`❌ File not found: ${doc.fileName}`);
            errorCount++;
          }
        } else {
          // Document already has proper path
          updatedDocuments.push(doc.toObject());
        }
      }

      if (hasChanges) {
        // Update the vendor with corrected document paths
        await User.findByIdAndUpdate(vendor._id, {
          'vendorDetails.documents': updatedDocuments
        });
        console.log(`✅ Updated vendor: ${vendor.name}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} documents`);
    console.log(`❌ Files not found: ${errorCount} documents`);
    console.log(`📊 Total vendors processed: ${vendors.length}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}
