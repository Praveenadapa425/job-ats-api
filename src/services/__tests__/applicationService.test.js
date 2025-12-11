// File: src/services/__tests__/applicationService.test.js

// Mock the email service to avoid Redis connection issues
jest.mock('../../services/emailService', () => ({
  sendStageUpdateNotification: jest.fn()
}));

const { isValidTransition, getValidNextStages } = require('../applicationService');

describe('Application Service', () => {
  describe('isValidTransition', () => {
    test('should allow valid transitions', () => {
      expect(isValidTransition('Applied', 'Screening')).toBe(true);
      expect(isValidTransition('Screening', 'Interview')).toBe(true);
      expect(isValidTransition('Interview', 'Offer')).toBe(true);
      expect(isValidTransition('Offer', 'Hired')).toBe(true);
    });

    test('should allow transition to Rejected from any stage', () => {
      expect(isValidTransition('Applied', 'Rejected')).toBe(true);
      expect(isValidTransition('Screening', 'Rejected')).toBe(true);
      expect(isValidTransition('Interview', 'Rejected')).toBe(true);
      expect(isValidTransition('Offer', 'Rejected')).toBe(true);
      expect(isValidTransition('Hired', 'Rejected')).toBe(true);
    });

    test('should reject invalid transitions', () => {
      expect(isValidTransition('Applied', 'Interview')).toBe(false);
      expect(isValidTransition('Applied', 'Offer')).toBe(false);
      expect(isValidTransition('Screening', 'Hired')).toBe(false);
    });
  });

  describe('getValidNextStages', () => {
    test('should return valid next stages for each stage', () => {
      expect(getValidNextStages('Applied')).toEqual(['Screening', 'Rejected']);
      expect(getValidNextStages('Screening')).toEqual(['Interview', 'Rejected']);
      expect(getValidNextStages('Interview')).toEqual(['Offer', 'Rejected']);
      expect(getValidNextStages('Offer')).toEqual(['Hired', 'Rejected']);
      expect(getValidNextStages('Hired')).toEqual(['Rejected']);
      expect(getValidNextStages('Rejected')).toEqual(['Rejected']);
    });
  });
});