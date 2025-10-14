'use client';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
} from '@/web/shared/ui';
import { useLoginForm } from './model/hook';

export const LoginForm = () => {
  const router = useRouter();
  const { form, onSubmit, isPending } = useLoginForm();

  const handleNavigate = () => {
    // '/dashboard' 경로로 사용자를 이동시킵니다.
    router.push('/join');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="super_admin@mydevelops.com"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Don&apos;t have an account?</span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={handleNavigate}
            disabled={isPending}
          >
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
