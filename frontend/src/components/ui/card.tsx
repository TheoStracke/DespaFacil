import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card - Container principal
 * 
 * Componente de cartão para agrupar conteúdo relacionado
 * Suporta modo escuro e possui sombra sutil
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader - Cabeçalho do cartão
 * 
 * Área superior do card, geralmente contém título e descrição
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - Título do cartão
 * 
 * Título principal exibido no header
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - Descrição do cartão
 * 
 * Subtítulo ou descrição complementar no header
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - Conteúdo principal
 * 
 * Área central do card onde vai o conteúdo principal
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Rodapé do cartão
 * 
 * Área inferior do card, geralmente com ações/botões
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Título do Card</CardTitle>
 *     <CardDescription>Descrição opcional</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Conteúdo principal aqui
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Ação</Button>
 *   </CardFooter>
 * </Card>
 */

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
