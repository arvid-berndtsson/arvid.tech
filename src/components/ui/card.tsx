import * as React from "react";

import { cn } from "@/lib/utils";

const CardContext = React.createContext<"default" | "sm">("default");

interface CardProps extends React.ComponentProps<"div"> {
  size?: "default" | "sm";
}

function Card({ className, size = "default", ...props }: CardProps) {
  return (
    <CardContext.Provider value={size}>
      <div
        data-slot="card"
        data-size={size}
        className={cn(
          "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
          size === "sm" ? "gap-4 py-4" : "gap-6 py-6",
          className,
        )}
        {...props}
      />
    </CardContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardContext);
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        size === "sm" ? "px-4" : "px-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardContext);
  return (
    <div
      data-slot="card-content"
      className={cn(size === "sm" ? "px-4" : "px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardContext);
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center [.border-t]:pt-6",
        size === "sm" ? "px-4" : "px-6",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
