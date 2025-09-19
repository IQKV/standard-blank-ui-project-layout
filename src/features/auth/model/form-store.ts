import { createStore } from "@/shared/lib/store";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordWithTokenInput,
} from "./validation";

export interface FormState {
  // Login form
  loginForm: {
    data: Partial<LoginInput>;
    isDirty: boolean;
    lastSaved: number | null;
  };

  // Registration form
  registerForm: {
    data: Partial<RegisterInput>;
    currentStep: number;
    completedSteps: number[];
    isDirty: boolean;
    lastSaved: number | null;
  };

  // Password reset forms
  forgotPasswordForm: {
    data: Partial<ForgotPasswordInput>;
    isDirty: boolean;
    lastSaved: number | null;
  };

  resetPasswordForm: {
    data: Partial<ResetPasswordWithTokenInput>;
    isDirty: boolean;
    lastSaved: number | null;
  };

  // Form UI state
  formErrors: {
    [formId: string]: {
      [fieldName: string]: string[];
    };
  };

  formTouched: {
    [formId: string]: {
      [fieldName: string]: boolean;
    };
  };

  // Auto-save settings
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
}

interface FormActions {
  // Login form actions
  updateLoginForm: (data: Partial<LoginInput>) => void;
  clearLoginForm: () => void;

  // Registration form actions
  updateRegisterForm: (data: Partial<RegisterInput>) => void;
  setRegisterStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  clearRegisterForm: () => void;

  // Password reset form actions
  updateForgotPasswordForm: (data: Partial<ForgotPasswordInput>) => void;
  clearForgotPasswordForm: () => void;

  updateResetPasswordForm: (data: Partial<ResetPasswordWithTokenInput>) => void;
  clearResetPasswordForm: () => void;

  // Form validation and error handling
  setFormErrors: (
    formId: string,
    errors: { [fieldName: string]: string[] }
  ) => void;
  clearFormErrors: (formId: string) => void;
  setFieldError: (formId: string, fieldName: string, errors: string[]) => void;
  clearFieldError: (formId: string, fieldName: string) => void;

  // Form touched state
  setFieldTouched: (
    formId: string,
    fieldName: string,
    touched?: boolean
  ) => void;
  setFormTouched: (
    formId: string,
    touched: { [fieldName: string]: boolean }
  ) => void;
  clearFormTouched: (formId: string) => void;

  // Auto-save configuration
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;

  // Bulk operations
  clearAllForms: () => void;
  saveFormDraft: (formId: string) => void;
  loadFormDraft: (formId: string) => void;
}

const initialState: FormState = {
  loginForm: {
    data: {},
    isDirty: false,
    lastSaved: null,
  },
  registerForm: {
    data: { locale: "en" }, // Default locale
    currentStep: 1,
    completedSteps: [],
    isDirty: false,
    lastSaved: null,
  },
  forgotPasswordForm: {
    data: {},
    isDirty: false,
    lastSaved: null,
  },
  resetPasswordForm: {
    data: {},
    isDirty: false,
    lastSaved: null,
  },
  formErrors: {},
  formTouched: {},
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
};

