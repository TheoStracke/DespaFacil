import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Table - Container da tabela
 * 
 * Tabela responsiva com scroll horizontal
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/**
 * TableHeader - Cabeçalho da tabela
 * 
 * Contém as linhas de cabeçalho (thead)
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "border-b bg-muted/50 sticky top-0 z-10",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

/**
 * TableBody - Corpo da tabela
 * 
 * Contém as linhas de dados (tbody)
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

/**
 * TableFooter - Rodapé da tabela
 * 
 * Área de totais ou resumos (tfoot)
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/**
 * TableRow - Linha da tabela
 * 
 * Linhas alternadas com hover effect
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      "even:bg-muted/20", // Linhas alternadas
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

/**
 * TableHead - Célula de cabeçalho
 * 
 * Células do thead com texto alinhado e peso médio
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

/**
 * TableCell - Célula de dados
 * 
 * Células do tbody com padding padrão
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/**
 * TableCaption - Legenda da tabela
 * 
 * Descrição ou título da tabela (caption)
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

/**
 * @example
 * <Table>
 *   <TableCaption>Lista de motoristas</TableCaption>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Nome</TableHead>
 *       <TableHead>CPF</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>João Silva</TableCell>
 *       <TableCell>123.456.789-00</TableCell>
 *       <TableCell>Ativo</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
