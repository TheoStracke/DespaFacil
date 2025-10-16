/**
 * UI Components - Biblioteca de componentes reutilizáveis
 * 
 * Importações centralizadas para facilitar o uso
 */

// Button
export { Button, buttonVariants } from "./button"
export type { ButtonProps } from "./button"

// Input
export { Input } from "./input"
export type { InputProps } from "./input"

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card"

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table"

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"

// Badge
export { Badge, StatusBadge, badgeVariants, getStatusBadgeVariant } from "./badge"
export type { BadgeProps } from "./badge"

// Toast
export { ToastProvider, useToast } from "./toast"
