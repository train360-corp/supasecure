"use client";

import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRealtimeData } from "@/lib/supabase/realtime";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/clients/browser";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Row } from "@train360-corp/supasecure";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";



const envSchema = z.object({
  value: z.string().regex(/^[A-Za-z].*[A-Za-z]$/, "Must start and end with a letter")
});

const varSchema = z.object({
  value: z.string().regex(/^[A-Z_][A-Z0-9_]*$/, "Must start with A-Z or _, followed by A-Z, 0-9, or _")
});

const CreateEnvDialog = (props: {
  workspace: Pick<Row<"workspaces">, "id">
}) => {

  const supabase = createClient();
  const [ open, setOpen ] = useState(false);
  const form = useForm<z.infer<typeof envSchema>>({
    resolver: zodResolver(envSchema),
    defaultValues: {
      value: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={(open) => {
      form.reset();
      setOpen(open);
    }}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        <Button
          className={"w-[250px]"}
          variant={"ghost"}
          size={"icon"}
        >
          <Plus/>
          {"Add Environment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(async ({ value }) => await supabase
            .from("environments")
            .insert({
              display: value,
              workspace_id: props.workspace.id
            })
            .then(({ error }) => {
              if (error) toast.error("Unable to Create Environment!", {
                description: error.message,
              });
              else setOpen(false);
            }))}>
            <DialogHeader>
              <DialogTitle>{"Add Environment"}</DialogTitle>
              <DialogDescription>
                {"Enter a display value below"}
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-2 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <FormLabel>{"Display"}</FormLabel>
                      <FormControl className="col-span-3">
                        <Input placeholder="Prod" {...field} />
                      </FormControl>
                      <div/>
                      <FormMessage className="col-span-3"/>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{"Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const CreateVarDialog = (props: {
  workspace: Pick<Row<"workspaces">, "id">
}) => {

  const supabase = createClient();
  const [ open, setOpen ] = useState(false);
  const form = useForm<z.infer<typeof envSchema>>({
    resolver: zodResolver(varSchema),
    defaultValues: {
      value: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={(open) => {
      form.reset();
      setOpen(open);
    }}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        <Button
          className={"w-full"}
          variant={"ghost"}
          size={"icon"}
        >
          <Plus/>
          {"Add Variable"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(async ({ value }) => await supabase
            .from("variables")
            .insert({
              display: value,
              workspace_id: props.workspace.id,
            })
            .then(({ error }) => {
              if (error) toast.error("Unable to Create Variable!", {
                description: error.message,
              });
              else setOpen(false);
            })
          )}>
            <DialogHeader>
              <DialogTitle>{"Add Variable"}</DialogTitle>
              <DialogDescription>
                {"Enter an environment variable name below"}
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-2 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <FormLabel>{"Display"}</FormLabel>
                      <FormControl className="col-span-3">
                        <Input placeholder="API_KEY" {...field} />
                      </FormControl>
                      <div/>
                      <FormMessage className="col-span-3"/>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{"Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


export default function Page() {

  const { id }: { id: string } = useParams();
  const supabase = createClient();

  const environments = useRealtimeData.Many({
    table: "environments",
    filter: query => query.eq("workspace_id", id)
  }, [ id ]);

  const variables = useRealtimeData.Many({
    table: "variables",
    filter: query => query.eq("workspace_id", id)
  }, [ id ]);

  const secrets = useRealtimeData.Many({
    table: "secrets",
    filter: query => query.eq("workspace_id", id)
  }, [ id ]);

  console.log({
    variables,
    environments
  });

  return (
    <div className={"p-4"}>
      <Card>
        <Table>
          <TableCaption>{`Workspace ${id}`}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead/>
              {environments.result?.data?.map(env => (
                <TableHead className={"align-middle items-center"} key={`Head:${env.id}`}>
                  <div className="flex w-[250px] flex-row items-center justify-center gap-2">                    <p>{env.display}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size={"icon"} className="p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(env.id)}
                        >
                          {"Copy ID"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => supabase.from("environments").delete().eq("id", env.id).then(({error}) => {
                            if (error) toast.error("Unable to Delete Environment!", {
                              description: error.message,
                            });
                          })}
                        >
                          {"Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
              ))}
              <TableHead>
                <CreateEnvDialog workspace={{ id }}/>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.result === undefined ? (
              <></>
            ) : (
              (variables.result.data ?? []).map((v) => (
                <TableRow key={v.id}>
                  <TableCell className={"max-w-[150px]"}>
                    <div className={"flex flex-row items-center"}>
                      <p className={"font-medium truncate"}>{v.display}</p>
                      <div className={"flex-1"} />
                      <Button variant="ghost" size={"icon"} className="p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal/>
                      </Button>
                    </div>
                  </TableCell>
                  {environments.result?.data?.map(env => (
                    <TableCell key={`${v.id}:${env.id}`}>
                      {secrets.result?.data?.find(s => s.environment_id === env.id && s.variable_id === v.id)?.id}
                    </TableCell>
                  ))}
                  <TableCell/>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className={"p-0"}>
            <TableRow>
              <TableCell className={"p-0"}>
                <CreateVarDialog workspace={{ id }}/>
              </TableCell>
              <TableCell colSpan={(environments.result?.data?.length ?? 0) + 1}/>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  );
}