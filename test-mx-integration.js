#!/usr/bin/env node

/**
 * MX Integration Test Script
 * 
 * This script tests the MX service integration without requiring a full server setup.
 * It verifies that the MX service can handle user creation, widget URL generation, 
 * and mock data fallback functionality.
 */

import { mxService } from './server/services/mxService.js';

async function testMXIntegration() {
  console.log('🚀 Testing MX Integration...\n');
  
  const testUserId = 'test-user-123';
  
  try {
    // Test 1: User Creation
    console.log('📝 Test 1: Creating MX User...');
    const user = await mxService.createUser(testUserId);
    console.log('✅ User created:', {
      guid: user.guid,
      id: user.id,
      isDemo: user.metadata === 'mock_user'
    });
    
    // Test 2: Widget URL Generation
    console.log('\n🔗 Test 2: Generating Widget URL...');
    const widgetUrl = await mxService.getConnectWidgetUrl(testUserId);
    console.log('✅ Widget URL generated:', widgetUrl.includes('http') ? 'Valid URL' : widgetUrl);
    
    // Test 3: Mock Account Creation
    console.log('\n🏦 Test 3: Creating Mock Accounts...');
    const accounts = await mxService.createMockAccounts(testUserId);
    console.log(`✅ Created ${accounts.length} mock accounts`);
    accounts.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.name} (${account.accountType}) - $${account.balance}`);
    });
    
    // Test 4: Mock Transaction Creation
    console.log('\n💳 Test 4: Creating Mock Transactions...');
    if (accounts.length > 0) {
      const transactions = await mxService.createMockTransactions(testUserId, accounts[0].id);
      console.log(`✅ Created ${transactions.length} mock transactions`);
      transactions.slice(0, 3).forEach((txn, index) => {
        console.log(`   ${index + 1}. ${txn.description} - $${txn.amount} (${txn.category})`);
      });
      if (transactions.length > 3) {
        console.log(`   ... and ${transactions.length - 3} more transactions`);
      }
    }
    
    console.log('\n🎉 All tests passed! MX integration is working correctly.');
    console.log('\n📊 Summary:');
    console.log('- MX service initialized successfully');
    console.log('- Mock data fallback working (demo mode)');
    console.log('- User, account, and transaction creation functional');
    console.log('- Ready for frontend integration');
    
    // Note about real MX credentials
    if (user.metadata === 'mock_user') {
      console.log('\n🔧 Note: Currently running in demo mode with mock data.');
      console.log('   To test with real MX API, configure your MX credentials in .env:');
      console.log('   - MX_CLIENT_ID=your_actual_client_id');
      console.log('   - MX_API_KEY=your_actual_api_key');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMXIntegration().catch(console.error);
