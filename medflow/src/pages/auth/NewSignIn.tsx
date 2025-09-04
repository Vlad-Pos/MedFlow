import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../../components/ui/core/Button/Button";
import ValidatedInput from "../../components/auth/ValidatedInput";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/layout/Card/Card";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Sign in data:", data);
      // TODO: Integrate with MedFlow AuthProvider
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    console.log(`${provider} sign in clicked`);
    // TODO: Implement social authentication
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // TODO: Navigate to password reset
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">Welcome back</CardTitle>
          <p className="text-gray-300">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Authentication */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              size="md"
              onClick={() => handleSocialSignIn("Google")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handleSocialSignIn("GitHub")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
          
          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">or continue with email</span>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedInput
              type="email"
              name="email"
              value={form.watch("email")}
              onChange={(value) => form.setValue("email", value)}
              label="Email"
              placeholder="Enter your email address"
              icon="email"
              required
              validateFn={(value) => {
                const result = signInSchema.safeParse({ email: value, password: form.watch("password") });
                return {
                  isValid: result.success,
                  errors: result.success ? [] : [result.error.issues[0].message]
                };
              }}
            />
            
            <ValidatedInput
              type="password"
              name="password"
              value={form.watch("password")}
              onChange={(value) => form.setValue("password", value)}
              label="Password"
              placeholder="Enter your password"
              icon="lock"
              required
              showToggle
              validateFn={(value) => {
                const result = signInSchema.safeParse({ email: form.watch("email"), password: value });
                return {
                  isValid: result.success,
                  errors: result.success ? [] : [result.error.issues[0].message]
                };
              }}
            />
            
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
            
            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link 
                  to="/new-signup" 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
