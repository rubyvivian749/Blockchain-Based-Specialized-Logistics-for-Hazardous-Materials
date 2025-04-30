import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state
const mockState = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  materials: new Map(),
  blockHeight: 100
};

// Constants
const FLAMMABLE_LIQUID = 1;
const TOXIC_SUBSTANCE = 2;
const CORROSIVE = 3;
const RADIOACTIVE = 4;
const EXPLOSIVE = 5;

// Mock contract functions
const mockContract = {
  addMaterial: (materialId, hazardClass, handlingRequirements) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    if (hazardClass < 1 || hazardClass > 5) {
      return { error: 400 };
    }
    
    mockState.materials.set(materialId, {
      hazardClass,
      handlingRequirements,
      addedBy: mockState.admin,
      addedAt: mockState.blockHeight
    });
    
    return { success: true };
  },
  
  updateMaterial: (materialId, hazardClass, handlingRequirements) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    if (hazardClass < 1 || hazardClass > 5) {
      return { error: 400 };
    }
    
    if (!mockState.materials.has(materialId)) {
      return { error: 404 };
    }
    
    mockState.materials.set(materialId, {
      hazardClass,
      handlingRequirements,
      addedBy: mockState.admin,
      addedAt: mockState.blockHeight
    });
    
    return { success: true };
  },
  
  getMaterialDetails: (materialId) => {
    return mockState.materials.get(materialId) || null;
  },
  
  materialExists: (materialId) => {
    return mockState.materials.has(materialId);
  },
  
  transferAdmin: (newAdmin) => {
    if (mockState.admin !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { error: 403 };
    }
    
    mockState.admin = newAdmin;
    return { success: true };
  }
};

describe('Material Classification Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    mockState.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockState.materials = new Map();
    mockState.blockHeight = 100;
  });
  
  it('should add a material classification', () => {
    const result = mockContract.addMaterial(
        'ACID-123',
        CORROSIVE,
        'Requires specialized containment and handling'
    );
    
    expect(result.success).toBe(true);
    expect(mockContract.materialExists('ACID-123')).toBe(true);
    
    const material = mockContract.getMaterialDetails('ACID-123');
    expect(material.hazardClass).toBe(CORROSIVE);
  });
  
  it('should reject invalid hazard classes', () => {
    const result = mockContract.addMaterial(
        'INVALID-123',
        10, // Invalid class
        'Test'
    );
    
    expect(result.error).toBe(400);
    expect(mockContract.materialExists('INVALID-123')).toBe(false);
  });
  
  it('should update an existing material', () => {
    mockContract.addMaterial(
        'ACID-123',
        CORROSIVE,
        'Requires specialized containment'
    );
    
    const result = mockContract.updateMaterial(
        'ACID-123',
        CORROSIVE,
        'Updated handling requirements'
    );
    
    expect(result.success).toBe(true);
    
    const material = mockContract.getMaterialDetails('ACID-123');
    expect(material.handlingRequirements).toBe('Updated handling requirements');
  });
  
  it('should not update non-existent materials', () => {
    const result = mockContract.updateMaterial(
        'NONEXISTENT',
        CORROSIVE,
        'Test'
    );
    
    expect(result.error).toBe(404);
  });
});
