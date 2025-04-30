import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state
const mockState = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  complianceRecords: new Map(),
  blockHeight: 100
};

// Helper function to create compliance key
const createComplianceKey = (shipper, materialId, shipmentId) => {
  return `${shipper}|${materialId}|${shipmentId}`;
};

// Mock contract functions
const mockContract = {
  verifyCompliance: (shipper, materialId, shipmentId, isCompliant, notes) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    const complianceKey = createComplianceKey(shipper, materialId, shipmentId);
    
    mockState.complianceRecords.set(complianceKey, {
      isCompliant,
      verificationDate: mockState.blockHeight,
      verifier: mockState.admin,
      notes
    });
    
    return { success: true };
  },
  
  isShipmentCompliant: (shipper, materialId, shipmentId) => {
    const complianceKey = createComplianceKey(shipper, materialId, shipmentId);
    const complianceData = mockState.complianceRecords.get(complianceKey);
    
    if (!complianceData) return false;
    
    return complianceData.isCompliant;
  },
  
  getComplianceRecord: (shipper, materialId, shipmentId) => {
    const complianceKey = createComplianceKey(shipper, materialId, shipmentId);
    return mockState.complianceRecords.get(complianceKey) || null;
  },
  
  transferAdmin: (newAdmin) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.admin = newAdmin;
    return { success: true };
  }
};

describe('Compliance Verification Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    mockState.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockState.complianceRecords = new Map();
    mockState.blockHeight = 100;
  });
  
  it('should verify compliance for a shipment', () => {
    const result = mockContract.verifyCompliance(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456',
        true,
        'All regulations followed'
    );
    
    expect(result.success).toBe(true);
    expect(mockContract.isShipmentCompliant(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456'
    )).toBe(true);
  });
  
  it('should mark non-compliant shipments', () => {
    mockContract.verifyCompliance(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456',
        false,
        'Missing proper documentation'
    );
    
    expect(mockContract.isShipmentCompliant(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456'
    )).toBe(false);
  });
  
  it('should retrieve compliance records', () => {
    mockContract.verifyCompliance(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456',
        true,
        'All regulations followed'
    );
    
    const record = mockContract.getComplianceRecord(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ACID-123',
        'SHIP-456'
    );
    
    expect(record).not.toBeNull();
    expect(record.notes).toBe('All regulations followed');
    expect(record.isCompliant).toBe(true);
  });
  
  it('should return null for non-existent compliance records', () => {
    const record = mockContract.getComplianceRecord(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'NONEXISTENT',
        'SHIP-456'
    );
    
    expect(record).toBeNull();
  });
});
