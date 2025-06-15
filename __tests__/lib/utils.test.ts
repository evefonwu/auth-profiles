/**
 * Test Cases for lib/utils.ts
 *
 * cn function:
 * - should merge class names correctly
 * - should handle conditional classes
 * - should handle Tailwind CSS conflicts by preferring later classes
 * - should handle empty inputs
 * - should handle undefined and null values
 * - should handle arrays of classes
 * - should handle object notation for conditional classes
 * - should handle complex mixed inputs
 */

import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("bg-red-500", "text-white");
      expect(result).toBe("bg-red-500 text-white");
    });

    it("should handle conditional classes", () => {
      const result = cn(
        "base-class",
        true && "conditional-class",
        false && "hidden-class"
      );
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle Tailwind CSS conflicts by preferring later classes", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toBe("bg-blue-500");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "other-class");
      expect(result).toBe("base-class other-class");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle object notation for conditional classes", () => {
      const result = cn({
        active: true,
        disabled: false,
        highlight: true,
      });
      expect(result).toBe("active highlight");
    });

    it("should handle complex mixed inputs", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn(
        "btn",
        "px-4 py-2",
        {
          "bg-blue-500": isActive,
          "bg-gray-300": isDisabled,
          "text-white": isActive,
        },
        isActive && "hover:bg-blue-600",
        ["rounded-md", "shadow-sm"]
      );

      expect(result).toBe(
        "btn px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md shadow-sm"
      );
    });
  });
});
