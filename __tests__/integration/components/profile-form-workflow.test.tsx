/**
 * Integration Test Cases for Profile Form Submission Workflows
 *
 * Profile update form integration:
 * - should handle complete profile update workflow from form to database ✅ (Fixed: Promise delay pattern)
 * - should integrate utility functions with form submission ✅
 * - should show appropriate loading states during submission ✅ (Fixed: Controlled async testing)
 * - should display success/error feedback after submission ✅ (Fixed: Toast duration expectation)
 * - should handle form validation before submission ✅
 *
 * Avatar generation workflow:
 * - should generate random avatar URL and update form state ✅
 * - should handle multiple random avatar generations ✅
 * - should integrate avatar generation with profile preview ✅
 *
 * Form state management integration:
 * - should maintain form state consistency during async operations ✅
 * - should handle user interactions during loading states ✅
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfileProvider } from "@/contexts/profile-context";
import { mockUser, mockProfile } from "../../__mocks__/supabase";
import type { Profile } from "@/lib/types/database";

// Mock router
const mockRouter = {
  refresh: jest.fn(),
  back: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "sonner";
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock profile client functions
jest.mock("@/lib/profile-client", () => ({
  updateProfile: jest.fn(),
}));

import { updateProfile } from "@/lib/profile-client";
const mockUpdateProfile = updateProfile as jest.MockedFunction<
  typeof updateProfile
>;

// Mock profile utils (already tested in unit tests)
jest.mock("@/lib/profile-utils", () => ({
  generateRandomAvatarUrl: jest.fn(() => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`;
  }),
  generateInitials: jest.fn((fullName: string, email: string) =>
    fullName.trim()
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : email[0].toUpperCase()
  ),
  sanitizeProfileData: jest.fn((data) => ({
    full_name: data.full_name.trim(),
    avatar_url: data.avatar_url.trim(),
  })),
}));

// Helper function to render components with ProfileProvider
const renderWithProfileProvider = (component: React.ReactElement) => {
  return render(<ProfileProvider>{component}</ProfileProvider>);
};

describe("Profile Form Workflow Integration", () => {
  const defaultProfile = {
    ...mockProfile,
    full_name: "John Doe",
    avatar_url: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Profile update form integration", () => {
    it("should handle complete profile update workflow from form to database", async () => {
      const user = userEvent.setup();

      // Mock successful update with delay to allow testing loading state
      let resolveUpdate: (value: {
        data: Profile | null;
        error: string | null;
      }) => void;
      const updatePromise = new Promise<{
        data: Profile | null;
        error: string | null;
      }>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      // Find and update the name field
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Smith");

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // Should show loading state immediately
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the update after verifying loading state
      act(() => {
        resolveUpdate({
          data: { ...defaultProfile, full_name: "Jane Smith" },
          error: null,
        });
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          full_name: "Jane Smith",
          avatar_url: "https://example.com/avatar.jpg",
        });
      });

      // Should show success feedback
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Profile updated successfully!"
        );
      });

      // Should refresh the router
      expect(mockRouter.refresh).toHaveBeenCalled();

      // Button should be enabled again
      expect(submitButton).not.toBeDisabled();
    });

    it("should integrate utility functions with form submission", async () => {
      const user = userEvent.setup();

      mockUpdateProfile.mockResolvedValue({
        data: { ...defaultProfile, full_name: "Test User" },
        error: null,
      });

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      // Update form fields
      const nameInput = screen.getByLabelText(/full name/i);

      await user.clear(nameInput);
      await user.type(nameInput, "  Test User  "); // With whitespace

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Should have called sanitizeProfileData to trim whitespace
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          full_name: "Test User",
          avatar_url: "https://example.com/avatar.jpg",
        });
      });
    });

    it("should show appropriate loading states during submission", async () => {
      const user = userEvent.setup();

      // Mock delayed response
      let resolveUpdate: (value: {
        data: Profile | null;
        error: string | null;
      }) => void;
      const updatePromise = new Promise<{
        data: Profile | null;
        error: string | null;
      }>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });

      // Submit form
      await user.click(submitButton);

      // Should immediately show loading state
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the update
      act(() => {
        resolveUpdate({ data: defaultProfile, error: null });
      });

      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should display success/error feedback after submission", async () => {
      const user = userEvent.setup();

      // Test error case
      mockUpdateProfile.mockResolvedValueOnce({
        data: null,
        error: "Database connection failed",
      });

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Failed to update profile",
          { description: "Database connection failed", duration: 8000 }
        );
      });

      // Test success case
      mockUpdateProfile.mockResolvedValueOnce({
        data: defaultProfile,
        error: null,
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Profile updated successfully!"
        );
      });
    });

    it("should handle form validation before submission", async () => {
      const user = userEvent.setup();

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      // Clear required field (though in this case no fields are strictly required)
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // Should still allow submission (name is optional)
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });
    });
  });

  describe("Avatar generation workflow", () => {
    it("should generate random avatar URL and update form state", async () => {
      const user = userEvent.setup();

      renderWithProfileProvider(
        <ProfileEditForm
          profile={{ ...defaultProfile, avatar_url: "" }}
        />
      );

      // Click random avatar button
      const generateButton = screen.getByRole("button", {
        name: /random avatar/i,
      });
      await user.click(generateButton);

      // Should show success toast
      expect(mockToast.success).toHaveBeenCalledWith("Random avatar generated!");

      // Avatar URL should be updated in the component state (check through form submission)
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            avatar_url: expect.stringContaining("api.dicebear.com/7.x/fun-emoji/svg?seed="),
          })
        );
      });
    });

    it("should handle multiple random avatar generations", async () => {
      const user = userEvent.setup();

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      // Click random avatar button multiple times
      const generateButton = screen.getByRole("button", {
        name: /random avatar/i,
      });
      
      await user.click(generateButton);
      expect(mockToast.success).toHaveBeenCalledWith("Random avatar generated!");

      await user.click(generateButton);
      expect(mockToast.success).toHaveBeenCalledTimes(2);

      // Each generation should produce a random avatar
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            avatar_url: expect.stringContaining("dicebear.com"),
          })
        );
      });
    });

    it("should integrate avatar generation with profile preview", async () => {
      const user = userEvent.setup();

      renderWithProfileProvider(
        <ProfileEditForm
          profile={{ ...defaultProfile, full_name: "Test Name" }}
        />
      );

      // Update name
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");

      // Should update the preview initials
      await waitFor(() => {
        // The initials should be updated to 'NN' for 'New Name'
        expect(screen.getByText("NN")).toBeInTheDocument();
      });

      // Generate random avatar
      const generateButton = screen.getByRole("button", {
        name: /random avatar/i,
      });
      await user.click(generateButton);

      // Verify avatar was generated by submitting form
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            full_name: "New Name",
            avatar_url: expect.stringContaining("fun-emoji"),
          })
        );
      });
    });
  });

  describe("Form state management integration", () => {
    it("should maintain form state consistency during async operations", async () => {
      const user = userEvent.setup();

      // Mock slow update
      let resolveUpdate: (value: {
        data: Profile | null;
        error: string | null;
      }) => void;
      const updatePromise = new Promise<{
        data: Profile | null;
        error: string | null;
      }>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      // Start form submission
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // Form should be in loading state
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Try to interact with form during loading
      expect(nameInput).not.toBeDisabled(); // Input should still be editable

      // Resolve the update
      act(() => {
        resolveUpdate({
          data: { ...defaultProfile, full_name: "Updated Name" },
          error: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should handle user interactions during loading states", async () => {
      const user = userEvent.setup();

      // Mock slow update
      let resolveUpdate: (value: {
        data: Profile | null;
        error: string | null;
      }) => void;
      const updatePromise = new Promise<{
        data: Profile | null;
        error: string | null;
      }>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      renderWithProfileProvider(<ProfileEditForm profile={defaultProfile} />);

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // Should be in loading state
      expect(submitButton).toBeDisabled();

      // Try to click submit again during loading
      await user.click(submitButton);

      // Should not trigger multiple calls
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);

      // Resolve update
      act(() => {
        resolveUpdate({ data: defaultProfile, error: null });
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
