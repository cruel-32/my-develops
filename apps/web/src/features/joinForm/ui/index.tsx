'use client';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Separator,
  CardFooter,
  ChevronLeft,
} from '@/shared/ui';
import { useJoinForm } from '../model/hook';

export function JoinForm() {
  const router = useRouter();
  const { form, onSubmit, isPending } = useJoinForm();

  const handleBack = () => {
    router.back();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join</CardTitle>
        <CardDescription>
          After completing account registration, administrator approval is
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="hello@sparta-devcamp.com" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <Separator />

      <CardFooter className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={handleBack}
            disabled={isPending}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
