// Test script for the complete workflow
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testCompleteWorkflow() {
  try {
    console.log('🚀 Testing Complete Workflow...\n');

    // Step 1: Create a product
    console.log('📦 Step 1: Creating a product...');
    const productResponse = await fetch(`${API_BASE}/create-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Product for Checkout Links',
        description: 'A test product created for demonstrating the checkout link workflow'
      })
    });
    
    const productData = await productResponse.json();
    if (!productData.success) {
      throw new Error(`Failed to create product: ${productData.message}`);
    }
    
    console.log('✅ Product created:', productData.data.id);
    console.log('   Title:', productData.data.title);

    // Step 2: Create multiple checkout links
    console.log('\n🔗 Step 2: Creating 10 checkout links...');
    const checkoutResponse = await fetch(`${API_BASE}/create-multiple-checkout-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productData.data.id,
        count: 10
      })
    });
    
    const checkoutData = await checkoutResponse.json();
    if (!checkoutData.success) {
      throw new Error(`Failed to create checkout links: ${checkoutData.message}`);
    }
    
    console.log(`✅ Created ${checkoutData.data.length} checkout links`);
    console.log('   Internal names:');
    checkoutData.data.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.internalName} - $${link.price}`);
    });

    // Step 3: Test tracking (using the first internal name)
    if (checkoutData.data.length > 0) {
      const firstInternalName = checkoutData.data[0].internalName;
      console.log(`\n📊 Step 3: Testing tracking for "${firstInternalName}"...`);
      
      const trackingResponse = await fetch(`${API_BASE}/track-checkout-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internalName: firstInternalName,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
      });
      
      const trackingData = await trackingResponse.json();
      if (!trackingData.success) {
        throw new Error(`Failed to track checkout links: ${trackingData.message}`);
      }
      
      console.log(`✅ Found ${trackingData.data.length} receipts for "${firstInternalName}"`);
    }

    console.log('\n🎉 Complete workflow test finished successfully!');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCompleteWorkflow();
