import { QueryClient } from "@tanstack/react-query";
import { AppConfig } from "@/app";

export const queryClient = new QueryClient(AppConfig.reactQueryConfig);
