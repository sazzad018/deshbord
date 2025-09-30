import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, LogIn } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result;
    },
    onSuccess: () => {
      setError("");
      onLoginSuccess();
    },
    onError: (err: any) => {
      setError(err.message || "লগইন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    },
  });

  const onSubmit = (data: LoginInput) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-purple-100">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            এডমিন লগইন
          </CardTitle>
          <CardDescription className="text-base">
            আপনার অ্যাকাউন্টে লগইন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                ইউজারনেম
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="আপনার ইউজারনেম লিখুন"
                  className="pl-10 h-11"
                  data-testid="input-username"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="pl-10 h-11"
                  data-testid="input-password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold mt-6"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  লগইন হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  লগইন করুন
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Social Ads Expert CRM - Admin Panel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
