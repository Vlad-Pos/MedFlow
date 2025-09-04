import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../../components/ui/core/Button/Button";
import ValidatedInput from "../../components/auth/ValidatedInput";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/layout/Card/Card";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Sign up data:", data);
      // TODO: Integrate with MedFlow AuthProvider
    } catch (error) {
      console.error("Sign up failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`${provider} sign up clicked`);
    // TODO: Implement social authentication
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">Create an account</CardTitle>
          <p className="text-gray-300">
            Enter your details below to create your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Authentication */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              size="md"
              onClick={() => handleSocialSignUp("Google")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handleSocialSignUp("GitHub")}
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
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                type="text"
                name="firstName"
                value={form.watch("firstName")}
                onChange={(value) => form.setValue("firstName", value)}
                label="First name"
                placeholder="Enter your first name"
                icon="user"
                required
                validateFn={(value) => {
                  const result = signUpSchema.safeParse({ 
                    ...form.getValues(), 
                    firstName: value 
                  });
                  return {
                    isValid: result.success,
                    errors: result.success ? [] : [result.error.issues[0].message]
                  };
                }}
              />
              
              <ValidatedInput
                type="text"
                name="lastName"
                value={form.watch("lastName")}
                onChange={(value) => form.setValue("lastName", value)}
                label="Last name"
                placeholder="Enter your last name"
                icon="user"
                required
                validateFn={(value) => {
                  const result = signUpSchema.safeParse({ 
                    ...form.getValues(), 
                    lastName: value 
                  });
                  return {
                    isValid: result.success,
                    errors: result.success ? [] : [result.error.issues[0].message]
                  };
                }}
              />
            </div>
            
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
                const result = signUpSchema.safeParse({ 
                  ...form.getValues(), 
                  email: value 
                });
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
                const result = signUpSchema.safeParse({ 
                  ...form.getValues(), 
                  password: value 
                });
                return {
                  isValid: result.success,
                  errors: result.success ? [] : [result.error.issues[0].message]
                };
              }}
            />
            
            <ValidatedInput
              type="password"
              name="confirmPassword"
              value={form.watch("confirmPassword")}
              onChange={(value) => form.setValue("confirmPassword", value)}
              label="Confirm password"
              placeholder="Confirm your password"
              icon="lock"
              required
              showToggle
              validateFn={(value) => {
                const result = signUpSchema.safeParse({ 
                  ...form.getValues(), 
                  confirmPassword: value 
                });
                return {
                  isValid: result.success,
                  errors: result.success ? [] : [result.error.issues[0].message]
                };
              }}
            />
            
            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link 
                  to="/new-signin" 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
