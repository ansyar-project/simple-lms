import { cn } from "../utils";

describe("Utils", () => {
  describe("cn (className utility)", () => {
    it("should combine class names correctly", () => {
      const result = cn("class1", "class2", "class3");
      expect(result).toBe("class1 class2 class3");
    });
    it("should handle conditional classes", () => {
      const isVisible = true;
      const isHidden = false;
      const result = cn(
        "base",
        isVisible && "conditional",
        isHidden && "hidden"
      );
      expect(result).toBe("base conditional");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base", undefined, null, "valid");
      expect(result).toBe("base valid");
    });

    it("should handle empty strings", () => {
      const result = cn("base", "", "valid");
      expect(result).toBe("base valid");
    });

    it("should merge Tailwind classes correctly", () => {
      // Testing with overlapping Tailwind classes
      const result = cn("px-2 py-1", "px-4");
      // The exact result depends on the clsx/tailwind-merge implementation
      // This should resolve conflicts and keep the last px-4
      expect(result).toContain("px-4");
      expect(result).toContain("py-1");
      expect(result).not.toContain("px-2");
    });

    it("should handle object syntax", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toBe("class1 class3");
    });
    it("should handle mixed arguments", () => {
      const isDynamic = true;
      const result = cn(
        "base",
        {
          conditional: true,
          hidden: false,
        },
        "additional",
        undefined,
        isDynamic && "dynamic"
      );
      expect(result).toBe("base conditional additional dynamic");
    });

    it("should handle array of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle nested arrays and objects", () => {
      const result = cn([
        "base",
        {
          active: true,
          disabled: false,
        },
        ["nested1", "nested2"],
      ]);
      expect(result).toBe("base active nested1 nested2");
    });

    it("should return empty string for no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should return empty string for all falsy arguments", () => {
      const result = cn(false, null, undefined, "");
      expect(result).toBe("");
    });
    it("should handle complex Tailwind class merging scenarios", () => {
      // Test margin conflicts - twMerge handles conflicting classes by keeping the last one
      const result1 = cn("m-2", "m-4");
      expect(result1).toBe("m-4");

      // Test padding conflicts - specific padding combines with general padding
      const result2 = cn("p-1", "px-2", "py-3");
      expect(result2).toBe("p-1 px-2 py-3");

      // Test background conflicts - last background class should win
      const result3 = cn("bg-red-500", "bg-blue-500");
      expect(result3).toBe("bg-blue-500");

      // Test text size conflicts - last text size should win
      const result4 = cn("text-sm", "text-lg");
      expect(result4).toBe("text-lg");
    });

    it("should preserve non-conflicting classes", () => {
      const result = cn(
        "flex",
        "items-center",
        "justify-between",
        "p-4",
        "bg-white",
        "text-black",
        "rounded-lg",
        "shadow-md"
      );

      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).toContain("justify-between");
      expect(result).toContain("p-4");
      expect(result).toContain("bg-white");
      expect(result).toContain("text-black");
      expect(result).toContain("rounded-lg");
      expect(result).toContain("shadow-md");
    });

    it("should handle responsive classes correctly", () => {
      const result = cn("w-full", "md:w-1/2", "lg:w-1/3", "xl:w-1/4");

      expect(result).toContain("w-full");
      expect(result).toContain("md:w-1/2");
      expect(result).toContain("lg:w-1/3");
      expect(result).toContain("xl:w-1/4");
    });

    it("should handle state variants correctly", () => {
      const result = cn(
        "bg-blue-500",
        "hover:bg-blue-600",
        "focus:bg-blue-700",
        "active:bg-blue-800"
      );

      expect(result).toContain("bg-blue-500");
      expect(result).toContain("hover:bg-blue-600");
      expect(result).toContain("focus:bg-blue-700");
      expect(result).toContain("active:bg-blue-800");
    });
  });
});
