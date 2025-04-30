import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state
const mockState = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  approvedRoutes: new Map(),
  blockHeight: 100
};

// Helper function to create route key
const createRouteKey = (origin, destination, materialId) => {
  return `${origin}|${destination}|${materialId}`;
};

// Mock contract functions
const mockContract = {
  addApprovedRoute: (origin, destination, materialId, expirationDate, restrictions) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    const routeKey = createRouteKey(origin, destination, materialId);
    
    mockState.approvedRoutes.set(routeKey, {
      isApproved: true,
      approvalDate: mockState.blockHeight,
      expirationDate,
      restrictions
    });
    
    return { success: true };
  },
  
  isRouteApproved: (origin, destination, materialId) => {
    const routeKey = createRouteKey(origin, destination, materialId);
    const routeData = mockState.approvedRoutes.get(routeKey);
    
    if (!routeData) return false;
    
    return routeData.isApproved && mockState.blockHeight <= routeData.expirationDate;
  },
  
  getRouteDetails: (origin, destination, materialId) => {
    const routeKey = createRouteKey(origin, destination, materialId);
    return mockState.approvedRoutes.get(routeKey) || null;
  },
  
  revokeRouteApproval: (origin, destination, materialId) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    const routeKey = createRouteKey(origin, destination, materialId);
    mockState.approvedRoutes.delete(routeKey);
    
    return { success: true };
  },
  
  transferAdmin: (newAdmin) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.admin = newAdmin;
    return { success: true };
  }
};

describe('Route Approval Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    mockState.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockState.approvedRoutes = new Map();
    mockState.blockHeight = 100;
  });
  
  it('should add an approved route', () => {
    const result = mockContract.addApprovedRoute(
        'New York',
        'Boston',
        'ACID-123',
        200,
        'Avoid populated areas'
    );
    
    expect(result.success).toBe(true);
    expect(mockContract.isRouteApproved('New York', 'Boston', 'ACID-123')).toBe(true);
  });
  
  it('should not approve expired routes', () => {
    mockContract.addApprovedRoute(
        'New York',
        'Boston',
        'ACID-123',
        50, // Expired (block height 100 > expiration 50)
        'Avoid populated areas'
    );
    
    expect(mockContract.isRouteApproved('New York', 'Boston', 'ACID-123')).toBe(false);
  });
  
  it('should revoke route approval', () => {
    mockContract.addApprovedRoute(
        'New York',
        'Boston',
        'ACID-123',
        200,
        'Avoid populated areas'
    );
    
    const result = mockContract.revokeRouteApproval('New York', 'Boston', 'ACID-123');
    
    expect(result.success).toBe(true);
    expect(mockContract.isRouteApproved('New York', 'Boston', 'ACID-123')).toBe(false);
  });
  
  it('should retrieve route details', () => {
    mockContract.addApprovedRoute(
        'New York',
        'Boston',
        'ACID-123',
        200,
        'Avoid populated areas'
    );
    
    const routeDetails = mockContract.getRouteDetails('New York', 'Boston', 'ACID-123');
    
    expect(routeDetails).not.toBeNull();
    expect(routeDetails.restrictions).toBe('Avoid populated areas');
  });
});
