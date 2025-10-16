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
  CardFooter,
  ChevronLeft,
} from '@/web/shared/ui';
import { useJoinForm } from './model/hook';

export function JoinForm() {
  const router = useRouter();
  const { form, onSubmit, isPending } = useJoinForm();

  const handleBack = () => {
    router.back();
  };

  return (
    <Form {...form}>
      <form
        id="join-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Join</CardTitle>
            <CardDescription>
              After completing account registration, administrator approval is
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="cursor-pointer hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              type="submit"
              form="join-form"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