export const useFormStore = createStore<FormState & FormActions>(
  "form-store",
  (set) => ({
    ...initialState,

    // Login form actions
    updateLoginForm: (data: Partial<LoginInput>) =>
      set((state) => {
        state.loginForm.data = { ...state.loginForm.data, ...data };
        state.loginForm.isDirty = true;
        return state;
      }),

    clearLoginForm: () =>
      set((state) => {
        state.loginForm = {
          data: {},
          isDirty: false,
          lastSaved: null,
        };
        return state;
      }),

    // Registration form actions
    updateRegisterForm: (data: Partial<RegisterInput>) =>
      set((state) => {
        state.registerForm.data = { ...state.registerForm.data, ...data };
        state.registerForm.isDirty = true;
        return state;
      }),

    setRegisterStep: (step: number) =>
      set((state) => {
        state.registerForm.currentStep = step;
        return state;
      }),

    markStepCompleted: (step: number) =>
      set((state) => {
        if (!state.registerForm.completedSteps.includes(step)) {
          state.registerForm.completedSteps.push(step);
        }
        return state;
      }),

    clearRegisterForm: () =>
      set((state) => {
        state.registerForm = {
          data: { locale: "en" },
          currentStep: 1,
          completedSteps: [],
          isDirty: false,
          lastSaved: null,
        };
        return state;
      }),

    // Password reset form actions
    updateForgotPasswordForm: (data: Partial<ForgotPasswordInput>) =>
      set((state) => {
        state.forgotPasswordForm.data = {
          ...state.forgotPasswordForm.data,
          ...data,
        };
        state.forgotPasswordForm.isDirty = true;
        return state;
      }),

    clearForgotPasswordForm: () =>
      set((state) => {
        state.forgotPasswordForm = {
          data: {},
          isDirty: false,
          lastSaved: null,
        };
        return state;
      }),

    updateResetPasswordForm: (data: Partial<ResetPasswordWithTokenInput>) =>
      set((state) => {
        state.resetPasswordForm.data = {
          ...state.resetPasswordForm.data,
          ...data,
        };
        state.resetPasswordForm.isDirty = true;
        return state;
      }),

    clearResetPasswordForm: () =>
      set((state) => {
        state.resetPasswordForm = {
          data: {},
          isDirty: false,
          lastSaved: null,
        };
        return state;
      }),

    // Form validation and error handling
    setFormErrors: (
      formId: string,
      errors: { [fieldName: string]: string[] }
    ) =>
      set((state) => {
        state.formErrors[formId] = errors;
        return state;
      }),

    clearFormErrors: (formId: string) =>
      set((state) => {
        delete state.formErrors[formId];
        return state;
      }),

    setFieldError: (formId: string, fieldName: string, errors: string[]) =>
      set((state) => {
        if (!state.formErrors[formId]) {
          state.formErrors[formId] = {};
        }
        state.formErrors[formId][fieldName] = errors;
        return state;
      }),

    clearFieldError: (formId: string, fieldName: string) =>
      set((state) => {
        if (state.formErrors[formId]) {
          delete state.formErrors[formId][fieldName];
          if (Object.keys(state.formErrors[formId]).length === 0) {
            delete state.formErrors[formId];
          }
        }
        return state;
      }),

    // Form touched state
    setFieldTouched: (formId: string, fieldName: string, touched = true) =>
      set((state) => {
        if (!state.formTouched[formId]) {
          state.formTouched[formId] = {};
        }
        state.formTouched[formId][fieldName] = touched;
        return state;
      }),

    setFormTouched: (
      formId: string,
      touched: { [fieldName: string]: boolean }
    ) =>
      set((state) => {
        state.formTouched[formId] = touched;
        return state;
      }),

    clearFormTouched: (formId: string) =>
      set((state) => {
        delete state.formTouched[formId];
        return state;
      }),

    // Auto-save configuration
    setAutoSaveEnabled: (enabled: boolean) =>
      set((state) => {
        state.autoSaveEnabled = enabled;
        return state;
      }),

    setAutoSaveInterval: (interval: number) =>
      set((state) => {
        state.autoSaveInterval = interval;
        return state;
      }),

    // Bulk operations
    clearAllForms: () =>
      set((state) => {
        Object.assign(state, initialState);
        return state;
      }),

    saveFormDraft: (formId: string) =>
      set((state) => {
        const now = Date.now();
        switch (formId) {
          case "login":
            state.loginForm.lastSaved = now;
            state.loginForm.isDirty = false;
            break;
          case "register":
            state.registerForm.lastSaved = now;
            state.registerForm.isDirty = false;
            break;
          case "forgotPassword":
            state.forgotPasswordForm.lastSaved = now;
            state.forgotPasswordForm.isDirty = false;
            break;
          case "resetPassword":
            state.resetPasswordForm.lastSaved = now;
            state.resetPasswordForm.isDirty = false;
            break;
        }
        return state;
      }),

    loadFormDraft: (formId: string) => {
      // This would typically load from localStorage or another persistence layer
      // For now, it's a placeholder for the functionality
      console.log(`Loading draft for form: ${formId}`);
    },
  })
);

// Selectors for optimized subscriptions
export const useLoginForm = () =>
  useFormStore((state) => ({
    data: state.loginForm.data,
    isDirty: state.loginForm.isDirty,
    lastSaved: state.loginForm.lastSaved,
    update: state.updateLoginForm,
    clear: state.clearLoginForm,
    errors: state.formErrors["login"] || {},
    touched: state.formTouched["login"] || {},
  }));

export const useRegisterForm = () =>
  useFormStore((state) => ({
    data: state.registerForm.data,
    currentStep: state.registerForm.currentStep,
    completedSteps: state.registerForm.completedSteps,
    isDirty: state.registerForm.isDirty,
    lastSaved: state.registerForm.lastSaved,
    update: state.updateRegisterForm,
    setStep: state.setRegisterStep,
    markStepCompleted: state.markStepCompleted,
    clear: state.clearRegisterForm,
    errors: state.formErrors["register"] || {},
    touched: state.formTouched["register"] || {},
  }));

export const useForgotPasswordForm = () =>
  useFormStore((state) => ({
    data: state.forgotPasswordForm.data,
    isDirty: state.forgotPasswordForm.isDirty,
    lastSaved: state.forgotPasswordForm.lastSaved,
    update: state.updateForgotPasswordForm,
    clear: state.clearForgotPasswordForm,
    errors: state.formErrors["forgotPassword"] || {},
    touched: state.formTouched["forgotPassword"] || {},
  }));

export const useResetPasswordForm = () =>
  useFormStore((state) => ({
    data: state.resetPasswordForm.data,
    isDirty: state.resetPasswordForm.isDirty,
    lastSaved: state.resetPasswordForm.lastSaved,
    update: state.updateResetPasswordForm,
    clear: state.clearResetPasswordForm,
    errors: state.formErrors["resetPassword"] || {},
    touched: state.formTouched["resetPassword"] || {},
  }));

export const useFormValidation = () =>
  useFormStore((state) => ({
    setFormErrors: state.setFormErrors,
    clearFormErrors: state.clearFormErrors,
    setFieldError: state.setFieldError,
    clearFieldError: state.clearFieldError,
    setFieldTouched: state.setFieldTouched,
    setFormTouched: state.setFormTouched,
    clearFormTouched: state.clearFormTouched,
  }));
