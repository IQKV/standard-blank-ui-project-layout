import { useQueryClient } from "@tanstack/react-query";
import { useAuthRegister } from "@/entities/auth";
import { userKeys } from "@/entities/user";
import type { RegisterInput } from "@/features/auth";

// Cross-entity process: User onboarding
// This handles the complex business process of user registration and initial setup

export const useUserOnboardingProcess = () => {
  const queryClient = useQueryClient();
  const registerMutation = useAuthRegister();
  
  return {
    ...registerMutation,
    mutateAsync: async (registerData: RegisterInput) => {
      // Step 1: Register the user
      const result = await registerMutation.mutateAsync(registerData);
      
      // Step 2: Could trigger additional onboarding steps
      // - Send welcome email
      // - Create user preferences
      // - Initialize user workspace
      // - Track registration analytics
      
      // Step 3: Prepare for potential auto-login
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      
      return result;
    },
  };
};