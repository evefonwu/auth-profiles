/**
 * Test Cases for lib/profile-utils.ts
 *
 * generateRandomAvatarUrl function:
 * - should generate DiceBear fun-emoji avatar URL
 * - should generate different URLs on multiple calls
 * - should return valid URL format
 *
 * generateInitials function:
 * - should generate initials from single name
 * - should generate initials from full name
 * - should generate initials from multiple names
 * - should handle names with extra spaces
 * - should fall back to email initial when name is empty
 * - should fall back to email initial when name is whitespace
 * - should handle lowercase names and convert to uppercase
 * - should handle mixed case emails
 *
 * sanitizeProfileData function:
 * - should trim whitespace from full_name and avatar_url
 * - should handle empty strings
 * - should handle whitespace-only strings
 *
 * isValidAvatarUrl function:
 * - should return true for valid HTTP URLs
 * - should return true for valid HTTPS URLs
 * - should return true for empty string (optional field)
 * - should return true for whitespace-only string
 * - should return false for invalid protocols
 * - should return false for invalid URLs
 * - should return false for URLs without hostname
 * - should handle URLs with query parameters
 */

import {
  generateRandomAvatarUrl,
  generateInitials,
  sanitizeProfileData,
  isValidAvatarUrl,
} from "@/lib/profile-utils";

describe("profile-utils", () => {
  describe("generateRandomAvatarUrl", () => {
    it("should generate DiceBear fun-emoji avatar URL", () => {
      const result = generateRandomAvatarUrl();
      expect(result).toMatch(/^https:\/\/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+$/);
    });

    it("should generate different URLs on multiple calls", () => {
      const result1 = generateRandomAvatarUrl();
      const result2 = generateRandomAvatarUrl();
      expect(result1).not.toBe(result2);
    });

    it("should return valid URL format", () => {
      const result = generateRandomAvatarUrl();
      expect(() => new URL(result)).not.toThrow();
    });
  });

  describe("generateInitials", () => {
    it("should generate initials from single name", () => {
      const result = generateInitials("John", "test@example.com");
      expect(result).toBe("J");
    });

    it("should generate initials from full name", () => {
      const result = generateInitials("John Doe", "test@example.com");
      expect(result).toBe("JD");
    });

    it("should generate initials from multiple names", () => {
      const result = generateInitials("John Michael Doe", "test@example.com");
      expect(result).toBe("JMD");
    });

    it("should handle names with extra spaces", () => {
      const result = generateInitials("John   Doe", "test@example.com");
      expect(result).toBe("JD");
    });

    it("should fall back to email initial when name is empty", () => {
      const result = generateInitials("", "test@example.com");
      expect(result).toBe("T");
    });

    it("should fall back to email initial when name is whitespace", () => {
      const result = generateInitials("   ", "test@example.com");
      expect(result).toBe("T");
    });

    it("should handle lowercase names and convert to uppercase", () => {
      const result = generateInitials("john doe", "test@example.com");
      expect(result).toBe("JD");
    });

    it("should handle mixed case emails", () => {
      const result = generateInitials("", "Test@Example.com");
      expect(result).toBe("T");
    });
  });

  describe("sanitizeProfileData", () => {
    it("should trim whitespace from full_name and avatar_url", () => {
      const input = {
        full_name: "  John Doe  ",
        avatar_url: "  https://example.com/avatar.jpg  ",
      };
      const result = sanitizeProfileData(input);

      expect(result).toEqual({
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
      });
    });

    it("should handle empty strings", () => {
      const input = {
        full_name: "",
        avatar_url: "",
      };
      const result = sanitizeProfileData(input);

      expect(result).toEqual({
        full_name: "",
        avatar_url: "",
      });
    });

    it("should handle whitespace-only strings", () => {
      const input = {
        full_name: "   ",
        avatar_url: "   ",
      };
      const result = sanitizeProfileData(input);

      expect(result).toEqual({
        full_name: "",
        avatar_url: "",
      });
    });
  });

  describe("isValidAvatarUrl", () => {
    it("should return true for valid HTTP URLs", () => {
      expect(isValidAvatarUrl("http://example.com/avatar.jpg")).toBe(true);
    });

    it("should return true for valid HTTPS URLs", () => {
      expect(isValidAvatarUrl("https://example.com/avatar.jpg")).toBe(true);
    });

    it("should return true for empty string (optional field)", () => {
      expect(isValidAvatarUrl("")).toBe(true);
    });

    it("should return true for whitespace-only string", () => {
      expect(isValidAvatarUrl("   ")).toBe(true);
    });

    it("should return false for invalid protocols", () => {
      expect(isValidAvatarUrl("ftp://example.com/avatar.jpg")).toBe(false);
      expect(isValidAvatarUrl("file:///path/to/avatar.jpg")).toBe(false);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidAvatarUrl("not-a-url")).toBe(false);
      expect(isValidAvatarUrl("://invalid-url")).toBe(false);
    });

    it("should return false for URLs without hostname", () => {
      expect(isValidAvatarUrl("https://")).toBe(false);
    });

    it("should handle URLs with query parameters", () => {
      expect(
        isValidAvatarUrl("https://ui-avatars.com/api/?name=John&size=128")
      ).toBe(true);
    });
  });
});
