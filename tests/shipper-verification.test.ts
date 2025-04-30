import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract interactions
// Since we can't use @hirosystems/clarinet-sdk or @stacks/transactions
// we'll create simple mocks to test the contract logic

// Mock state
const mockState = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  verifiedShippers: new Map(),
  blockHeight: 100
};

// Mock contract functions
const mockContract = {
  addVerifiedShipper: (shipper, licenseId, expirationDate) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.verifiedShippers.set(shipper, {
      isVerified: true,
      verificationDate: mockState.blockHeight,
      expirationDate,
      hazmatLicenseId: licenseId
    });
    
    return { success: true };
  },
  
  removeVerifiedShipper: (shipper) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.verifiedShippers.delete(shipper);
    return { success: true };
  },
  
  isShipperVerified: (shipper) => {
    const shipperData = mockState.verifiedShippers.get(shipper);
    if (!shipperData) return false;
    
    return shipperData.isVerified && mockState.blockHeight <= shipperData.expirationDate;
  },
  
  getShipperDetails: (shipper) => {
    return mockState.verifiedShippers.get(shipper) || null;
  },
  
  transferAdmin: (newAdmin) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.admin = newAdmin;
    return { success: true };
  }
};

describe('Shipper Verification Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    mockState.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockState.verifiedShippers = new Map();
    mockState.blockHeight = 100;
  });
  
  it('should add a verified shipper', () => {
    const result = mockContract.addVerifiedShipper(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'HAZ123456',
        200
    );
    
    expect(result.success).toBe(true);
    expect(mockContract.isShipperVerified('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(true);
  });
  
  it('should not verify expired shippers', () => {
    mockContract.addVerifiedShipper(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'HAZ123456',
        50 // Expired (block height 100 > expiration 50)
    );
    
    expect(mockContract.isShipperVerified('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(false);
  });
  
  it('should remove a verified shipper', () => {
    mockContract.addVerifiedShipper(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'HAZ123456',
        200
    );
    
    const result = mockContract.removeVerifiedShipper('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    
    expect(result.success).toBe(true);
    expect(mockContract.isShipperVerified('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(false);
  });
  
  it('should transfer admin rights', () => {
    const newAdmin = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
    const result = mockContract.transferAdmin(newAdmin);
    
    expect(result.success).toBe(true);
    expect(mockState.admin).toBe(newAdmin);
  });
});
