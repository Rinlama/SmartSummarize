/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "@/layout/Header";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useAlertMessage } from "@/context/AlertMessageContext";
import { useEffect } from "react";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
});

function Settings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });
  const { user } = useAuth();
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/protected/user/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.ssToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      form.setValue("apiKey", response.data.geminiApiKey);
    } catch (error: any) {
      setAlertMessage({
        show: true,
        title: "Error",
        description: error.message,
        position: "top",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setAlertMessage({
      show: true,
      position: "top",
      title: "Error updating user",
      description: "sd",
    });
    try {
      await axios.put(
        "http://localhost:3000/api/protected/user/update",
        {
          geminiApiKey: values.apiKey,
          googleId: user?.googleId,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.ssToken}`, // Replace with your actual token
            "Content-Type": "application/json",
          },
        }
      );

      setAlertMessage({
        show: true,
        title: "Info",
        description: "User updated successfully",
        position: "top",
        type: "success",
      });
    } catch (error: any) {
      setAlertMessage({
        show: true,
        title: "Error updating user",
        description: error.message,
        position: "top",
      });
    }
  };

  return (
    <div>
      <Header />
      <div className="max-h-[80] px-3 flex flex-col items-center pt-14 min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm mx-10">
          <h1 className="text-2xl text-gray-700 mb-4 font-sans">Settings</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="API Key is required"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={!form.formState.isValid}
                type="submit"
                variant={"outline"}
              >
                Save
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
